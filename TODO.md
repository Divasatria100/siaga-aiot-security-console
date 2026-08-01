# SIAGA Database Migration — TODO

## Plan Steps
- [x] 1. Create ONE migration file: `backend/database/migrations/2025_06_01_000001_create_siaga_database_schema.php`
- [x] 2. Detect database driver (`pgsql` vs `sqlite`)
- [x] 3. PostgreSQL path — raw SQL via `DB::unprepared`
      - [x] Extensions (`timescaledb`)
      - [x] Tables: `devices`, `sensor_data` (composite PK `id, recorded_at`), `alerts`, `system_logs`
      - [x] Idempotent constraints (unique, CHECK, FOREIGN KEY via `pg_constraint` guard)
      - [x] Foreign key `fk_alerts_sensor_data_id` guarded — TimescaleDB cannot reference hypertables
      - [x] Indexes per DDD §9 (`idx_sensor_data_device_id_recorded_at`, `idx_alerts_device_id_triggered_at`, `idx_alerts_status`, `idx_sensor_data_device_id`, `idx_system_logs_device_id`)
      - [x] Hypertable: `create_hypertable('sensor_data', 'recorded_at', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE)`
- [x] 4. SQLite path — Laravel Schema Builder (local dev fallback)
      - [x] Equivalent tables, columns, unique constraint, FKs (RESTRICT), indexes
      - [x] CHECK-equivalent triggers (SQLite lacks `ALTER TABLE ... ADD CHECK`)
- [x] 5. `down()` for both drivers — drop tables in dependency order, drop `timescaledb` extension
- [ ] 6. Validate: `php -l` on the migration file
      - [x] PHP lint passed (no syntax errors)
      - [ ] Run `php artisan migrate:fresh` against SQLite to verify it executes end-to-end
