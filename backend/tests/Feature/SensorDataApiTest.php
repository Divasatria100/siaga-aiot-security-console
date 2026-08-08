<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\SensorData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorDataApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * POST /api/v1/devices/{device_id}/sensor-data — happy path auto-registers device and stores reading.
     */
    public function test_can_store_sensor_data_for_new_device(): void
    {
        $deviceId = 'SIAGA-STORE-001';
        $payload = [
            'recorded_at' => now()->toIso8601String(),
            'temperature' => 25.5,
            'humidity' => 60.2,
            'motion' => true,
            'light' => 120.5,
            'obstacle' => false,
            'status' => 'NORMAL',
        ];

        $response = $this->postJson("/api/v1/devices/{$deviceId}/sensor-data", $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'device_id',
                    'recorded_at',
                    'temperature',
                    'humidity',
                    'motion',
                    'light',
                    'obstacle',
                    'status',
                    'created_at',
                ],
                'message',
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.device_id', $deviceId)
            ->assertJsonPath('data.status', 'NORMAL');

        $this->assertDatabaseHas('sensor_data', [
            'device_id' => Device::where('device_id', $deviceId)->first()->id,
            'status' => 'NORMAL',
        ]);
    }

    /**
     * POST /api/v1/devices/{device_id}/sensor-data — WARNING status derives an alert.
     */
    public function test_storing_warning_sensor_data_creates_alert(): void
    {
        $deviceId = 'SIAGA-STORE-002';
        $payload = [
            'recorded_at' => now()->toIso8601String(),
            'temperature' => 36.0,
            'humidity' => 80.0,
            'motion' => true,
            'light' => 300.0,
            'obstacle' => true,
            'status' => 'WARNING',
        ];

        $response = $this->postJson("/api/v1/devices/{$deviceId}/sensor-data", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('alerts', [
            'status' => 'WARNING',
        ]);
    }

    /**
     * POST /api/v1/devices/{device_id}/sensor-data — returns 422 validation error for invalid payload.
     */
    public function test_store_sensor_data_returns_validation_error(): void
    {
        $response = $this->postJson('/api/v1/devices/SIAGA-STORE-003/sensor-data', [
            'temperature' => 25.5, // missing required fields
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'error' => [
                    'code',
                    'message',
                    'details',
                ],
            ])
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    /**
     * GET /api/v1/sensor-data/latest — happy path returns latest reading.
     */
    public function test_can_get_latest_sensor_data(): void
    {
        $device = Device::factory()->online()->create();
        SensorData::factory()->create(['device_id' => $device->id, 'recorded_at' => now()->subHour()]);
        $latest = SensorData::factory()->create(['device_id' => $device->id, 'recorded_at' => now()]);

        $response = $this->getJson('/api/v1/sensor-data/latest?device_id='.$device->device_id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'device_id',
                    'recorded_at',
                    'temperature',
                    'humidity',
                    'motion',
                    'light',
                    'obstacle',
                    'status',
                    'created_at',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $latest->id)
            ->assertJsonPath('data.device_id', $device->device_id);
    }

    /**
     * GET /api/v1/sensor-data/latest — returns 422 when device_id is missing.
     */
    public function test_latest_sensor_data_returns_validation_error(): void
    {
        $response = $this->getJson('/api/v1/sensor-data/latest');

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    /**
     * GET /api/v1/sensor-data/latest — returns 404 when device has no sensor data.
     */
    public function test_latest_sensor_data_returns_404_when_no_data(): void
    {
        $device = Device::factory()->create(['device_id' => 'SIAGA-NODATA']);

        $response = $this->getJson('/api/v1/sensor-data/latest?device_id='.$device->device_id);

        $response->assertStatus(404)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'NOT_FOUND');
    }

    /**
     * GET /api/v1/sensor-data/history — happy path returns paginated history.
     */
    public function test_can_get_sensor_data_history(): void
    {
        $device = Device::factory()->create();
        SensorData::factory()->count(3)->create([
            'device_id' => $device->id,
            'recorded_at' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/v1/sensor-data/history?device_id='.$device->device_id.'&start_date='.urlencode(now()->subDays(2)->toIso8601String()).'&end_date='.urlencode(now()->toIso8601String()));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonCount(3, 'data');
    }

    /**
     * GET /api/v1/sensor-data/history — supports pagination.
     */
    public function test_sensor_data_history_supports_pagination(): void
    {
        $device = Device::factory()->create();
        SensorData::factory()->count(5)->create([
            'device_id' => $device->id,
            'recorded_at' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/v1/sensor-data/history?device_id='.$device->device_id.'&start_date='.urlencode(now()->subDays(2)->toIso8601String()).'&end_date='.urlencode(now()->toIso8601String()).'&per_page=2');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonCount(2, 'data');
    }

    /**
     * GET /api/v1/sensor-data/history — returns 422 validation error for invalid date range.
     */
    public function test_sensor_data_history_returns_validation_error_for_invalid_range(): void
    {
        $device = Device::factory()->create();

        $response = $this->getJson('/api/v1/sensor-data/history?device_id='.$device->device_id.'&start_date='.now()->toIso8601String().'&end_date='.now()->subDay()->toIso8601String());

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    /**
     * GET /api/v1/sensor-data/history — returns 422 validation error for missing required params.
     */
    public function test_sensor_data_history_returns_validation_error_for_missing_params(): void
    {
        $response = $this->getJson('/api/v1/sensor-data/history');

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }
}
