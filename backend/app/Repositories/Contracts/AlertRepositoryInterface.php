<?php

namespace App\Repositories\Contracts;

use App\Models\Alert;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRepositoryInterface
{
    /**
     * Store a new alert record.
     *
     * Called internally by the Service Layer when incoming sensor data has
     * a status of WARNING or DANGER (API Spec section 7.3). The alert is a
     * derived entity from a single sensor_data record (DDD section 5.1).
     * The Service Layer is responsible for verifying that the referenced
     * sensor_data record exists before calling this method.
     *
     * @param  array  $data  The alert payload.
     * @return \App\Models\Alert
     */
    public function create(array $data): Alert;

    /**
     * Get paginated alert history with optional filters.
     *
     * Used by GET /api/v1/alerts (API Spec section 6.3.1) for the Alert
     * Module on the React Dashboard (SRS section 5.6). Supports optional
     * filters by device, alert status (WARNING/DANGER), and triggered_at
     * date range.
     *
     * @param  string|null  $deviceId  Optional device business key filter.
     * @param  string|null  $status  Optional alert status filter.
     * @param  Carbon|null  $startDate  Optional start of triggered_at range.
     * @param  Carbon|null  $endDate  Optional end of triggered_at range.
     * @param  int  $perPage  Number of records per page (default 20).
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAll(
        ?string $deviceId = null,
        ?string $status = null,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null,
        int $perPage = 20
    ): LengthAwarePaginator;

    /**
     * Find a single alert record by its primary key.
     *
     * Used by GET /api/v1/alerts/{id} (API Spec section 6.3.2). The
     * related sensor_data record is eager-loaded so the response can
     * include the sensor readings that triggered the alert.
     *
     * @param  int  $id  The alert primary key.
     * @return \App\Models\Alert|null
     */
    public function findById(int $id): ?Alert;
}
