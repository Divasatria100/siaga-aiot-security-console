<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * SIAGA — devices table (DDD §6.1).
 *
 * PostgreSQL + TimescaleDB uses a raw CREATE TABLE to declare the
 * TIMESTAMPTZ columns, unique constraint, and check constraint exactly
 * as defined in the Database Design Document. SQLite (local development
 * fallback) uses the schema builder; its check constraint is enforced
 * through a trigger because SQLite cannot ALTER TABLE ... ADD CHECK.
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
        SQL);
    }

    private function downPostgres(): void
    {
        DB::unprepared('DROP TABLE IF EXISTS devices CASCADE;');
    }

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

        // Check-constraint equivalents for SQLite (see class docblock).
        // SQLite trigger grammar does not accept "INSERT OR UPDATE", so
        // separate BEFORE INSERT and BEFORE UPDATE triggers are created.
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_devices_status_check
            BEFORE INSERT ON devices
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('online', 'offline'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_devices_status violation: status must be online or offline');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_devices_status_update_check
            BEFORE UPDATE ON devices
            FOR EACH ROW
            WHEN (NEW.status NOT IN ('online', 'offline'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_devices_status violation: status must be online or offline');
            END;
        SQL);
    }

    private function downSqlite(): void
    {
        // The triggers are dropped automatically with their table.
        Schema::dropIfExists('devices');
    }
};
