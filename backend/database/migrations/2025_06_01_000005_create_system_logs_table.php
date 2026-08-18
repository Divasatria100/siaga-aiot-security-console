<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * SIAGA — system_logs table (DDD §6.4).
 *
 * device_id is nullable (logs unrelated to a specific device), with a
 * RESTRICT foreign key to devices. SQLite check constraint is enforced
 * via a trigger.
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

            -- Index (DDD §9)
            CREATE INDEX idx_system_logs_device_id
                ON system_logs (device_id);
        SQL);
    }

    private function downPostgres(): void
    {
        DB::unprepared('DROP TABLE IF EXISTS system_logs CASCADE;');
    }

    private function upSqlite(): void
    {
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

        // Check-constraint equivalents for SQLite (see class docblock).
        // SQLite trigger grammar does not accept "INSERT OR UPDATE", so
        // separate BEFORE INSERT and BEFORE UPDATE triggers are created.
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_system_logs_log_level_check
            BEFORE INSERT ON system_logs
            FOR EACH ROW
            WHEN (NEW.log_level NOT IN ('info', 'warning', 'error'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_system_logs_log_level violation: log_level must be info, warning or error');
            END;
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS trg_system_logs_log_level_update_check
            BEFORE UPDATE ON system_logs
            FOR EACH ROW
            WHEN (NEW.log_level NOT IN ('info', 'warning', 'error'))
            BEGIN
                SELECT RAISE(ABORT, 'chk_system_logs_log_level violation: log_level must be info, warning or error');
            END;
        SQL);
    }

    private function downSqlite(): void
    {
        // The triggers are dropped automatically with their table.
        Schema::dropIfExists('system_logs');
    }
};
