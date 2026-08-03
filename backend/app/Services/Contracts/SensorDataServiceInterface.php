<?php

namespace App\Services\Contracts;

use App\Models\SensorData;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Contract for the SensorDataService.
 *
 * Core orchestration service for sensor ingestion.
 *
 * @see ADR-002 §1.2, §4, §5
 */
interface SensorDataServiceInterface
{
    /**
     * Primary ingestion flow. Persists a sensor reading, auto-registers the
     * device when unknown, updates device activity, and derives an alert for
     * WARNING/DANGER readings. Runs inside a database transaction.
     *
     * @param  string  $deviceId  The unique device business key.
     * @param  array<string, mixed>  $payload  The sensor reading payload.
     * @return \App\Models\SensorData
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Throwable
     */
    public function storeSensorData(string $deviceId, array $payload): SensorData;

    /**
     * Get the most recent sensor data record for a device.
     *
     * @param  string  $deviceId  The unique device business key.
     * @return \App\Models\SensorData
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getLatestSensorData(string $deviceId): SensorData;

    /**
     * Get paginated sensor data history for a device within a time range.
     *
     * @param  string  $deviceId  The unique device business key.
     * @param  \Carbon\Carbon  $startDate  Start of time range (recorded_at).
     * @param  \Carbon\Carbon  $endDate  End of time range (recorded_at).
     * @param  int  $perPage  Number of records per page (default 50).
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function getSensorDataHistory(
        string $deviceId,
        Carbon $startDate,
        Carbon $endDate,
        int $perPage = 50
    ): LengthAwarePaginator;
}
