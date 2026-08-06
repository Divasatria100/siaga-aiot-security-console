<?php

namespace Tests\Feature;

use App\Models\Device;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * GET /api/v1/devices — happy path returns paginated devices.
     */
    public function test_can_list_devices(): void
    {
        Device::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/devices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'device_id',
                        'name',
                        'status',
                        'last_seen_at',
                        'created_at',
                        'updated_at',
                    ],
                ],
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
     * GET /api/v1/devices?status=online — filters by status.
     */
    public function test_can_filter_devices_by_status(): void
    {
        Device::factory()->online()->count(2)->create();
        Device::factory()->offline()->count(1)->create();

        $response = $this->getJson('/api/v1/devices?status=online');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data');
    }

    /**
     * GET /api/v1/devices — supports pagination via per_page.
     */
    public function test_devices_pagination_is_supported(): void
    {
        Device::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/devices?per_page=2');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonCount(2, 'data');
    }

    /**
     * GET /api/v1/devices — invalid status returns 422 validation error.
     */
    public function test_devices_returns_validation_error_for_invalid_status(): void
    {
        $response = $this->getJson('/api/v1/devices?status=invalid');

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
     * GET /api/v1/devices — invalid per_page returns 422 validation error.
     */
    public function test_devices_returns_validation_error_for_invalid_per_page(): void
    {
        $response = $this->getJson('/api/v1/devices?per_page=0');

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    /**
     * GET /api/v1/devices/{device_id} — happy path returns a single device.
     */
    public function test_can_show_a_device(): void
    {
        $device = Device::factory()->online()->create();

        $response = $this->getJson("/api/v1/devices/{$device->device_id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'device_id',
                    'name',
                    'status',
                    'last_seen_at',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.device_id', $device->device_id)
            ->assertJsonPath('data.status', $device->status);
    }

    /**
     * GET /api/v1/devices/{device_id} — returns 404 when device does not exist.
     */
    public function test_show_device_returns_404_when_not_found(): void
    {
        $response = $this->getJson('/api/v1/devices/non-existent-device');

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
