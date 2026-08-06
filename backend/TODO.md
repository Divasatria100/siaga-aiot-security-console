# JANGAN MENGHAPUS PROGRES YANG SUDAH DICATAT DISINI KARENA INI SEBAGAI CATATAN UNTUK MENGINGAT KEMBALI PROGRES YANG SUDAH DIKERJAKAN (TAMBAH BOLEH TAPI JANGAN DIKURANGI).

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

# TODO — Perbaikan Temuan Minor Review ADR-005

## Status: ✅ COMPLETED

## Temuan 1 — Format field `details` pada ApiResponse::error() ✅
- [x] `backend/app/Support/ApiResponse.php` — ubah `details` kosong menjadi `{}` (object kosong)

## Temuan 2 — Dukungan `per_page` pada GET /api/v1/devices ✅
- [x] `backend/app/Http/Requests/GetDevicesRequest.php` — tambah validasi `per_page` + messages + attributes
- [x] `backend/app/Http/Controllers/DeviceController.php` — teruskan `per_page` ke service
- [x] `backend/app/Services/Contracts/DeviceServiceInterface.php` — ubah signature `getAllDevices(?string $status, int $perPage = 15)`
- [x] `backend/app/Services/DeviceService.php` — teruskan `$perPage` ke repository
- [x] `backend/app/Repositories/Contracts/DeviceRepositoryInterface.php` — ubah signature `getAll(?string $status, int $perPage = 15)`
- [x] `backend/app/Repositories/DeviceRepository.php` — panggil `paginate($perPage)`

## Temuan 3 — Bersihkan DatabaseSeeder bawaan Laravel ✅
- [x] `backend/database/seeders/DatabaseSeeder.php` — hapus seeding users

## Verifikasi ✅
- [x] `php -l` pada seluruh file yang berubah — semua "No syntax errors detected"
- [x] `php artisan route:list` — semua route API tetap terdaftar
- [x] `ApiResponse::error()` tanpa details → `"details":{}` (object kosong)
- [x] `ValidationException` → `details` tetap associative array
- [x] `GET /api/v1/devices?per_page=10` → `meta.per_page = 10`
- [x] `GET /api/v1/devices` (tanpa per_page) → default `meta.per_page = 15`
- [x] `per_page=0` → 422, `per_page=101` → 422
- [x] Review akhir + laporan file yang diubah

# TODO - Backend Feature Tests (HTTP Endpoint)

## Tahap: Backend Tests - Feature Tests

### Factory
- [ ] Buat `database/factories/DeviceFactory.php`
- [ ] Buat `database/factories/SensorDataFactory.php`
- [ ] Buat `database/factories/AlertFactory.php`

### Feature Tests
- [ ] Buat `tests/Feature/DeviceApiTest.php`
- [ ] Buat `tests/Feature/SensorDataApiTest.php`
- [ ] Buat `tests/Feature/AlertApiTest.php`
- [ ] Buat `tests/Feature/SystemStatusApiTest.php`

### Verifikasi
- [ ] Jalankan `php artisan test --testsuite=Feature`
- [ ] Review seluruh hasil testing
- [ ] Laporkan bug/inkonsistensi (tanpa memperbaiki)