<?php

namespace App\Services\Contracts;

/**
 * Contract for the SystemStatusService.
 *
 * Produces aggregated system status information for the dashboard.
 *
 * @see ADR-002 §1.4, §4
 */
interface SystemStatusServiceInterface
{
    /**
     * Get aggregated system status: total/online/offline device counts and
     * each device's latest sensor status.
     *
     * @return array<string, mixed>
     */
    public function getSystemStatus(): array;
}
