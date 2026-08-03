<?php

namespace App\Services;

use App\Models\Device;
use App\Repositories\Contracts\DeviceRepositoryInterface;
use App\Services\Contracts\DeviceServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Manages the device lifecycle.
 *
 * Handles listing devices, resolving a single device by its business key,
 * and the register/update flow used by auto-registration (ADR-002 §1.1).
 *
 * Does not access the database directly; all persistence and querying is
 * delegated to the DeviceRepositoryInterface.
 */
class DeviceService implements DeviceServiceInterface
{
    public function __construct(
        private readonly DeviceRepositoryInterface $deviceRepository
    ) {
    }

    /**
     * Get all devices, optionally filtered by connection status.
     */
    public function getAllDevices(?string $status = null): LengthAwarePaginator
    {
        return $this->deviceRepository->getAll($status);
    }

    /**
     * Get a single device by its unique business key (device_id).
     *
     * @throws ModelNotFoundException When the device does not exist.
     */
    public function getDeviceByDeviceId(string $deviceId): Device
    {
        return $this->deviceRepository->findByDeviceId($deviceId)
            ?? throw (new ModelNotFoundException)->setModel(Device::class, [$deviceId]);
    }

    /**
     * Register a device if it does not exist, or update it if it does.
     *
     * Defaults applied for auto-registration (ADR-002 §5, §8):
     * - name: "Device {device_id}" when no name is provided.
     * - status: 'online'.
     * - last_seen_at: now().
     */
    public function registerOrUpdateDevice(string $deviceId, array $data): Device
    {
        return $this->deviceRepository->createOrUpdate([
            'device_id' => $deviceId,
            'name' => $data['name'] ?? "Device {$deviceId}",
            'status' => $data['status'] ?? 'online',
            'last_seen_at' => $data['last_seen_at'] ?? now(),
        ]);
    }
}
