<?php

namespace App\Repositories;

use App\Models\Device;
use App\Models\SensorData;
use App\Repositories\Contracts\DeviceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DeviceRepository implements DeviceRepositoryInterface
{
    /**
     * Find a device by its unique business identifier (device_id).
     */
    public function findByDeviceId(string $deviceId): ?Device
    {
        return Device::query()->where('device_id', $deviceId)->first();
    }

    /**
     * Find a device by its primary key.
     */
    public function findById(int $id): ?Device
    {
        return Device::query()->find($id);
    }

    /**
     * Get all devices, optionally filtered by connection status.
     */
    public function getAll(?string $status = null): LengthAwarePaginator
    {
        return Device::query()
            ->when($status, fn ($query) => $query->where('status', $status))
            ->paginate();
    }

    /**
     * Create a device if it does not exist, or update it if it does.
     *
     * Matches on the unique business key (device_id) per API Spec
     * section 6.2.1 auto-registration behavior.
     */
    public function createOrUpdate(array $data): Device
    {
        return Device::query()->updateOrCreate(
            ['device_id' => $data['device_id']],
            $data
        );
    }

    /**
     * Update the last_seen_at timestamp and connection status of a device.
     */
    public function updateLastSeen(int $deviceId, string $status): void
    {
        Device::query()
            ->where('id', $deviceId)
            ->update([
                'last_seen_at' => now(),
                'status' => $status,
            ]);
    }

    /**
     * Get aggregate system status for the dashboard.
     *
     * Returns device counts plus each device's latest sensor status.
     * Uses a single correlated subquery to fetch the latest sensor status
     * per device, avoiding the N+1 query problem.
     */
    public function getSystemStatus(): array
    {
        $devices = Device::query()
            ->select('device_id', 'status', 'last_seen_at')
            ->addSelect([
                'latest_status' => SensorData::query()
                    ->select('status')
                    ->whereColumn('sensor_data.device_id', 'devices.id')
                    ->orderByDesc('recorded_at')
                    ->limit(1),
            ])
            ->get()
            ->map(function (Device $device): array {
                return [
                    'device_id' => $device->device_id,
                    'status' => $device->status,
                    'latest_status' => $device->latest_status,
                    'last_seen_at' => $device->last_seen_at,
                ];
            });

        return [
            'total_devices' => $devices->count(),
            'online_devices' => $devices->where('status', 'online')->count(),
            'offline_devices' => $devices->where('status', 'offline')->count(),
            'devices' => $devices->values(),
        ];
    }
}
