<?php

namespace App\Services;

use App\Models\Alert;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Services\Contracts\AlertServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Manages the alert resource as read-only.
 *
 * Alerts are never written through this service. They are derived internally
 * by the SensorDataService during ingestion when a WARNING/DANGER reading is
 * received (ADR-002 §1.3).
 */
class AlertService implements AlertServiceInterface
{
    public function __construct(
        private readonly AlertRepositoryInterface $alertRepository
    ) {
    }

    /**
     * Get paginated alert history with optional filters.
     */
    public function getAllAlerts(
        ?string $deviceId = null,
        ?string $status = null,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        return $this->alertRepository->getAll(
            $deviceId,
            $status,
            $startDate,
            $endDate,
            $perPage
        );
    }

    /**
     * Get a single alert by its primary key, with related sensor data.
     *
     * @throws ModelNotFoundException When the alert does not exist.
     */
    public function getAlertById(int $id): Alert
    {
        return $this->alertRepository->findById($id)
            ?? throw (new ModelNotFoundException)->setModel(Alert::class, [$id]);
    }
}
