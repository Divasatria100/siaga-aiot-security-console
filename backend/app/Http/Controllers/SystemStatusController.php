<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Contracts\SystemStatusServiceInterface;
use Illuminate\Http\JsonResponse;

/**
 * Handles HTTP requests for the system status resource.
 *
 * This controller is responsible only for the HTTP layer:
 * receiving requests, delegating to the SystemStatusService, and
 * returning a simple JSON response.
 *
 * @see docs/06-api-specification.md section 6.4
 */
class SystemStatusController extends Controller
{
    /**
     * Create a new SystemStatusController instance.
     *
     * @param  SystemStatusServiceInterface  $systemStatusService  The system status service contract.
     */
    public function __construct(
        private readonly SystemStatusServiceInterface $systemStatusService
    ) {
    }

    /**
     * Get the aggregated system status for the dashboard.
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $result = $this->systemStatusService->getSystemStatus();

        return response()->json([
            'data' => $result,
        ]);
    }
}
