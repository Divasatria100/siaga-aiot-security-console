<?php

namespace App\Repositories\Contracts;

use App\Models\SensorData;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SensorDataRepositoryInterface
{
    /**
     * Store a new sensor data record.
     *
     * This is the primary write path for incoming sensor readings from the
     * ESP32 device. One payload represents one sensor reading together
     * with the system status from the Rule-Based Decision Engine and
     * Finite State Machine (FR-013, API Spec section 6.2.1).
     *
     * @param  array  $data  The sensor reading payload.
     * @return \App\Models\SensorData
     */
    public function create(array $data): SensorData;

    /**
     * Get the most recent sensor data record for a device.
     *
     * Used by GET /api/v1/sensor-data/latest (API Spec section 6.2.2) for
     * the Monitoring Module on the React Dashboard (FR-016, FR-017).
     * Ordered by recorded_at DESC because recorded_at is the hypertable
     * time column (DDD section 8).
     *
     * @param  string  $deviceId  The unique device business key.
     * @return \App\Models\SensorData|null
     */
    public function getLatestByDeviceId(string $deviceId): ?SensorData;

    /**
     * Get paginated sensor data history for a device within a time range.
     *
     * Used by GET /api/v1/sensor-data/history (API Spec section 6.2.3) for
     * the Historical Data Module on the React Dashboard (FR-018). Filters
     * on both device_id and recorded_at to leverage the composite index
     * (DDD section 9) and TimescaleDB chunk pruning.
     *
     * @param  string  $deviceId  The unique device business key.
     * @param  \Carbon\Carbon  $startDate  Start of time range (recorded_at).
     * @param  \Carbon\Carbon  $endDate  End of time range (recorded_at).
     * @param  int  $perPage  Number of records per page (default 50).
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getHistoryByDeviceId(
        string $deviceId,
        Carbon $startDate,
        Carbon $endDate,
        int $perPage = 50
    ): LengthAwarePaginator;

    /**
     * Find a single sensor data record by its primary key.
     *
     * Used by the alert detail endpoint (API Spec section 6.3.2) to return
     * the associated sensor data alongside the alert record.
     *
     * @param  int  $id  The sensor data primary key.
     * @return \App\Models\SensorData|null
     */
    public function findById(int $id): ?SensorData;
}
