<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\Device;
use App\Models\SensorData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * GET /api/v1/alerts — happy path returns paginated alerts.
     */
    public function test_can_list_alerts(): void
    {
        $device = Device::factory()->create();
        $sensorData = SensorData::factory()->create([
            'device_id' => $device->id,
            'status' => 'WARNING',
        ]);

        Alert::factory()->create([
            'device_id' => $device->id,
            'sensor_data_id' => $sensorData->id,
            'status' => 'WARNING',
        ]);

        $response = $this->getJson('/api/v1/alerts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'device_id',
                        'sensor_data_id',
                        'status',
                        'triggered_at',
                        'created_at',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data');
    }

    /**
     * GET /api/v1/alerts — supports filtering by status.
     */
    public function test_can_filter_alerts_by_status(): void
    {
        $device = Device::factory()->create();

        Alert::factory()->warning()->create(['device_id' => $device->id]);
        Alert::factory()->count(2)->danger()->create(['device_id' => $device->id]);

        $response = $this->getJson('/api/v1/alerts?status=WARNING');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonCount(1, 'data');
    }

    /**
     * GET /api/v1/alerts — supports filtering by device_id.
     */
    public function test_can_filter_alerts_by_device(): void
    {
        $deviceA = Device::factory()->create();
        $deviceB = Device::factory()->create();

        Alert::factory()->count(2)->create(['device_id' => $deviceA->id]);
        Alert::factory()->count(1)->create(['device_id' => $deviceB->id]);

        $response = $this->getJson('/api/v1/alerts?device_id='.$deviceA->device_id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data');
    }

    /**
     * GET /api/v1/alerts — supports pagination.
     */
    public function test_alerts_support_pagination(): void
    {
        $device = Device::factory()->create();
        Alert::factory()->count(5)->create(['device_id' => $device->id]);

        $response = $this->getJson('/api/v1/alerts?per_page=2');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonCount(2, 'data');
    }

    /**
     * GET /api/v1/alerts — returns 422 validation error for invalid status.
     */
    public function test_alerts_returns_validation_error_for_invalid_status(): void
    {
        $response = $this->getJson('/api/v1/alerts?status=INVALID');

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
     * GET /api/v1/alerts/{id} — happy path returns a single alert.
     */
    public function test_can_show_an_alert(): void
    {
        $device = Device::factory()->create();
        $sensorData = SensorData::factory()->create([
            'device_id' => $device->id,
            'status' => 'DANGER',
        ]);
        $alert = Alert::factory()->create([
            'device_id' => $device->id,
            'sensor_data_id' => $sensorData->id,
            'status' => 'DANGER',
        ]);

        $response = $this->getJson("/api/v1/alerts/{$alert->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'device_id',
                    'sensor_data_id',
                    'status',
                    'triggered_at',
                    'created_at',
                    'sensor_data' => [
                        'temperature',
                        'humidity',
                        'motion',
                        'light',
                        'obstacle',
                    ],
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $alert->id)
            ->assertJsonPath('data.status', 'DANGER')
            ->assertJsonPath('data.device_id', $device->device_id);
    }

    /**
     * GET /api/v1/alerts/{id} — returns 404 when alert does not exist.
     */
    public function test_show_alert_returns_404_when_not_found(): void
    {
        $response = $this->getJson('/api/v1/alerts/99999');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'error' => [
                    'code',
                    'message',
                    'details',
                ],
            ])
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'NOT_FOUND');
    }
}
