<?php

namespace App\Services\Contracts;

use App\Models\Alert;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Contract for the AlertService.
 *
 * Manages the alert resource as read-only. Alerts are never written through
 * this service; they are derived internally by SensorDataService during
 * ingestion when a WARNING/DANGER reading is received.
 *
 * @see ADR-002 §1.3, §4
 */
interface AlertServiceInterface
{
    /**
     * Get paginated alert history with optional filters.
     *
     * @param  string|null  $deviceId  Optional device business key filter.
     * @param  string|null  $status  Optional alert status filter (WARNING/DANGER).
     * @param  Carbon|null  $startDate  Optional start of triggered_at range.
     * @param  Carbon|null  $endDate  Optional end of triggered_at range.
     * @param  int  $perPage  Number of records per page (default 20).
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAllAlerts(
        ?string $deviceId = null,
        ?string $status = null,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null,
        int $perPage = 20
    ): LengthAwarePaginator;

    /**
     * Get a single alert by its primary key, with related sensor data.
     *
     * @param  int  $id  The alert primary key.
     * @return \App\Models\Alert
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getAlertById(int $id): Alert;
}
