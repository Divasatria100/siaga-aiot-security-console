<?php

namespace App\Repositories;

use App\Models\Alert;
use App\Models\Device;
use App\Repositories\Contracts\AlertRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AlertRepository implements AlertRepositoryInterface
{
    /**
     * Store a new alert record (derived from a WARNING/DANGER sensor reading).
     */
    public function create(array $data): Alert
    {
        return Alert::query()->create($data);
    }

    /**
     * Get paginated alert history with optional filters.
     *
     * The device relation is eager loaded so the API Resource can expose
     * the device business key without triggering a lazy-load query.
     */
    public function getAll(
        ?string $deviceId = null,
        ?string $status = null,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = Alert::query()
            ->with('device');

        if ($deviceId !== null) {
            $query->whereHas('device', function ($q) use ($deviceId) {
                $q->where('device_id', $deviceId);
            });
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        if ($startDate !== null) {
            $query->where('triggered_at', '>=', $startDate);
        }

        if ($endDate !== null) {
            $query->where('triggered_at', '<=', $endDate);
        }

        return $query
            ->orderByDesc('triggered_at')
            ->paginate($perPage);
    }

    /**
     * Find a single alert record with its related sensor data and device.
     *
     * The device and sensorData relations are eager loaded so the API
     * Resource can expose the device business key and the nested sensor
     * data without triggering a lazy-load query.
     */
    public function findById(int $id): ?Alert
    {
        return Alert::query()
            ->with(['device', 'sensorData'])
            ->find($id);
    }
}
