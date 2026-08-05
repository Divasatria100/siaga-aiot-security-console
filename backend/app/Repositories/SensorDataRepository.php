<?php

namespace App\Repositories;

use App\Models\Device;
use App\Models\SensorData;
use App\Repositories\Contracts\SensorDataRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SensorDataRepository implements SensorDataRepositoryInterface
{
    /**
     * Store a new sensor data record (primary write path).
     *
     * The device relation is loaded so the API Resource can expose the
     * device business key without triggering a lazy-load query.
     */
    public function create(array $data): SensorData
    {
        return SensorData::query()
            ->create($data)
            ->load('device');
    }

    /**
     * Get the most recent sensor data record for a device.
     *
     * Orders by recorded_at DESC because recorded_at is the hypertable
     * time column (DDD section 8). The device relation is eager loaded so
     * the API Resource can expose the device business key without
     * triggering a lazy-load query.
     */
    public function getLatestByDeviceId(string $deviceId): ?SensorData
    {
        return SensorData::query()
            ->with('device')
            ->whereHas('device', function ($query) use ($deviceId) {
                $query->where('device_id', $deviceId);
            })
            ->orderByDesc('recorded_at')
            ->first();
    }

    /**
     * Get paginated sensor data history for a device within a time range.
     *
     * Filters on both device_id and recorded_at to leverage the composite
     * index (DDD section 9) and TimescaleDB chunk pruning. The device
     * relation is eager loaded so the API Resource can expose the device
     * business key without triggering a lazy-load query.
     */
    public function getHistoryByDeviceId(
        string $deviceId,
        Carbon $startDate,
        Carbon $endDate,
        int $perPage = 50
    ): LengthAwarePaginator {
        return SensorData::query()
            ->with('device')
            ->whereHas('device', function ($query) use ($deviceId) {
                $query->where('device_id', $deviceId);
            })
            ->whereBetween('recorded_at', [$startDate, $endDate])
            ->orderByDesc('recorded_at')
            ->paginate($perPage);
    }

    /**
     * Find a single sensor data record by its primary key.
     */
    public function findById(int $id): ?SensorData
    {
        return SensorData::query()->find($id);
    }
}
