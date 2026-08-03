<?php

namespace App\Services;

use App\Repositories\Contracts\DeviceRepositoryInterface;
use App\Services\Contracts\SystemStatusServiceInterface;

/**
 * Produces aggregated system status information for the dashboard.
 *
 * Delegates the aggregation entirely to the DeviceRepository so the service
 * keeps its business-logic boundary (ADR-002 §1.4).
 */
class SystemStatusService implements SystemStatusServiceInterface
{
    public function __construct(
        private readonly DeviceRepositoryInterface $deviceRepository
    ) {
    }

    /**
     * Get aggregated system status: total/online/offline device counts and
     * each device's latest sensor status.
     *
     * @return array<string, mixed>
     */
    public function getSystemStatus(): array
    {
        return $this->deviceRepository->getSystemStatus();
    }
}
