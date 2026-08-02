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
