<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * SIAGA — alerts table (DDD §6.3).
 *
 * PostgreSQL: alerts.sensor_data_id intentionally has NO FOREIGN KEY
 * constraint. sensor_data is a hypertable with a composite primary key
 * (id, recorded_at), so a FK on `id` alone is rejected by PostgreSQL
 * (SQLSTATE 42830), and TimescaleDB does not support foreign keys
 * referencing a hypertable. The relationship is enforced at the
 * application layer. A real FOREIGN KEY (fk_alerts_sensor_data_id)
 * IS created on SQLite for local development.
 *
 * SQLite check constraint is enforced via a trigger.
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

            -- Indexes (DDD §9)
            CREATE INDEX idx_alerts_device_id_triggered_at
                ON alerts (device_id, triggered_at);
            CREATE INDEX idx_alerts_status
                ON alerts (status);
            CREATE INDEX idx_alerts_device_id
                ON alerts (device_id);
        SQL);
    }

    private function downPostgres(): void
    {
        DB::unprepared('DROP TABLE IF EXISTS alerts CASCADE;');
    }

    private function upSqlite(): void
    {
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

        // Check-constraint equivalents for SQLite (see class docblock).
        // SQLite trigger grammar does not accept "INSERT OR UPDATE", so
        // separate BEFORE INSERT and BEFORE UPDATE triggers are created.
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_alerts_status_check
            BEFORE INSERT ON alerts
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('WARNING', 'DANGER'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_alerts_status violation: status must be WARNING or DANGER');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_alerts_status_update_check
            BEFORE UPDATE ON alerts
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('WARNING', 'DANGER'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_alerts_status violation: status must be WARNING or DANGER');
            END;
        SQL);
    }

    private function downSqlite(): void
    {
        // The triggers are dropped automatically with their table.
        Schema::dropIfExists('alerts');
    }
};
