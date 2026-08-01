# SIAGA API Specification

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** API Specification
**Reference Documents:** SIAGA Project Context & Overview; SIAGA Software Requirements Specification (SRS); SIAGA Software Architecture Document (SAD); SIAGA Software Design Document (SDD); SIAGA Database Design Document (DDD)
**Status:** Draft v1.0

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan **API Specification** dari sistem SIAGA, mencakup seluruh REST API endpoint, struktur Request, struktur Response, Validation Rules, Error Handling, Response Standard, serta strategi Authentication dan Versioning yang menjadi kontrak komunikasi antara Embedded Layer (ESP32), Backend Layer (Laravel), Database Layer (PostgreSQL + TimescaleDB), dan Frontend Layer (React Dashboard). Dokumen ini menerjemahkan keputusan architecture pada Software Architecture Document (SAD), module design pada Software Design Document (SDD), serta entity dan table design pada Database Design Document (DDD) menjadi kontrak API yang konkret dan siap diimplementasikan.

### 1.2 Scope

Ruang lingkup dokumen ini terbatas pada API Specification sistem SIAGA pada tahap Minimum Viable Product (MVP), sebagaimana ditetapkan pada Project Context Bab 6 dan SRS Bab 1.2. Dokumen ini tidak membahas ulang architectural style, database design, maupun module design secara rinci, karena ketiga topik tersebut telah dibahas pada dokumen referensi masing-masing. Dokumen ini juga tidak membahas implementasi Controller pada Laravel, Route definition, OpenAPI/Swagger specification, maupun implementasi frontend dan AI, karena fokus dokumen ini adalah kontrak API, bukan implementasi.

Fitur-fitur pada roadmap Phase 6 (AI Prediction, MQTT Integration, LoRa Gateway, OTA Update, Multi Device Management, dan fitur lanjutan lainnya) ditandai sebagai **Future Development** pada Bab 12 dan tidak dijadikan endpoint pada MVP.

### 1.3 References

1. *SIAGA Project Context & Overview* — dokumen rujukan utama terkait background, objectives, scope, technology stack, dan development roadmap.
2. *SIAGA Software Requirements Specification (SRS)* — dokumen rujukan terkait Functional Requirements (khususnya FR-013 hingga FR-018) dan Business Rules.
3. *SIAGA Software Architecture Document (SAD)* — dokumen rujukan terkait Communication Architecture, Layered Architecture, dan Security Architecture.
4. *SIAGA Software Design Document (SDD)* — dokumen rujukan terkait Controller Layer, Validation Layer, Service Layer, dan Exception Handler.
5. *SIAGA Database Design Document (DDD)* — dokumen rujukan terkait entity design dan table design (`devices`, `sensor_data`, `alerts`, `system_logs`).

---

## 2. API Overview

REST API pada sistem SIAGA berfungsi sebagai satu-satunya media komunikasi antar-layer, menghubungkan:

- **ESP32 (Embedded Layer)** — mengirimkan data sensor dan status sistem hasil evaluasi Rule-Based Decision Engine dan Finite State Machine menuju Backend melalui HTTP Request berformat JSON, sesuai FR-013.
- **Laravel Backend (Backend Layer)** — menerima, memvalidasi, dan menyimpan data yang dikirimkan ESP32 melalui Controller Layer, Validation Layer, Service Layer, dan Repository Layer, sekaligus menyediakan REST API endpoint bagi React Dashboard, sesuai FR-014, FR-015, dan FR-016.
- **PostgreSQL + TimescaleDB (Database Layer)** — diakses secara eksklusif melalui Laravel Backend, tanpa akses langsung dari ESP32 maupun React Dashboard, sejalan dengan Layered Architecture pada SAD Bab 5.1.
- **React Dashboard (Frontend Layer)** — mengonsumsi REST API yang sama untuk menampilkan data sensor dan status sistem secara real-time (FR-017) maupun data historis (FR-018).

Dengan demikian, REST API menjadi satu-satunya kontrak komunikasi yang menyatukan keempat layer tersebut, sejalan dengan prinsip Separation of Concerns yang ditetapkan pada Project Context Bab 15.

---

## 3. API Design Principles

**RESTful API**
Seluruh endpoint dirancang mengikuti prinsip REST, di mana setiap endpoint merepresentasikan resource tertentu (`devices`, `sensor-data`, `alerts`, `system`) dan menggunakan HTTP Method secara semantik sesuai operasi yang dilakukan terhadap resource tersebut.

**Stateless**
Setiap Request bersifat independen dan tidak bergantung pada state Request sebelumnya di sisi Backend, sejalan dengan Architecture Decision pada SAD Bab 13 yang memilih REST API karena sifatnya yang stateless dan sederhana untuk diimplementasikan pada perangkat embedded dengan sumber daya terbatas.

**Resource-Oriented**
Endpoint disusun berdasarkan resource (noun-based), bukan berdasarkan action (verb-based), misalnya `/devices` dan `/sensor-data`, bukan `/getDevices` atau `/sendSensorData`.

**JSON Format**
Seluruh Request Body dan Response Body menggunakan format JSON, sejalan dengan NFR-014 yang menetapkan bahwa REST API harus menggunakan format data JSON yang konsisten agar dapat diakses oleh perangkat embedded maupun frontend.

**Consistent Response Structure**
Seluruh Response — baik Success maupun Error — mengikuti struktur JSON yang konsisten sebagaimana dijelaskan pada Bab 9 (Response Standard), agar dapat diproses secara seragam oleh ESP32 Firmware maupun React Dashboard.

**Versioning**
Seluruh endpoint diawali dengan version prefix pada URL, sebagaimana dijelaskan pada Bab 11 (API Versioning), untuk menjaga kompatibilitas apabila terjadi perubahan kontrak API pada fase pengembangan lanjutan.

**Standard HTTP Status Code**
Setiap Response menggunakan HTTP Status Code standar yang merepresentasikan hasil pemrosesan Request secara akurat, sebagaimana dijelaskan pada Bab 8 (Error Handling).

---

## 4. Authentication Strategy

Pada tahap MVP, seluruh endpoint REST API bersifat **public** tanpa mekanisme Authentication, sejalan dengan Security Architecture pada SAD Bab 11 yang menetapkan bahwa Authentication dan Authorization — baik bagi komunikasi antara ESP32 dan Backend, maupun bagi akses pengguna pada React Dashboard — merupakan **Future Development** di luar tahap MVP. Fokus keamanan pada tahap MVP diarahkan pada Validation terhadap struktur dan tipe data Request, sebagaimana ditetapkan pada NFR-010 dan Business Rule SRS Bab 6, bukan pada mekanisme identifikasi pemanggil API.

**Future Development**
Pada fase pengembangan lanjutan, mekanisme Authentication direncanakan menggunakan **Laravel Sanctum** untuk akses React Dashboard oleh pengguna terdaftar (entity `users` pada DDD Bab 5.2), maupun skema **API Key** atau **JWT** sederhana bagi komunikasi ESP32 menuju Backend, khususnya untuk mendukung kebutuhan Multi Device pada roadmap Phase 6. Dokumen ini tidak membahas detail implementasi mekanisme tersebut.

---

## 5. API Resource

Berdasarkan Entity Design pada Database Design Document Bab 5, berikut adalah resource utama yang tersedia pada REST API SIAGA tahap MVP:

| Resource | Deskripsi | Entity/Table Terkait |
|---|---|---|
| **Devices** | Merepresentasikan identitas dan status konektivitas perangkat ESP32. | `devices` |
| **Sensor Data** | Merepresentasikan data time-series hasil pembacaan sensor beserta status sistem (data terkini maupun data historis). | `sensor_data` |
| **Alerts** | Merepresentasikan riwayat kejadian WARNING dan DANGER. | `alerts` |
| **System Status** | Merepresentasikan ringkasan kondisi sistem secara keseluruhan bagi kebutuhan Dashboard Monitoring. | `devices`, `sensor_data`, `alerts` (agregasi) |

Resource `Dashboard` tidak dirancang sebagai resource tersendiri, melainkan disusun dari kombinasi resource **Devices**, **Sensor Data**, dan **Alerts** yang dikonsumsi oleh Monitoring Module dan Historical Data Module pada React Dashboard, sesuai SDD Bab 4. Resource `system_logs` pada DDD tidak diekspos sebagai REST API resource pada MVP, karena bersifat internal bagi kebutuhan debugging pada Backend, bukan bagi konsumsi ESP32 maupun Dashboard.

---

## 6. Endpoint Specification

Seluruh endpoint pada bab ini menggunakan base path `/api/v1` sebagaimana dijelaskan pada Bab 11 (API Versioning).

### 6.1 Devices Resource

#### 6.1.1 GET /api/v1/devices

**Purpose**
Mengambil daftar seluruh device yang terdaftar pada sistem, beserta status konektivitasnya, untuk mendukung Dashboard Monitoring.

**Request Parameter**
Tidak ada Path Parameter. Query Parameter bersifat opsional:

| Parameter | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `status` | string | Tidak | Filter berdasarkan status konektivitas (`online` atau `offline`). |

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "device_id": "SIAGA-001",
      "name": "Ruang Server Utama",
      "status": "online",
      "last_seen_at": "2026-07-31T09:15:00Z",
      "created_at": "2026-06-01T08:00:00Z"
    }
  ]
}
```

**Error Response**
Sesuai standar pada Bab 8.

**HTTP Status Code**: `200 OK`, `500 Internal Server Error`.

---

#### 6.1.2 GET /api/v1/devices/{device_id}

**Purpose**
Mengambil detail satu device berdasarkan `device_id`, termasuk status konektivitas terkini yang dikelola oleh WiFi Manager pada Embedded Layer.

**Request Parameter**

| Parameter | Tipe | Lokasi | Wajib | Deskripsi |
|---|---|---|---|---|
| `device_id` | string | Path | Ya | Business key unik perangkat sesuai Configuration Manager pada SDD Bab 8. |

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "device_id": "SIAGA-001",
    "name": "Ruang Server Utama",
    "status": "online",
    "last_seen_at": "2026-07-31T09:15:00Z",
    "created_at": "2026-06-01T08:00:00Z",
    "updated_at": "2026-07-31T09:15:00Z"
  }
}
```

**Error Response**
`404 Not Found` apabila `device_id` tidak ditemukan pada table `devices`.

**HTTP Status Code**: `200 OK`, `404 Not Found`, `500 Internal Server Error`.

---

### 6.2 Sensor Data Resource

#### 6.2.1 POST /api/v1/devices/{device_id}/sensor-data

**Purpose**
Menerima data sensor beserta status sistem yang dikirimkan ESP32 melalui REST API Client, sesuai FR-013. Endpoint ini merupakan write path utama sebagaimana dijelaskan pada DDD Bab 3, di mana satu payload merepresentasikan satu pembacaan sensor beserta hasil evaluasi Rule-Based Decision Engine dan State Machine pada waktu yang sama (FR-013). Apabila `device_id` belum terdaftar pada table `devices`, Backend melakukan registrasi otomatis sebagai record baru; apabila sudah terdaftar, `status` dan `last_seen_at` pada `devices` diperbarui mengikuti data yang diterima.

**Request Parameter**

| Parameter | Tipe | Lokasi | Wajib | Deskripsi |
|---|---|---|---|---|
| `device_id` | string | Path | Ya | Business key unik perangkat pengirim data. |

**Request Body**

```json
{
  "recorded_at": "2026-07-31T09:15:00Z",
  "temperature": 29.5,
  "humidity": 68.2,
  "motion": true,
  "light": 120.0,
  "obstacle": false,
  "status": "WARNING"
}
```

**Success Response** (201 Created)

```json
{
  "success": true,
  "message": "Sensor data berhasil disimpan",
  "data": {
    "id": 10452,
    "device_id": "SIAGA-001",
    "recorded_at": "2026-07-31T09:15:00Z",
    "temperature": 29.5,
    "humidity": 68.2,
    "motion": true,
    "light": 120.0,
    "obstacle": false,
    "status": "WARNING",
    "created_at": "2026-07-31T09:15:01Z"
  }
}
```

**Error Response**
`422 Unprocessable Entity` apabila Request Body tidak lolos Validation Layer sesuai Bab 7.

**HTTP Status Code**: `201 Created`, `422 Unprocessable Entity`, `500 Internal Server Error`.

---

#### 6.2.2 GET /api/v1/sensor-data/latest

**Purpose**
Mengambil data sensor dan status sistem terkini bagi kebutuhan Monitoring Module pada React Dashboard, sesuai FR-016 dan FR-017.

**Request Parameter**

| Parameter | Tipe | Lokasi | Wajib | Deskripsi |
|---|---|---|---|---|
| `device_id` | string | Query | Ya | Business key perangkat yang datanya ingin diambil. |

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "device_id": "SIAGA-001",
    "recorded_at": "2026-07-31T09:15:00Z",
    "temperature": 29.5,
    "humidity": 68.2,
    "motion": true,
    "light": 120.0,
    "obstacle": false,
    "status": "WARNING"
  }
}
```

**Error Response**
`404 Not Found` apabila belum terdapat record `sensor_data` bagi `device_id` yang diminta.

**HTTP Status Code**: `200 OK`, `404 Not Found`, `422 Unprocessable Entity`, `500 Internal Server Error`.

---

#### 6.2.3 GET /api/v1/sensor-data/history

**Purpose**
Mengambil riwayat data sensor dan status sistem berdasarkan rentang waktu tertentu bagi kebutuhan Historical Data Module pada React Dashboard, sesuai FR-018.

**Request Parameter**

| Parameter | Tipe | Lokasi | Wajib | Deskripsi |
|---|---|---|---|---|
| `device_id` | string | Query | Ya | Business key perangkat. |
| `start_date` | string (ISO 8601) | Query | Ya | Awal rentang waktu berdasarkan `recorded_at`. |
| `end_date` | string (ISO 8601) | Query | Ya | Akhir rentang waktu berdasarkan `recorded_at`. |
| `page` | integer | Query | Tidak | Nomor halaman, mengikuti Response Standard Pagination pada Bab 9.3. |
| `per_page` | integer | Query | Tidak | Jumlah record per halaman. |

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 10448,
      "device_id": "SIAGA-001",
      "recorded_at": "2026-07-31T09:00:00Z",
      "temperature": 28.1,
      "humidity": 65.4,
      "motion": false,
      "light": 110.0,
      "obstacle": false,
      "status": "NORMAL"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 240
  }
}
```

**Error Response**
`422 Unprocessable Entity` apabila `start_date` melebihi `end_date`, atau `device_id` tidak dikirimkan.

**HTTP Status Code**: `200 OK`, `422 Unprocessable Entity`, `500 Internal Server Error`.

---

### 6.3 Alerts Resource

#### 6.3.1 GET /api/v1/alerts

**Purpose**
Mengambil riwayat kejadian WARNING dan DANGER bagi kebutuhan Alert Module pada React Dashboard, sesuai fitur Alert & Notification pada SRS Bab 5.6, tanpa memerlukan scan penuh terhadap hypertable `sensor_data` sebagaimana dijelaskan pada DDD Bab 5.1.

**Request Parameter**

| Parameter | Tipe | Lokasi | Wajib | Deskripsi |
|---|---|---|---|---|
| `device_id` | string | Query | Tidak | Filter berdasarkan perangkat tertentu. |
| `status` | string | Query | Tidak | Filter berdasarkan status alert (`WARNING` atau `DANGER`). |
| `start_date` | string (ISO 8601) | Query | Tidak | Awal rentang waktu berdasarkan `triggered_at`. |
| `end_date` | string (ISO 8601) | Query | Tidak | Akhir rentang waktu berdasarkan `triggered_at`. |
| `page` | integer | Query | Tidak | Nomor halaman. |
| `per_page` | integer | Query | Tidak | Jumlah record per halaman. |

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 512,
      "device_id": "SIAGA-001",
      "sensor_data_id": 10452,
      "status": "WARNING",
      "triggered_at": "2026-07-31T09:15:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 35
  }
}
```

**Error Response**
Sesuai standar pada Bab 8.

**HTTP Status Code**: `200 OK`, `422 Unprocessable Entity`, `500 Internal Server Error`.

---

#### 6.3.2 GET /api/v1/alerts/{id}

**Purpose**
Mengambil detail satu kejadian alert, termasuk referensi kepada record `sensor_data` yang memicunya.

**Request Parameter**

| Parameter | Tipe | Lokasi | Wajib | Deskripsi |
|---|---|---|---|---|
| `id` | integer | Path | Ya | Primary Key record alert. |

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 512,
    "device_id": "SIAGA-001",
    "sensor_data_id": 10452,
    "status": "WARNING",
    "triggered_at": "2026-07-31T09:15:00Z",
    "created_at": "2026-07-31T09:15:01Z",
    "sensor_data": {
      "temperature": 29.5,
      "humidity": 68.2,
      "motion": true,
      "light": 120.0,
      "obstacle": false
    }
  }
}
```

**Error Response**
`404 Not Found` apabila `id` tidak ditemukan.

**HTTP Status Code**: `200 OK`, `404 Not Found`, `500 Internal Server Error`.

---

### 6.4 System Status Resource

#### 6.4.1 GET /api/v1/system/status

**Purpose**
Mengambil ringkasan kondisi sistem secara keseluruhan — jumlah device online/offline dan status sistem terkini seluruh device — bagi kebutuhan tampilan awal Dashboard Monitoring, sesuai FR-016 dan FR-017.

**Request Parameter**
Tidak ada.

**Request Body**
Tidak ada.

**Success Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "total_devices": 3,
    "online_devices": 2,
    "offline_devices": 1,
    "devices": [
      {
        "device_id": "SIAGA-001",
        "status": "online",
        "latest_status": "WARNING",
        "last_seen_at": "2026-07-31T09:15:00Z"
      }
    ]
  }
}
```

**Error Response**
Sesuai standar pada Bab 8.

**HTTP Status Code**: `200 OK`, `500 Internal Server Error`.

---

## 7. Validation Rules

Validation Rules berikut diterapkan pada Validation Layer sebagaimana dijelaskan pada SDD Bab 3, sebelum Request diteruskan menuju Service Layer.

### 7.1 Devices

| Field | Rule |
|---|---|
| `device_id` | Required, string, unique pada table `devices` sesuai DDD Bab 10. |
| `name` | Required, string. |
| `status` | Required pada saat update, harus salah satu dari (`online`, `offline`) sesuai Check Constraint pada DDD Bab 6.1. |

### 7.2 Sensor Data

| Field | Rule |
|---|---|
| `recorded_at` | Required, format datetime valid (ISO 8601). |
| `temperature` | Required, numeric. |
| `humidity` | Required, numeric. |
| `motion` | Required, boolean. |
| `light` | Required, numeric. |
| `obstacle` | Required, boolean. |
| `status` | Required, harus salah satu dari (`NORMAL`, `WARNING`, `DANGER`) sesuai Business Rule SRS Bab 6 dan Check Constraint pada DDD Bab 6.2. |

Seluruh field pada payload `sensor-data` bersifat wajib dan dikirimkan bersamaan dalam satu Request, sesuai FR-013 yang menetapkan bahwa data sensor dan status sistem dikirimkan bersamaan dalam satu payload oleh ESP32.

### 7.3 Alerts

Resource `alerts` tidak menerima Request Body dari luar Backend. Record `alerts` dibentuk secara otomatis oleh Service Layer pada saat Request `POST /api/v1/devices/{device_id}/sensor-data` diterima dengan `status` bernilai `WARNING` atau `DANGER`, sehingga tidak terdapat endpoint penulisan langsung bagi resource ini.

### 7.4 Query Parameter Umum

| Parameter | Rule |
|---|---|
| `start_date`, `end_date` | Format datetime valid (ISO 8601); `start_date` tidak boleh melebihi `end_date`. |
| `page`, `per_page` | Integer positif. |
| `status` (filter) | Harus salah satu dari nilai yang diizinkan sesuai resource terkait. |

---

## 8. Error Handling

Seluruh Error Response mengikuti struktur JSON yang konsisten, ditangani secara terpusat oleh Exception Handler sesuai SDD Bab 3, tanpa menghentikan operasional Backend secara keseluruhan.

**Struktur Error Response**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirimkan tidak valid",
    "details": {
      "status": ["Field status wajib diisi dan harus salah satu dari NORMAL, WARNING, DANGER"]
    }
  }
}
```

**Standar HTTP Status Code**

| HTTP Status Code | Kondisi |
|---|---|
| `400 Bad Request` | Request tidak dapat diproses karena struktur payload tidak sesuai format JSON yang valid. |
| `401 Unauthorized` | Dicadangkan bagi Future Development (Authentication), belum digunakan pada tahap MVP. |
| `403 Forbidden` | Dicadangkan bagi Future Development (Authorization), belum digunakan pada tahap MVP. |
| `404 Not Found` | Resource yang diminta tidak ditemukan, misalnya `device_id` atau `id` alert yang tidak terdaftar. |
| `422 Unprocessable Entity` | Request tidak lolos Validation Layer, misalnya field wajib tidak diisi atau nilai berada di luar Check Constraint. |
| `500 Internal Server Error` | Kegagalan yang tidak teridentifikasi pada Backend, ditangani oleh Exception Handler. |

---

## 9. Response Standard

### 9.1 Success Response

```json
{
  "success": true,
  "data": { }
}
```

Field `message` bersifat opsional dan ditambahkan pada operasi penulisan data, misalnya `POST /api/v1/devices/{device_id}/sensor-data`.

### 9.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": { }
  }
}
```

Field `details` bersifat opsional dan hanya disertakan pada kondisi `422 Unprocessable Entity` untuk menjelaskan field mana yang tidak lolos validasi.

### 9.3 Pagination

Endpoint yang mengembalikan koleksi data dalam jumlah besar, yaitu `GET /api/v1/sensor-data/history` dan `GET /api/v1/alerts`, menyertakan object `meta` pada Response:

```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 240
  }
}
```

---

## 10. API Security

Pembahasan berikut bersifat konseptual sesuai Security Architecture pada SAD Bab 11, tanpa membahas detail implementasi.

**HTTPS**
Pada tahap MVP, komunikasi REST API belum diwajibkan menggunakan HTTPS. Penerapan HTTPS direncanakan sebagai Future Development untuk mengenkripsi komunikasi antar-component.

**API Key**
Belum diterapkan pada tahap MVP. Direncanakan sebagai Future Development bagi identifikasi perangkat ESP32 pada skenario Multi Device.

**Authentication dan Authorization**
Belum diterapkan pada tahap MVP sesuai Bab 4 dokumen ini. Seluruh endpoint bersifat public.

**Rate Limiting**
Belum diterapkan pada tahap MVP. Mekanisme Rate Limiting direncanakan sebagai Future Development untuk mencegah pengiriman data berlebihan dari perangkat maupun akses berlebihan dari klien lain.

**Input Validation**
Menjadi lini pertahanan utama pada tahap MVP, diterapkan secara konsisten melalui Validation Layer pada seluruh endpoint yang menerima Request Body, sesuai NFR-010 dan Business Rule SRS Bab 6.

---

## 11. API Versioning

Seluruh endpoint REST API SIAGA menggunakan version prefix pada URL, dengan format:

```
/api/v1/{resource}
```

Version `v1` merepresentasikan kontrak API pada tahap MVP sebagaimana didefinisikan pada dokumen ini. Apabila terjadi perubahan kontrak API yang bersifat breaking change pada fase pengembangan lanjutan (misalnya penambahan Authentication yang mewajibkan struktur Request baru), version baru (`v2`) akan didefinisikan tanpa mengubah kontrak `v1` yang sudah berjalan, guna menjaga kompatibilitas terhadap ESP32 Firmware maupun React Dashboard yang belum diperbarui.

---

## 12. Future API

Seluruh endpoint berikut merupakan **Future Development** sesuai roadmap Phase 6 pada Project Context dan SRS Bab 8, dan **tidak menjadi bagian dari API Specification MVP** ini:

- **AI Prediction** — endpoint bagi konsumsi hasil Adaptive Threat Intelligence Engine (Threat Scoring) oleh Dashboard.
- **MQTT Integration** — bukan endpoint REST API, melainkan protokol komunikasi alternatif bagi pengiriman data sensor pada skenario many-to-many.
- **OTA Update** — endpoint bagi distribusi firmware terbaru menuju ESP32.
- **Device Registration** — endpoint bagi pendaftaran device secara eksplisit oleh pengguna, sebagai pelengkap mekanisme registrasi otomatis pada MVP.
- **Multi Device Management** — endpoint bagi pengelolaan kepemilikan device oleh entity `users`, termasuk asosiasi Many-to-Many antara `users` dan `devices` sebagaimana disebutkan pada DDD Bab 7.
- **Authentication Endpoint** — endpoint `login`, `logout`, dan `token refresh` menggunakan Laravel Sanctum atau JWT.

---

## 13. Design Decisions

**REST API dibandingkan pendekatan lain**
REST API dipilih sebagai satu-satunya metode komunikasi pada tahap MVP karena sifatnya yang stateless dan resource-oriented, sehingga sederhana untuk diimplementasikan pada ESP32 yang memiliki keterbatasan sumber daya komputasi, sejalan dengan Architecture Decision pada SAD Bab 13. Pendekatan berbasis event seperti WebSocket maupun message-based seperti MQTT memberikan keunggulan pada aspek latensi komunikasi real-time, namun menambah kompleksitas implementasi pada Embedded Layer dan Backend Layer yang tidak sebanding dengan kebutuhan frekuensi pengiriman data pada skala MVP, sebagaimana disebutkan pada Risks and Trade-offs SAD Bab 14.

**Endpoint terpisah bagi data terkini dan data historis**
`GET /api/v1/sensor-data/latest` dan `GET /api/v1/sensor-data/history` dirancang sebagai dua endpoint terpisah, meskipun sama-sama mengambil dari table `sensor_data`, karena keduanya melayani kebutuhan Module yang berbeda pada Frontend — Monitoring Module yang membutuhkan satu record terkini secara ringan, dan Historical Data Module yang membutuhkan query rentang waktu dengan Pagination — sejalan dengan pemisahan Monitoring Module dan Historical Data Module pada SDD Bab 4.

**Alerts sebagai resource read-only**
Resource `alerts` hanya menyediakan endpoint pembacaan (`GET`), tanpa endpoint penulisan langsung, karena record `alerts` merupakan entity turunan otomatis dari `sensor_data` sesuai Relationship Design pada DDD Bab 7, sehingga penulisan dilakukan secara internal oleh Service Layer, bukan melalui Request eksternal.

---

## 14. Glossary

| Istilah | Penjelasan |
|---|---|
| **REST API** | Arsitektur antarmuka pemrograman berbasis HTTP yang menghubungkan Embedded Layer, Backend Layer, dan Frontend Layer pada SIAGA. |
| **Endpoint** | Alamat URL spesifik pada REST API yang merepresentasikan suatu resource dan operasi tertentu. |
| **Request** | Permintaan yang dikirimkan oleh klien (ESP32 atau React Dashboard) menuju REST API endpoint. |
| **Response** | Hasil yang dikembalikan oleh Backend atas suatu Request. |
| **JSON (JavaScript Object Notation)** | Format pertukaran data yang digunakan pada seluruh Request Body dan Response Body. |
| **HTTP Status Code** | Kode numerik standar yang merepresentasikan hasil pemrosesan suatu Request HTTP. |
| **Validation** | Proses pemeriksaan struktur dan tipe data pada Request sebelum diproses lebih lanjut oleh Service Layer. |
| **Middleware** | Komponen pada Laravel yang memproses Request sebelum mencapai Controller Layer, digunakan sebagai fondasi bagi Rate Limiting maupun Authentication pada Future Development. |
| **Authentication** | Mekanisme identifikasi pemanggil API, direncanakan sebagai Future Development pada SIAGA. |
| **Authorization** | Mekanisme pengelolaan hak akses berdasarkan identitas pemanggil API, direncanakan sebagai Future Development pada SIAGA. |
| **Versioning** | Strategi pengelolaan perubahan kontrak API tanpa memutus kompatibilitas terhadap klien yang sudah ada. |
| **Pagination** | Mekanisme pembagian data dalam jumlah besar ke dalam beberapa halaman pada Response. |
| **Rate Limiting** | Mekanisme pembatasan jumlah Request dalam periode waktu tertentu, direncanakan sebagai Future Development. |

---

*Dokumen ini merupakan turunan dari SIAGA Project Context & Overview, SIAGA Software Requirements Specification, SIAGA Software Architecture Document, SIAGA Software Design Document, dan SIAGA Database Design Document, serta menjadi referensi utama bagi implementasi Backend Laravel, Firmware ESP32, dan Frontend React Dashboard.*
