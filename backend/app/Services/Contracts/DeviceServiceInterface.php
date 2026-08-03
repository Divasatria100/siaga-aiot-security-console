<?php

namespace App\Services\Contracts;

use App\Models\Device;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Contract for the DeviceService.
 *
 * Manages the device lifecycle: listing devices, resolving a single device
 * by its business key, and the register/update flow used by auto-registration.
 *
 * @see ADR-002 §1.1, §4
 */
interface DeviceServiceInterface
{
    /**
     * Get all devices, optionally filtered by connection status.
     *
     * @param  string|null  $status  Optional filter: 'online' or 'offline'.
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAllDevices(?string $status = null): LengthAwarePaginator;

    /**
     * Get a single device by its unique business key (device_id).
     *
     * @param  string  $deviceId  The unique device business key.
     * @return \App\Models\Device
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getDeviceByDeviceId(string $deviceId): Device;

    /**
     * Register a device if it does not exist, or update it if it does.
     *
     * Used for auto-registration and device status updates (ADR-002 §4).
     *
     * @param  string  $deviceId  The unique device business key.
     * @param  array<string, mixed>  $data  Optional name/status/last_seen_at overrides.
     * @return \App\Models\Device
     */
    public function registerOrUpdateDevice(string $deviceId, array $data): Device;
}
