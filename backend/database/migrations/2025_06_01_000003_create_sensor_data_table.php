<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * SIAGA — sensor_data hypertable (DDD §6.2, §8).
 *
 * PostgreSQL: sensor_data is a TimescaleDB hypertable partitioned by
 * recorded_at (daily chunks). The composite primary key (id, recorded_at)
 * and the inline CHECK/FK constraints follow the DDD exactly. TimescaleDB
 * must be available, so the extension is ensured with IF NOT EXISTS.
 *
 * SQLite (local development fallback): plain table with a single bigint id
 * primary key; the composite primary key is a TimescaleDB partitioning
 * concern only. The check constraint is enforced via a trigger.
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

    private function upPostgres(): void
    {
        DB::unprepared(<<<'SQL'
            -- Extensions (DDD §2). IF NOT EXISTS because extensions survive migrate:fresh.
            CREATE EXTENSION IF NOT EXISTS timescaledb;

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

            -- Hypertable (DDD §8). Runs before CREATE INDEX so indexes are
            -- built on hypertable chunks (TimescaleDB best practice).
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
        SQL);
    }

    private function downPostgres(): void
    {
        // CASCADE releases the hypertable dependency implied by TimescaleDB.
        DB::unprepared('DROP TABLE IF EXISTS sensor_data CASCADE;');
    }

    private function upSqlite(): void
    {
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

        // Check-constraint equivalents for SQLite (see class docblock).
        // SQLite trigger grammar does not accept "INSERT OR UPDATE", so
        // separate BEFORE INSERT and BEFORE UPDATE triggers are created.
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_sensor_data_status_check
            BEFORE INSERT ON sensor_data
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('NORMAL', 'WARNING', 'DANGER'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_sensor_data_status violation: status must be NORMAL, WARNING or DANGER');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_sensor_data_status_update_check
            BEFORE UPDATE ON sensor_data
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('NORMAL', 'WARNING', 'DANGER'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_sensor_data_status violation: status must be NORMAL, WARNING or DANGER');
            END;
        SQL);
    }

    private function downSqlite(): void
    {
        // The triggers are dropped automatically with their table.
        Schema::dropIfExists('sensor_data');
    }
};
