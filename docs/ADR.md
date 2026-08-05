# ADR-001: Service Layer Architecture Design for SIAGA Backend

## Status
Accepted

## Date
2026-08-04

## Context

Berdasarkan Software Design Document (SDD), Software Requirements Specification (SRS), Database Design Document (DDD), dan API Specification, SIAGA membutuhkan Service Layer sebagai lapisan yang menangani business logic backend.

Sebelumnya, tanggung jawab backend belum memiliki keputusan arsitektur formal mengenai:

- batas tanggung jawab Service Layer
- hubungan antara Controller, Service, dan Repository
- pembagian service berdasarkan resource API
- transaction boundary
- error handling
- validation responsibility
- logging responsibility
- kesiapan integrasi fitur masa depan seperti MQTT dan AI Layer

ADR ini menetapkan desain Service Layer agar implementasi backend konsisten dengan arsitektur yang telah dirancang.


---

# Decision

## 1. Service Layer Responsibility

Service Layer bertanggung jawab untuk:

1. Menjalankan business logic pada sisi backend.

   Referensi:
   - SDD §3.2 Backend Module Design

2. Melakukan orchestration antara Controller Layer dan Repository Layer.

3. Melakukan business-rule validation sebelum data disimpan.

4. Mengimplementasikan aturan bisnis dari SRS §6, termasuk:

   - Auto-registration device
   - Alert derivation
   - Device status update
   - Sensor data processing

5. Mengelola operasi yang membutuhkan beberapa repository dalam satu proses transaksi.

6. Tidak memiliki tanggung jawab terhadap HTTP.

   Controller bertanggung jawab terhadap:
   - request handling
   - response formatting
   - HTTP status code

   Service bertanggung jawab terhadap:
   - business flow
   - orchestration
   - domain operation


---

# 2. Required Services

Berdasarkan API Specification §6, SIAGA menggunakan empat Service utama.


## DeviceService

Responsibility:

Mengelola lifecycle device.

Meliputi:

- mendapatkan daftar device
- mendapatkan detail device
- melakukan auto-registration device
- memperbarui status device


Mapping:

API §6.1 Devices


---

## SensorDataService

Responsibility:

Menjadi service utama untuk proses sensor data.


Meliputi:

- menerima sensor data
- menyimpan sensor reading
- mengambil data terbaru
- mengambil history sensor
- menjalankan proses alert derivation
- melakukan device auto-registration


Mapping:

API §6.2 Sensor Data


Catatan:

SensorDataService merupakan service paling kompleks karena melakukan orchestration multi repository.


---

## AlertService

Responsibility:

Mengelola resource alert secara read-only.

Meliputi:

- mengambil daftar alert
- mengambil detail alert


Catatan:

Alert bukan dibuat melalui endpoint eksternal.

Alert dibuat secara internal oleh SensorDataService ketika sensor_data memiliki status:

- WARNING
- DANGER


Mapping:

API §6.3 Alerts


---

## SystemStatusService

Responsibility:

Menghasilkan informasi ringkasan status sistem untuk dashboard.


Mapping:

API §6.4 System Status


Catatan:

Service ini dapat digabungkan dengan DeviceService, tetapi dipisahkan agar resource system/status tetap memiliki boundary sendiri.


---

# 3. Service Boundary Decision


## DeviceService

Menggunakan DeviceRepository.

Public responsibility:

- Query device
- Register device
- Update device status


Method:

getAllDevices(?string $status)

getDeviceByDeviceId(string $deviceId)

registerOrUpdateDevice(string $deviceId, array $data)


---

## SensorDataService

Merupakan pusat ingestion flow.


Tanggung jawab:

- menerima sensor payload
- memastikan device tersedia
- menyimpan sensor data
- membuat alert
- update device status
- mencatat log


Method:

storeSensorData(
    string $deviceId,
    array $payload
)


getLatestSensorData(
    string $deviceId
)


getSensorDataHistory(
    string $deviceId,
    Carbon $startDate,
    Carbon $endDate,
    int $perPage = 50
)


---

## AlertService

Method:

getAllAlerts(
    ?string $deviceId,
    ?string $status,
    ?Carbon $startDate,
    ?Carbon $endDate,
    int $perPage = 20
)


getAlertById(int $id)


---

## SystemStatusService

Method:

getSystemStatus()


---

# 4. Repository Dependency


Service hanya boleh mengakses Repository Interface.

Service tidak boleh melakukan query database secara langsung.


Dependency mapping:


DeviceService:

    DeviceRepositoryInterface


SensorDataService:

    SensorDataRepositoryInterface
    DeviceRepositoryInterface
    AlertRepositoryInterface
    SystemLogRepositoryInterface


AlertService:

    AlertRepositoryInterface


SystemStatusService:

    DeviceRepositoryInterface



---

# 5. Primary Write Flow Decision

Endpoint utama:

POST /sensor-data


Flow:


Controller
    |
    v
SensorDataController@store

    |
    v

FormRequest Validation

    |
    v

SensorDataService::storeSensorData()

    |
    v

BEGIN TRANSACTION


    |
    +--> DeviceRepository::findByDeviceId()

            |
            +--> Jika device tidak ditemukan:

                 DeviceRepository::create()

                 (auto-registration)


    |
    +--> DeviceRepository::updateLastSeen()

            status = online


    |
    +--> SensorDataRepository::create()


    |
    +--> Jika status WARNING/DANGER:

            AlertRepository::create()


    |
    v

COMMIT TRANSACTION


    |
    v

Return HTTP 201 Created



---

# 6. Transaction Boundary Decision


Hanya operasi ingestion yang menggunakan transaction.


Transaction diperlukan pada:


SensorDataService::storeSensorData()


Karena proses berikut harus atomic:

- device registration
- device status update
- sensor data creation
- alert creation


Jika salah satu gagal:

Semua perubahan harus rollback.


Implementasi:

DB::transaction()


Alasan:

Memenuhi:

- NFR-004 No Data Loss
- SRS Business Rule #5 Data Consistency



---

# 7. Dependency Injection Decision


Semua service menggunakan constructor injection.


Service binding dilakukan pada AppServiceProvider.


Binding:


DeviceServiceInterface
        ->
DeviceService


SensorDataServiceInterface
        ->
SensorDataService


AlertServiceInterface
        ->
AlertService


SystemStatusServiceInterface
        ->
SystemStatusService



Lokasi:


app/Services/

app/Services/Contracts/


Pattern:

Interface + Implementation + Dependency Injection


Mengikuti pola Repository Layer.


---

# 8. Error Handling Decision


Service Layer tidak boleh mengembalikan HTTP Response.


Service hanya:

- return domain object
- throw exception


Exception handling:


ModelNotFoundException

    -> HTTP 404


ValidationException

    -> HTTP 422


DatabaseException / Throwable

    -> HTTP 500



Centralized Exception Handler bertanggung jawab melakukan mapping.


Transaction rollback dilakukan jika terjadi exception.


---

# 9. Validation Responsibility


Validation dibagi menjadi tiga layer.


## FormRequest Layer

Bertanggung jawab terhadap:

- required field
- data type
- enum value
- date range


Contoh:

status:

NORMAL
WARNING
DANGER


connection status:

online
offline



---

## Service Layer

Bertanggung jawab terhadap business validation:


- Apakah device sudah ada?
- Apakah perlu auto-registration?
- Apakah status menghasilkan alert?
- Apakah device harus menjadi online?


---

## Repository Layer

Tidak melakukan validation.

Repository hanya bertugas:

- persistence
- query


---

# 10. Business Rule Enforcement


Service Layer menerapkan:


## Status Rule

Sensor status:

NORMAL
WARNING
DANGER


Alert status:

WARNING
DANGER


Device status:

online
offline



---

## Alert Derivation Rule

Jika:

sensor_data.status == WARNING

atau

sensor_data.status == DANGER


Maka:

buat record alert.



---

## Auto Registration Rule

Jika device_id belum ada:

buat device baru.


Jika device sudah ada:

update:

- status = online
- last_seen_at


---

## Historical Data Rule

Sensor data bersifat immutable.


Tidak tersedia:

- update sensor data
- delete sensor data


---

# 11. Logging Decision


Service Layer harus melakukan logging terhadap:


## Successful ingestion

Data:

- device_id
- sensor_data_id
- status


---

## Alert creation

Data:

- device_id
- alert_id
- alert status


---

## Auto registration

Data:

- device_id


---

## Error

Data:

- device_id
- error context


---

Logging menggunakan:

- Laravel Log facade
- SystemLogRepositoryInterface


system_logs tetap internal dan tidak diekspos sebagai REST API.



---

# 12. Future Scalability Decision


Desain Service Layer dibuat agar mudah dikembangkan.


## Multi Device

Service menggunakan:

device_id

sebagai business key.


---

## AI Integration

SensorDataService menyediakan:

history sensor data


yang dapat digunakan Future AI Layer.


Tidak membutuhkan perubahan struktur service.


---

## MQTT Integration

Jika HTTP diganti MQTT:

Consumer baru dapat langsung menggunakan:


SensorDataService::storeSensorData()


tanpa mengubah business logic.


---

## Authentication

Penambahan:

- Sanctum
- API Key
- Middleware


tidak mempengaruhi Service Layer.


---

## Additional Sensor

Penambahan sensor hanya membutuhkan perubahan:

- validation
- repository


Service orchestration tetap sama.



---

# 13. Identified Documentation Issues


## Issue 1: Device Status Update During Ingestion


Problem:

API Specification menyebut:

device status dan last_seen_at diperbarui ketika menerima data.


Namun payload sensor-data tidak memiliki connection status.


Resolution:

Service Layer menetapkan:


devices.status = online


ketika sensor data berhasil diterima.


Alasan:

Device terbukti aktif karena berhasil mengirim data.


---

## Issue 2: Device Name During Auto Registration


Problem:

Auto-registration membutuhkan:

devices.name


Namun sensor payload hanya memiliki:

device_id


Resolution:


Service Layer memberikan default name:


device_id


atau:


"Device {device_id}"


---

## Issue 3: Validation Layer Placement


Problem:

Dokumentasi memiliki interpretasi berbeda mengenai validation placement.


Resolution:


FormRequest:

structural validation


Service:

business validation



---

## Issue 4: System Log Convention


Problem:

Trigger logging belum memiliki aturan detail.


Resolution:


Service Layer harus mendefinisikan event logging convention pada tahap implementasi.


---

# Consequences


## Positive Consequences

- Business logic terisolasi dari Controller
- Repository tetap fokus pada persistence
- Testing service menjadi lebih mudah
- Mendukung MQTT dan AI integration
- Transaction lebih aman
- Arsitektur mengikuti SDD


## Negative Consequences

- Jumlah class bertambah
- Membutuhkan dependency injection setup
- Beberapa operasi sederhana membutuhkan layer tambahan


---

# Implementation Notes


Struktur folder:


app/

 ├── Services/

 │    ├── Contracts/

 │    │    ├── DeviceServiceInterface.php

 │    │    ├── SensorDataServiceInterface.php

 │    │    ├── AlertServiceInterface.php

 │    │    └── SystemStatusServiceInterface.php

 │

 │    ├── DeviceService.php

 │    ├── SensorDataService.php

 │    ├── AlertService.php

 │    └── SystemStatusService.php



---

# Final Decision

SIAGA menggunakan Service Layer Pattern dengan empat service utama:

1. DeviceService
2. SensorDataService
3. AlertService
4. SystemStatusService


SensorDataService menjadi orchestration service utama karena menangani ingestion pipeline yang melibatkan banyak repository dan membutuhkan transaction boundary.


Seluruh service tidak memiliki ketergantungan terhadap HTTP dan hanya berkomunikasi melalui Repository Interface.

---

# Implementation Status — ADR-001

## Status: Completed / Approved

## Validation

- Repository contracts implemented.
- Repository implementations completed.
- Dependency Injection bindings added in AppServiceProvider.
- Repository layer follows Interface + Implementation pattern.
- Repository layer contains only persistence logic.
- N+1 issue in `DeviceRepository::getSystemStatus()` was resolved using correlated subquery.
- Repository smoke test passed:
  - **52/52 tests passed.**

---

# ADR-002: Service Layer Implementation Strategy for SIAGA Backend

## Status
Accepted

## Date
2026-08-04

## Related Documents

- ADR-XXX: Service Layer Architecture Design
- Software Design Document (SDD)
- Software Requirements Specification (SRS)
- Database Design Document (DDD)
- API Specification


---

# Context

Berdasarkan ADR Service Layer Architecture, SIAGA Backend membutuhkan implementasi Service Layer sebagai lapisan business logic antara Controller Layer dan Repository Layer.

Implementasi Service Layer harus mengikuti keputusan berikut:

- Menggunakan Service Contract (Interface) dan Service Implementation.
- Service tidak memiliki tanggung jawab terhadap HTTP.
- Semua persistence dilakukan melalui Repository Interface.
- Business logic berada di Service Layer.
- Transaction hanya digunakan pada proses ingestion sensor data.
- Exception dilempar dari Service dan diproses oleh centralized Exception Handler.


Repository Layer saat ini sudah memenuhi kebutuhan Service Layer.

Tidak diperlukan perubahan pada:

- Repository Interface
- Repository Implementation
- Database Model
- Migration
- Eloquent Model


---

# Decision

## 1. Service Structure

SIAGA menggunakan empat Service utama:


## 1. DeviceService

Location:

app/Services/DeviceService.php

Contract:

app/Services/Contracts/DeviceServiceInterface.php


Responsibility:

Mengelola lifecycle device.


Mencakup:

- mengambil daftar device
- mengambil detail device
- auto-registration device
- update device status


---

## 2. SensorDataService

Location:

app/Services/SensorDataService.php

Contract:

app/Services/Contracts/SensorDataServiceInterface.php


Responsibility:

Menjadi core orchestration service untuk sensor ingestion.


Mencakup:

- menerima sensor payload
- memastikan device tersedia
- auto-registration device
- menyimpan sensor data
- melakukan alert derivation
- update device status
- logging ingestion


SensorDataService merupakan service paling kompleks karena melibatkan:

- DeviceRepository
- SensorDataRepository
- AlertRepository
- SystemLogRepository


---

## 3. AlertService

Location:

app/Services/AlertService.php

Contract:

app/Services/Contracts/AlertServiceInterface.php


Responsibility:

Mengelola resource alert secara read-only.


Mencakup:

- mengambil daftar alert
- filter alert
- mengambil detail alert


Alert tidak dibuat melalui AlertService.

Alert hanya dibuat melalui:

SensorDataService::storeSensorData()


ketika status sensor:

- WARNING
- DANGER


---

## 4. SystemStatusService

Location:

app/Services/SystemStatusService.php

Contract:

app/Services/Contracts/SystemStatusServiceInterface.php


Responsibility:

Menghasilkan informasi agregasi status sistem untuk dashboard.


---

# 2. Dependency Injection Design


Semua service menggunakan constructor injection.


Dependency mapping:


## DeviceService

Dependency:

DeviceRepositoryInterface



## SensorDataService

Dependency:

SensorDataRepositoryInterface

DeviceRepositoryInterface

AlertRepositoryInterface

SystemLogRepositoryInterface



## AlertService

Dependency:

AlertRepositoryInterface



## SystemStatusService

Dependency:

DeviceRepositoryInterface



Tidak ada Service yang diperbolehkan melakukan:

- query database langsung
- akses Eloquent Model secara langsung untuk persistence


Semua operasi database melalui Repository Interface.


---

# 3. AppServiceProvider Binding


Tambahkan binding berikut:


DeviceServiceInterface

        ->

DeviceService



SensorDataServiceInterface

        ->

SensorDataService



AlertServiceInterface

        ->

AlertService



SystemStatusServiceInterface

        ->

SystemStatusService



Lokasi:

app/Providers/AppServiceProvider.php


---

# 4. Public Service Methods


## DeviceServiceInterface


getAllDevices(?string $status = null): LengthAwarePaginator


Mengambil daftar device dengan optional filter status.


---

getDeviceByDeviceId(string $deviceId): Device


Mengambil device berdasarkan business key.


Jika tidak ditemukan:

throw ModelNotFoundException



---

registerOrUpdateDevice(
    string $deviceId,
    array $data
): Device


Digunakan untuk:

- auto-registration
- update device status


---

# SensorDataServiceInterface


storeSensorData(
    string $deviceId,
    array $payload
): SensorData


Primary ingestion flow.


Menggunakan transaction.



---

getLatestSensorData(
    string $deviceId
): SensorData


Mengambil data sensor terbaru.


Jika tidak ditemukan:

throw ModelNotFoundException



---

getSensorDataHistory(
    string $deviceId,
    Carbon $startDate,
    Carbon $endDate,
    int $perPage = 50
): LengthAwarePaginator



---

# AlertServiceInterface


getAllAlerts(
    ?string $deviceId = null,
    ?string $status = null,
    ?Carbon $startDate = null,
    ?Carbon $endDate = null,
    int $perPage = 20
): LengthAwarePaginator



---

getAlertById(int $id): Alert


Jika tidak ditemukan:

throw ModelNotFoundException



---

# SystemStatusServiceInterface


getSystemStatus(): array



---

# 5. Sensor Data Ingestion Flow


Method:


SensorDataService::storeSensorData()


Flow:


BEGIN TRANSACTION


1. Check Device


DeviceRepository::findByDeviceId()


Jika device tidak ditemukan:


createOrUpdate()

Dengan default:


name:

"Device {device_id}"


status:

online


last_seen_at:

now()



Log auto-registration dilakukan setelah commit.



---

2. Update Device Status


Jika device ditemukan:


updateLastSeen()


Dengan:


status = online

last_seen_at = now()



Alasan:

Device terbukti aktif karena berhasil mengirim data.



---

3. Store Sensor Data


SensorDataRepository::create()


Data:

- device_id
- recorded_at
- temperature
- humidity
- light
- motion
- obstacle
- status



---

4. Alert Derivation


Jika:


status == WARNING

atau

status == DANGER


Maka:


AlertRepository::create()



Data:

- device_id
- sensor_data_id
- status
- triggered_at



---

5. Commit


COMMIT TRANSACTION



Return:


SensorData object



---

# 6. Transaction Boundary


Transaction hanya digunakan pada:


SensorDataService::storeSensorData()



Karena operasi berikut harus atomic:


- auto-registration device
- update device status
- sensor_data insertion
- alert creation


Jika salah satu gagal:


ROLLBACK seluruh perubahan.



Read operation tidak menggunakan transaction:


- getAllDevices()
- getLatestSensorData()
- getSensorDataHistory()
- getAllAlerts()
- getAlertById()
- getSystemStatus()



---

# 7. Logging Strategy


Logging dilakukan setelah transaction berhasil commit.


Alasan:

Kegagalan logging tidak boleh menyebabkan sensor ingestion rollback.


Event yang dicatat:


## Auto Registration

Data:

- device_id



## Sensor Ingestion

Data:

- device_id
- sensor_data_id
- status



## Alert Creation

Data:

- device_id
- alert_id
- status



## Error

Data:

- device_id
- exception context



Implementasi:


Laravel Log Facade

+

SystemLogRepositoryInterface



system_logs tetap internal.


Tidak diekspos sebagai REST API.



---

# 8. Business Rule Implementation


## DeviceService Rules


Device lookup menggunakan:


device_id


sebagai business key.


Jika tidak ditemukan:

ModelNotFoundException.



Auto registration:


Default name:

"Device {device_id}"


Default status:

online



---

## SensorDataService Rules


Status valid:


NORMAL

WARNING

DANGER



Walaupun FormRequest sudah melakukan validasi:

Service melakukan defensive validation.



---

Alert rule:


WARNING / DANGER


menghasilkan alert.



---

Device activity rule:


Sensor berhasil diterima


=

device dianggap online.



---

# 9. Exception Handling


Service tidak mengembalikan:

- HTTP response
- HTTP status code


Service hanya:

return domain object

atau

throw exception



Mapping:


ModelNotFoundException

    ->

HTTP 404



ValidationException

    ->

HTTP 422



Throwable

    ->

HTTP 500



Exception Handler bertanggung jawab melakukan:

- JSON response formatting
- success:false envelope
- HTTP mapping



---

# 10. Repository Compatibility


Repository Layer saat ini sudah mendukung seluruh kebutuhan Service Layer.


Required methods:


DeviceRepository:

- findByDeviceId()
- findById()
- getAll()
- createOrUpdate()
- updateLastSeen()
- getSystemStatus()



SensorDataRepository:

- create()
- getLatestByDeviceId()
- getHistoryByDeviceId()
- findById()



AlertRepository:

- create()
- getAll()
- findById()



SystemLogRepository:

- create()



Tidak diperlukan perubahan Repository.


---

# 11. Consequences


## Positive

- Business logic terisolasi
- Controller menjadi lebih sederhana
- Repository tetap fokus pada persistence
- Transaction lebih aman
- Mudah melakukan unit testing
- Mendukung integrasi MQTT dan AI Layer


## Negative

- Jumlah class meningkat
- Membutuhkan dependency injection configuration
- Interface tambahan meningkatkan jumlah file


---

# Implementation Scope


Termasuk:

[x] Membuat 4 Service Contract

[x] Membuat 4 Service Implementation

[x] Menambahkan Service binding pada AppServiceProvider

[x] Implementasi SensorData ingestion transaction flow

[x] Implementasi business rules

[x] Implementasi exception throwing

[x] Implementasi logging event


Tidak termasuk:

- Custom Exception Handler response format
- Authentication
- MQTT consumer
- AI Layer integration


---

# Final Decision

SIAGA Backend akan mengimplementasikan Service Layer menggunakan:

- DeviceService
- SensorDataService
- AlertService
- SystemStatusService


Dengan pola:

Controller

    ↓

Service Layer

    ↓

Repository Layer

    ↓

Database



SensorDataService menjadi pusat business orchestration untuk seluruh proses sensor ingestion dengan transaction boundary menggunakan DB::transaction().

---

# Implementation Status — ADR-002

## Status: Completed / Approved

## Validation

- Service contracts implemented.
- Service implementations completed.
- Dependency Injection bindings added in AppServiceProvider.
- Service layer follows Interface + Implementation pattern.
- Services depend only on repository interfaces.
- Controllers remain free from business logic.
- FormRequest is responsible for structural validation.
- Service layer handles business rules and orchestration.
- `SensorDataService::storeSensorData()` is the only transactional workflow.
- Logging strategy implemented according to ADR-002.
- Exception strategy implemented using service exceptions.
- Service smoke test passed:
  - **39/39 tests passed.**

---

# Roadmap Implementasi

```
ADR-001 Repository Layer ✅ Completed
        ↓
ADR-002 Service Layer ✅ Completed
        ↓
ADR-003 Form Request Layer ✅ Completed
        ↓
ADR-004 Controller + API Resource + API Route Layer (Pending)
```

---

# Implementation Status — ADR-003

## Status: Completed / Approved

## Validation

- Form Request Layer bertujuan untuk menangani structural validation pada sisi backend.
- Berikut Form Request yang telah dibuat:
  - `StoreSensorDataRequest`
  - `GetLatestSensorDataRequest`
  - `GetSensorDataHistoryRequest`
  - `GetDevicesRequest`
  - `GetAlertsRequest`
- Seluruh Form Request mengikuti Clean Architecture dan Laravel Form Request.
- Business logic tetap berada di Service Layer.
- Implementasi telah diverifikasi melalui code review dan audit.
- Tahap ini dinyatakan COMPLETE.

---

# Next Phase — ADR-004: Controller + API Resource + API Route Layer

## Status: Pending

## Scope

Tahap berikutnya mencakup:

- Controllers
- API Resources
- API Routes

Tanpa mengubah arsitektur project.
