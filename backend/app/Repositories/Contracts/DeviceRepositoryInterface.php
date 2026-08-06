<?php

namespace App\Repositories\Contracts;

use App\Models\Device;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DeviceRepositoryInterface
{
    /**
     * Find a device by its unique business identifier (device_id).
     *
     * Used by GET /api/v1/devices/{device_id} (API Spec section 6.1.2) and
     * for auto-registration verification when sensor-data is submitted.
     *
     * @param  string  $deviceId  The unique device business key (SDD section 8).
     * @return \App\Models\Device|null
     */
    public function findByDeviceId(string $deviceId): ?Device;

    /**
     * Find a device by its primary key.
     *
     * Used internally by repositories that reference devices via
     * foreign key (device_id column references devices.id).
     *
     * @param  int  $id  The device primary key.
     * @return \App\Models\Device|null
     */
    public function findById(int $id): ?Device;

    /**
     * Get all devices, optionally filtered by connection status.
     *
     * Used by GET /api/v1/devices (API Spec section 6.1.1).
     *
     * @param  string|null  $status  Optional filter: 'online' or 'offline'.
     * @param  int  $perPage  Number of records per page.
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAll(?string $status = null, int $perPage = 15): LengthAwarePaginator;

    /**
     * Create a device if it does not exist, or update it if it does.
     *
     * Auto-registration behavior per API Spec section 6.2.1: if the
     * device_id is not registered, a new record is created; otherwise
     * status and last_seen_at are updated with the incoming data.
     *
     * @param  array<string, mixed>  $data  Contains device_id, name, status, last_seen_at.
     * @return \App\Models\Device
     */
    public function createOrUpdate(array $data): Device;

    /**
     * Update the last_seen_at timestamp and connection status of a device.
     *
     * DDD section 6.1: last_seen_at is "Diperbarui setiap kali data
     * diterima dari perangkat."
     *
     * @param  int  $deviceId  The device primary key.
     * @param  string  $status  Connection status: 'online' or 'offline'.
     * @return void
     */
    public function updateLastSeen(int $deviceId, string $status): void;

    /**
     * Get aggregate system status for GET /api/v1/system/status.
     *
     * Returns total/online/offline device counts and each device's
     * latest sensor status (API Spec section 6.4.1).
     *
     * @return array<string, mixed>
     */
    public function getSystemStatus(): array;
}
