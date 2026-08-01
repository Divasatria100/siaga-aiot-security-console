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
        // Extensions, Tables, Hypertable, and Indexes
        //
        // Executed as a single SQL statement to keep the migration
        // concise and maintainable. All constraints are declared inline
        // inside CREATE TABLE. IF NOT EXISTS guards are omitted because
        // migrate:fresh always starts from an empty database; the only
        // exceptions are CREATE EXTENSION (extensions survive
        // migrate:fresh) and create_hypertable(if_not_exists => TRUE)
        // for extra safety.
        //
        // create_hypertable() runs before CREATE INDEX so indexes are
        // built on hypertable chunks (TimescaleDB best practice).
        // ------------------------------------------------------------
        DB::unprepared(<<<'SQL'
            -- Extensions (DDD §2)
            CREATE EXTENSION IF NOT EXISTS timescaledb;

            -- Tables (DDD §6)
            -- All timestamp columns use TIMESTAMPTZ to store the timezone
            -- with the timestamp, consistent across Laravel, ESP32, React
            -- Dashboard, and the Future AI Service.
            CREATE TABLE devices (
                id           BIGSERIAL     PRIMARY KEY,
                device_id    VARCHAR(255)  NOT NULL,
                name         VARCHAR(255)  NOT NULL,
                status       VARCHAR(20)   NOT NULL DEFAULT 'offline',
                last_seen_at TIMESTAMPTZ   NULL,
                created_at   TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at   TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_devices_device_id UNIQUE (device_id),
                CONSTRAINT chk_devices_status CHECK (status IN ('online', 'offline'))
            );

            -- sensor_data: time-series hypertable (DDD §6.2, §8).
            -- Composite primary key (id, recorded_at) results from
            -- TimescaleDB chunk-based partitioning.
            CREATE TABLE sensor_data (
                id          BIGSERIAL      NOT NULL,
                device_id   BIGINT         NOT NULL,
                recorded_at TIMESTAMPTZ    NOT NULL,
                temperature NUMERIC(5,2)   NOT NULL,
                humidity    NUMERIC(5,2)   NOT NULL,
                motion      BOOLEAN        NOT NULL,
                light       NUMERIC(10,2)  NOT NULL,
                obstacle    BOOLEAN        NOT NULL,
                status      VARCHAR(10)    NOT NULL,
                created_at  TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id, recorded_at),
                CONSTRAINT chk_sensor_data_status CHECK (status IN ('NORMAL', 'WARNING', 'DANGER')),
                CONSTRAINT fk_sensor_data_device_id
                    FOREIGN KEY (device_id) REFERENCES devices (id)
                    ON DELETE RESTRICT
            );

            CREATE TABLE alerts (
                id             BIGSERIAL    PRIMARY KEY,
                device_id      BIGINT       NOT NULL,
                sensor_data_id BIGINT       NOT NULL,
                status         VARCHAR(10)  NOT NULL,
                triggered_at   TIMESTAMPTZ  NOT NULL,
                created_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT chk_alerts_status CHECK (status IN ('WARNING', 'DANGER')),
                CONSTRAINT fk_alerts_device_id
                    FOREIGN KEY (device_id) REFERENCES devices (id)
                    ON DELETE RESTRICT
            );

            CREATE TABLE system_logs (
                id         BIGSERIAL    PRIMARY KEY,
                device_id  BIGINT       NULL,
                log_level  VARCHAR(10)  NOT NULL,
                source     VARCHAR(255) NOT NULL,
                message    TEXT         NOT NULL,
                created_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT chk_system_logs_log_level CHECK (log_level IN ('info', 'warning', 'error')),
                CONSTRAINT fk_system_logs_device_id
                    FOREIGN KEY (device_id) REFERENCES devices (id)
                    ON DELETE RESTRICT
            );

            -- Hypertable (DDD §8)
            -- recorded_at is the time column; chunks are created per day.
            SELECT create_hypertable(
                'sensor_data',
                'recorded_at',
                chunk_time_interval => INTERVAL '1 day',
                if_not_exists       => TRUE
            );

            -- Indexes (DDD §9)
            CREATE INDEX idx_sensor_data_device_id_recorded_at
                ON sensor_data (device_id, recorded_at);
            CREATE INDEX idx_sensor_data_device_id
                ON sensor_data (device_id);
            CREATE INDEX idx_alerts_device_id_triggered_at
                ON alerts (device_id, triggered_at);
            CREATE INDEX idx_alerts_status
                ON alerts (status);
            CREATE INDEX idx_alerts_device_id
                ON alerts (device_id);
            CREATE INDEX idx_system_logs_device_id
                ON system_logs (device_id);
        SQL);

        // NOTE on fk_alerts_sensor_data_id (DDD §6.3, §7, §10):
        // alerts.sensor_data_id intentionally has no FOREIGN KEY constraint
        // on PostgreSQL/TimescaleDB. sensor_data is a hypertable with a
        // composite primary key (id, recorded_at) per DDD §6.2, and
        // PostgreSQL only allows a foreign key to reference a column (or
        // column set) covered by a UNIQUE constraint or PRIMARY KEY — `id`
        // alone is not unique, so a FK on `id` is rejected (SQLSTATE
        // 42830), and TimescaleDB additionally does not support foreign
        // keys referencing a hypertable. This mirrors the SERON schema,
        // where anomaly_event.data_id references sensor_data (also a
        // hypertable with a composite primary key) without a FOREIGN KEY
        // constraint for the same reason. The relationship is still
        // enforced at the application layer, and remains a real FOREIGN
        // KEY (fk_alerts_sensor_data_id) on SQLite for local development.
    }

    private function downPostgres(): void
    {
        // Drop in reverse dependency order (system_logs -> alerts ->
        // sensor_data -> devices). CASCADE releases the hypertable
        // dependency implied by TimescaleDB.
        DB::unprepared(<<<'SQL'
            DROP TABLE IF EXISTS system_logs CASCADE;
            DROP TABLE IF EXISTS alerts CASCADE;
            DROP TABLE IF EXISTS sensor_data CASCADE;
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