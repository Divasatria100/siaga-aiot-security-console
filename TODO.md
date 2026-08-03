# SIAGA Backend — TODO

## Database Migration (Completed)
- [x] 1. Create ONE migration file: `backend/database/migrations/2025_06_01_000001_create_siaga_database_schema.php`
- [x] 2. Detect database driver (`pgsql` vs `sqlite`)
- [x] 3. PostgreSQL path — raw SQL via `DB::unprepared`
      - [x] Extensions (`timescaledb`)
      - [x] Tables: `devices`, `sensor_data` (composite PK `id, recorded_at`), `alerts`, `system_logs`
      - [x] Idempotent constraints (unique, CHECK, FOREIGN KEY via `pg_constraint` guard)
      - [x] Foreign key `fk_alerts_sensor_data_id` guarded — TimescaleDB cannot reference hypertables
      - [x] Indexes per DDD §9
      - [x] Hypertable: `create_hypertable('sensor_data', 'recorded_at', ...)`
- [x] 4. SQLite path — Laravel Schema Builder (local dev fallback)
      - [x] Equivalent tables, columns, unique constraint, FKs (RESTRICT), indexes
      - [x] CHECK-equivalent triggers
- [x] 5. `down()` for both drivers — drop tables in dependency order, drop `timescaledb` extension
- [ ] 6. Validate: `php -l` on the migration file
      - [x] PHP lint passed (no syntax errors)
      - [ ] Run `php artisan migrate:fresh` against SQLite to verify it executes end-to-end

## Eloquent Models (Completed)
- [x] 1. Create `backend/app/Models/Device.php`
- [x] 2. Create `backend/app/Models/SensorData.php`
- [x] 3. Create `backend/app/Models/Alert.php`
- [x] 4. Create `backend/app/Models/SystemLog.php`
- [x] 5. Validate: `php -l` on all four model files
- [x] 6. Verify models load correctly in Laravel (introspection script — all 8 relationship checks PASS; `artisan model:show` requires a running PostgreSQL server which is currently offline)

## Service Layer (Completed per ADR-002)
- [x] 1. Create 4 Service Contracts in `app/Services/Contracts/`:
      - [x] `DeviceServiceInterface`
      - [x] `SensorDataServiceInterface`
      - [x] `AlertServiceInterface`
      - [x] `SystemStatusServiceInterface`
- [x] 2. Create 4 Service Implementations in `app/Services/`:
      - [x] `DeviceService`
      - [x] `SensorDataService`
      - [x] `AlertService`
      - [x] `SystemStatusService`
- [x] 3. Add Service bindings to `AppServiceProvider` (Interface -> Implementation)
- [x] 4. Implement `SensorDataService::storeSensorData()` transactional ingestion flow
      - [x] Auto-registration of unknown device (default name "Device {device_id}")
      - [x] Device status update to online + last_seen_at
      - [x] Sensor data persistence
      - [x] Alert derivation on WARNING/DANGER
      - [x] Transaction via `DB::transaction()`
- [x] 5. Implement business rules (auto-registration, alert derivation, device online, defensive status validation)
- [x] 6. Implement exception throwing (ModelNotFoundException, ValidationException)
- [x] 7. Implement logging after commit (Laravel Log + SystemLogRepository)
- [x] 8. Validate: `php -l` on all 8 service files + AppServiceProvider
- [x] 9. Verify DI resolution via tinker (all 4 services resolve)
- [x] 10. Run `storage/app/service_smoke_test.php` — 39/39 checks PASS

## Architecture Documentation (Completed)
- [x] 1. Update `docs/ADR.md` with "Implementation Status — ADR-001" section (Completed / Approved, 52/52 repo tests)
- [x] 2. Update `docs/ADR.md` with "Implementation Status — ADR-002" section (Completed / Approved, 39/39 service tests)
- [x] 3. Keep all existing ADR decisions unchanged
- [x] 4. Add "Next Phase — ADR-003: Controller + FormRequest Layer" (Pending) with expected architecture flow

## Next Phase (Pending — awaiting approval)
- [ ] ADR-003: Controller + FormRequest Layer
- [ ] ADR-004: Exception Handling / API Response Layer
- [ ] Integration Testing
