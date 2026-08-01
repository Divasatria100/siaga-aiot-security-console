<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * SIAGA Master Database Schema.
 *
 * Implements the SIAGA Database Design Document (DDD) v1.0 for PostgreSQL
 * with the TimescaleDB extension, and an equivalent schema for SQLite
 * used during local development.
 *
 * MVP Entities (DDD §5.1): devices, sensor_data (hypertable), alerts, system_logs.
 * Relationships (DDD §7):
 *   - devices 1:N sensor_data
 *   - devices 1:N alerts
 *   - sensor_data 1:1 alerts
 *   - devices 1:N system_logs (optional)
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            $this->upPostgres();

            return;
        }

        $this->upSqlite();
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            $this->downPostgres();

            return;
        }

        $this->downSqlite();
    }

    // ==================================================================
    // PostgreSQL + TimescaleDB
    // ==================================================================

    private function upPostgres(): void
    {
        // ------------------------------------------------------------
        // 1. Extensions
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            CREATE EXTENSION IF NOT EXISTS timescaledb;
        SQL);

        // ------------------------------------------------------------
        // 2. Tables
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            CREATE TABLE IF NOT EXISTS devices (
                id           BIGSERIAL    PRIMARY KEY,
                device_id    VARCHAR(255) NOT NULL,
                name         VARCHAR(255) NOT NULL,
                status       VARCHAR(20)  NOT NULL DEFAULT 'offline',
                last_seen_at TIMESTAMP    NULL,
                created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        SQL);

        // sensor_data: time-series hypertable (DDD §6.2, §8).
        // Composite primary key (id, recorded_at) results from TimescaleDB
        // chunk-based partitioning.
        DB::unprepared(<<<'SQL'
            CREATE TABLE IF NOT EXISTS sensor_data (
                id          BIGSERIAL    NOT NULL,
                device_id   BIGINT       NOT NULL,
                recorded_at TIMESTAMP    NOT NULL,
                temperature NUMERIC      NOT NULL,
                humidity    NUMERIC      NOT NULL,
                motion      BOOLEAN      NOT NULL,
                light       NUMERIC      NOT NULL,
                obstacle    BOOLEAN      NOT NULL,
                status      VARCHAR(10)  NOT NULL,
                created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id, recorded_at)
            );
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TABLE IF NOT EXISTS alerts (
                id             BIGSERIAL    PRIMARY KEY,
                device_id      BIGINT       NOT NULL,
                sensor_data_id BIGINT       NOT NULL,
                status         VARCHAR(10)  NOT NULL,
                triggered_at   TIMESTAMP    NOT NULL,
                created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TABLE IF NOT EXISTS system_logs (
                id         BIGSERIAL    PRIMARY KEY,
                device_id  BIGINT       NULL,
                log_level  VARCHAR(10)  NOT NULL,
                source     VARCHAR(255) NOT NULL,
                message    TEXT         NOT NULL,
                created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        SQL);

        // ------------------------------------------------------------
        // 3. Unique Constraints
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_devices_device_id') THEN
                    ALTER TABLE devices
                        ADD CONSTRAINT uq_devices_device_id UNIQUE (device_id);
                END IF;
            END $$;
        SQL);

        // ------------------------------------------------------------
        // 4. Check Constraints
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_devices_status') THEN
                    ALTER TABLE devices
                        ADD CONSTRAINT chk_devices_status CHECK (status IN ('online', 'offline'));
                END IF;
            END $$;
        SQL);

        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_sensor_data_status') THEN
                    ALTER TABLE sensor_data
                        ADD CONSTRAINT chk_sensor_data_status CHECK (status IN ('NORMAL', 'WARNING', 'DANGER'));
                END IF;
            END $$;
        SQL);

        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_alerts_status') THEN
                    ALTER TABLE alerts
                        ADD CONSTRAINT chk_alerts_status CHECK (status IN ('WARNING', 'DANGER'));
                END IF;
            END $$;
        SQL);

        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_system_logs_log_level') THEN
                    ALTER TABLE system_logs
                        ADD CONSTRAINT chk_system_logs_log_level CHECK (log_level IN ('info', 'warning', 'error'));
                END IF;
            END $$;
        SQL);

        // ------------------------------------------------------------
        // 5. Foreign Keys
        // Referential integrity (DDD §10): RESTRICT prevents accidental
        // removal of historical data.
        // ------------------------------------------------------------
        // fk_sensor_data_device_id: sensor_data -> devices
        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sensor_data_device_id') THEN
                    ALTER TABLE sensor_data
                        ADD CONSTRAINT fk_sensor_data_device_id
                        FOREIGN KEY (device_id) REFERENCES devices (id)
                        ON DELETE RESTRICT;
                END IF;
            END $$;
        SQL);

        // fk_alerts_device_id: alerts -> devices
        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_alerts_device_id') THEN
                    ALTER TABLE alerts
                        ADD CONSTRAINT fk_alerts_device_id
                        FOREIGN KEY (device_id) REFERENCES devices (id)
                        ON DELETE RESTRICT;
                END IF;
            END $$;
        SQL);

        // fk_alerts_sensor_data_id (alerts -> sensor_data) is intentionally
        // deferred: it is created after the hypertable conversion because
        // TimescaleDB does not permit foreign key references to a hypertable,
        // and sensor_data.id is not unique in PostgreSQL (composite PK).
        // SQLite enforces this relationship for local development.

        // fk_system_logs_device_id: system_logs -> devices (nullable)
        DB::unprepared(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_system_logs_device_id') THEN
                    ALTER TABLE system_logs
                        ADD CONSTRAINT fk_system_logs_device_id
                        FOREIGN KEY (device_id) REFERENCES devices (id)
                        ON DELETE RESTRICT;
                END IF;
            END $$;
        SQL);

        // ------------------------------------------------------------
        // 6. Indexes (DDD §9)
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id_recorded_at
                ON sensor_data (device_id, recorded_at);
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id
                ON sensor_data (device_id);
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_alerts_device_id_triggered_at
                ON alerts (device_id, triggered_at);
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_alerts_status
                ON alerts (status);
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_alerts_device_id
                ON alerts (device_id);
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_system_logs_device_id
                ON system_logs (device_id);
        SQL);

        // ------------------------------------------------------------
        // 7. TimescaleDB Hypertable (DDD §8)
        // recorded_at is the time column; chunks are created per day.
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            SELECT create_hypertable(
                'sensor_data',
                'recorded_at',
                chunk_time_interval => INTERVAL '1 day',
                if_not_exists       => TRUE
            );
        SQL);

        // fk_alerts_sensor_data_id: alerts -> sensor_data (DDD §6.3, §7)
        // Attempted after the hypertable conversion because TimescaleDB
        // does not permit foreign key references to a hypertable, and
        // PostgreSQL rejects the reference because sensor_data.id is not
        // unique (composite primary key (id, recorded_at) per DDD §6.2).
        // The constraint is therefore attempted best-effort and only the
        // expected SQLSTATE 42830 (foreign key / unique constraint) is
        // swallowed; SQLite enforces this relationship for local development.
        try {
            DB::unprepared(<<<'SQL'
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_alerts_sensor_data_id') THEN
                        ALTER TABLE alerts
                            ADD CONSTRAINT fk_alerts_sensor_data_id
                            FOREIGN KEY (sensor_data_id) REFERENCES sensor_data (id)
                            ON DELETE RESTRICT;
                    END IF;
                END $$;
            SQL);
        } catch (\Illuminate\Database\QueryException $e) {
            $isExpectedHypertableKeyError = str_contains(
                $e->getMessage(),
                'SQLSTATE[42830]'
            ) || str_contains($e->getMessage(), 'no unique constraint matching given keys');

            if (! $isExpectedHypertableKeyError) {
                throw $e;
            }
        }
    }

    private function downPostgres(): void
    {
        // Drop in reverse dependency order (system_logs -> alerts ->
        // sensor_data -> devices), then remove the extension.
        DB::unprepared(<<<'SQL'
            DROP TABLE IF EXISTS system_logs CASCADE;
        SQL);

        DB::unprepared(<<<'SQL'
            DROP TABLE IF EXISTS alerts CASCADE;
        SQL);

        DB::unprepared(<<<'SQL'
            DROP TABLE IF EXISTS sensor_data CASCADE;
        SQL);

        DB::unprepared(<<<'SQL'
            DROP TABLE IF EXISTS devices CASCADE;
        SQL);
    }

    // ==================================================================
    // SQLite (local development fallback)
    // ==================================================================

    private function upSqlite(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->string('name');
            $table->string('status')->default('offline');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->unique('device_id', 'uq_devices_device_id');
        });

        // Local-development equivalent of the TimescaleDB hypertable.
        // SQLite uses a single bigint id primary key; the composite
        // primary key (id, recorded_at) is a TimescaleDB partitioning
        // concern only.
        Schema::create('sensor_data', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id');
            $table->timestamp('recorded_at');
            $table->decimal('temperature', 10, 2);
            $table->decimal('humidity', 10, 2);
            $table->boolean('motion');
            $table->decimal('light', 10, 2);
            $table->boolean('obstacle');
            $table->string('status');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('device_id', 'fk_sensor_data_device_id')
                ->references('id')->on('devices')
                ->onDelete('restrict');

            $table->index(['device_id', 'recorded_at'], 'idx_sensor_data_device_id_recorded_at');
            $table->index('device_id', 'idx_sensor_data_device_id');
        });

        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id');
            $table->unsignedBigInteger('sensor_data_id');
            $table->string('status');
            $table->timestamp('triggered_at');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('device_id', 'fk_alerts_device_id')
                ->references('id')->on('devices')
                ->onDelete('restrict');

            $table->foreign('sensor_data_id', 'fk_alerts_sensor_data_id')
                ->references('id')->on('sensor_data')
                ->onDelete('restrict');

            $table->index(['device_id', 'triggered_at'], 'idx_alerts_device_id_triggered_at');
            $table->index('status', 'idx_alerts_status');
            $table->index('device_id', 'idx_alerts_device_id');
        });

        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id')->nullable();
            $table->string('log_level');
            $table->string('source');
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('device_id', 'fk_system_logs_device_id')
                ->references('id')->on('devices')
                ->onDelete('restrict');

            $table->index('device_id', 'idx_system_logs_device_id');
        });

        // Check-constraint equivalents for SQLite via triggers.
        // SQLite does not support ALTER TABLE ... ADD CHECK, so the DDD
        // check constraints are enforced with BEFORE INSERT OR UPDATE
        // triggers for local development.
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_devices_status_check
            BEFORE INSERT OR UPDATE ON devices
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('online', 'offline'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_devices_status violation: status must be online or offline');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_sensor_data_status_check
            BEFORE INSERT OR UPDATE ON sensor_data
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('NORMAL', 'WARNING', 'DANGER'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_sensor_data_status violation: status must be NORMAL, WARNING or DANGER');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_alerts_status_check
            BEFORE INSERT OR UPDATE ON alerts
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('WARNING', 'DANGER'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_alerts_status violation: status must be WARNING or DANGER');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_system_logs_log_level_check
            BEFORE INSERT OR UPDATE ON system_logs
            FOR EACH ROW
            WHEN (NEW.log_level NOT IN ('info', 'warning', 'error'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_system_logs_log_level violation: log_level must be info, warning or error');
            END;
        SQL);
    }

    private function downSqlite(): void
    {
        // Triggers are dropped automatically with their tables.
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('sensor_data');
        Schema::dropIfExists('devices');
    }
};
