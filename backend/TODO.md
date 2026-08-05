# ADR-004 Phase 2: API Resources Implementation

## Objectives
Membuat Laravel API Resources untuk transformasi response, konsisten dengan API Specification, tanpa business logic, query database, maupun lazy loading relasi.

## Steps

### 1. Buat API Resource Classes
- [x] `backend/app/Http/Resources/DeviceResource.php`
- [x] `backend/app/Http/Resources/SensorDataResource.php`
- [x] `backend/app/Http/Resources/AlertResource.php`

### 2. Update Controller untuk menggunakan Resource
- [x] `DeviceController` — index & show memakai `DeviceResource`
- [x] `SensorDataController` — store, latest, history memakai `SensorDataResource`
- [x] `AlertController` — index & show memakai `AlertResource`
- [x] `SystemStatusController` — TIDAK diubah (data sudah sesuai spec)

### 2b. Update Repository untuk eager load relasi (opsi 2 disetujui)
- [x] `SensorDataRepository` — eager load `device` pada create, getLatestByDeviceId, getHistoryByDeviceId
- [x] `AlertRepository` — eager load `device` pada getAll; eager load `device` + `sensorData` pada findById

### 3. Verifikasi
- [x] `php -l` pada semua Resource & Controller yang berubah
- [x] `php -l` pada Repository yang berubah
- [x] Review menyeluruh: bandingkan field dengan API Specification
- [x] Pastikan tidak ada business logic di Resource
- [x] Pastikan tidak ada query database / lazy loading di Resource

### 4. Critical-path testing (verifikasi transformasi Resource)
- [x] `DeviceResource` — device_id business key "SIAGA-001", ISO8601 Zulu timestamps
- [x] `SensorDataResource` — device_id business key, tipe float/bool benar
- [x] `AlertResource` — nested sensor_data tampil saat relasi dimuat
- [x] `whenLoaded` dengan closure — key device_id/sensor_data dihilangkan saat relasi tidak dimuat (tidak ada null, tidak ada lazy loading)
- [x] `php -l` pada Resource setelah perbaikan closure
