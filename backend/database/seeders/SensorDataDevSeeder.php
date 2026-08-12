<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Device;
use App\Models\SensorData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Development seed — data sensor dummy untuk memvalidasi sparkline Apache
 * ECharts pada halaman Monitoring (Temperature, Humidity, Light).
 *
 * Tujuan seeder ini HANYA untuk development/testing tampilan, bukan
 * pengganti data telemetry asli:
 *  - Tidak memakai `storeSensorData`/flow API sehingga TIDAK memicu
 *    side-effect (auto-register log, alert, system log).
 *  - Tidak menyentuh data sensor existing (hanya device development baru
 *    yang dikelola di sini).
 *  - Aman dijalankan ulang: bila device development sudah punya ≥2 record
 *    dalam 1 jam terakhir, seeding dilewati tanpa menghapus apa pun.
 *
 * Jalankan: `php artisan db:seed --class=SensorDataDevSeeder`
 */
class SensorDataDevSeeder extends Seeder
{
    /**
     * Business key device development khusus — dipisah dari DEV-001 dkk.
     */
    private const DEV_DEVICE_ID = 'DEV-DEMO-001';

    /** Jumlah record = TREND_LIMIT frontend (env VITE_TREND_LIMIT=15). */
    private const RECORD_COUNT = 15;

    /** Rentang tersebar dalam 1 jam terakhir = TREND_WINDOW_MS frontend. */
    private const SPAN_MINUTES = 56;

    public function run(): void
    {
        $device = $this->resolveDevelopmentDevice();

        $recentCount = SensorData::query()
            ->where('device_id', $device->id)
            ->whereBetween('recorded_at', [now()->subHour(), now()])
            ->count();

        if ($recentCount >= 2) {
            $this->command?->info(
                "SensorDataDevSeeder: device {$device->device_id} sudah punya {$recentCount} record dalam 1 jam terakhir — seeding dilewati (idempotent)."
            );

            return;
        }

        $records = $this->buildSensorRecords($device->id);

        DB::transaction(function () use ($records, $device): void {
            foreach ($records as $record) {
                SensorData::query()->create($record);
            }

            // Pastikan status device development tetap online/terkini.
            $device->update([
                'status' => 'online',
                'last_seen_at' => now(),
            ]);
        });

        $this->command?->info(
            sprintf(
                'SensorDataDevSeeder: %d record dibuat untuk device %s dalam 1 jam terakhir.',
                self::RECORD_COUNT,
                $device->device_id
            )
        );
    }

    /**
     * Ambil atau buat device development khusus (idempotent).
     */
    private function resolveDevelopmentDevice(): Device
    {
        return Device::query()->updateOrCreate(
            ['device_id' => self::DEV_DEVICE_ID],
            [
                'name' => 'Device DEV-DEMO-001 (Development)',
                'status' => 'online',
                'last_seen_at' => now(),
            ]
        );
    }

    /**
     * Bangun 15 record sensor realistis, tersebar kronologis
     * (tertua → terbaru) dalam 1 jam terakhir.
     *
     * @param  int  $deviceId  Primary key integer device (bukan business key).
     * @return array<int, array<string, mixed>>
     */
    private function buildSensorRecords(int $deviceId): array
    {
        $records = [];

        for ($i = 0; $i < self::RECORD_COUNT; $i++) {
            $recordedAt = now()->subMinutes(self::SPAN_MINUTES - ($i * (self::SPAN_MINUTES / (self::RECORD_COUNT - 1))));

            // Temperature 24–32°C dengan fluktuasi halus (sinus + noise kecil).
            $temperature = $this->clamp(
                28.0 + (2.0 * sin($i / 2.0)) + fake()->randomFloat(2, -0.4, 0.4),
                24.0,
                32.0
            );

            // Humidity 50–70%, berkebalikan halus dengan suhu + noise kecil.
            $humidity = $this->clamp(
                60.0 - (3.5 * sin($i / 2.2)) + fake()->randomFloat(2, -1.5, 1.5),
                50.0,
                70.0
            );

            // Light 100–500 lux, variasi lebih terlihat (amplitudo besar).
            $light = $this->clamp(
                300.0 + (140.0 * sin($i / 1.6)) + fake()->randomFloat(2, -20.0, 20.0),
                100.0,
                500.0
            );

            $records[] = [
                'device_id' => $deviceId,
                'recorded_at' => $recordedAt,
                'temperature' => round($temperature, 2),
                'humidity' => round($humidity, 2),
                'motion' => in_array($i, [3, 9], true),
                'light' => round($light, 2),
                'obstacle' => $i === 7,
                'status' => $i === 7 ? 'WARNING' : 'NORMAL',
            ];
        }

        return $records;
    }

    /**
     * Batasi nilai ke rentang yang diperbolehkan constraint sensor.
     */
    private function clamp(float $value, float $min, float $max): float
    {
        return max($min, min($max, $value));
    }
}
