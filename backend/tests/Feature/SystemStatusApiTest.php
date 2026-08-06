<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\SensorData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemStatusApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * GET /api/v1/system/status — happy path returns aggregated counts.
     */
    public function test_can_get_system_status(): void
    {
        Device::factory()->online()->count(2)->create();
        Device::factory()->offline()->count(1)->create();

        $response = $this->getJson('/api/v1/system/status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_devices',
                    'online_devices',
                    'offline_devices',
                    'devices' => [
                        '*' => [
                            'device_id',
                            'status',
                            'latest_status',
                            'last_seen_at',
                        ],
                    ],
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_devices', 3)
            ->assertJsonPath('data.online_devices', 2)
            ->assertJsonPath('data.offline_devices', 1)
            ->assertJsonCount(3, 'data.devices');
    }

    /**
     * GET /api/v1/system/status — returns zero counts when no devices exist.
     */
    public function test_system_status_returns_zero_when_no_devices(): void
    {
        $response = $this->getJson('/api/v1/system/status');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_devices', 0)
            ->assertJsonPath('data.online_devices', 0)
            ->assertJsonPath('data.offline_devices', 0)
            ->assertJsonCount(0, 'data.devices');
    }

    /**
     * GET /api/v1/system/status — includes latest sensor status per device.
     */
    public function test_system_status_includes_latest_sensor_status(): void
    {
        $device = Device::factory()->online()->create();
        SensorData::factory()->create([
            'device_id' => $device->id,
            'status' => 'NORMAL',
            'recorded_at' => now()->subHour(),
        ]);
        SensorData::factory()->create([
            'device_id' => $device->id,
            'status' => 'DANGER',
            'recorded_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/system/status');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_devices', 1)
            ->assertJsonPath('data.devices.0.latest_status', 'DANGER');
    }
}
