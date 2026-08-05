<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GetAlertsRequest;
use App\Http\Resources\AlertResource;
use App\Services\Contracts\AlertServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

/**
 * Handles HTTP requests for the alerts resource.
 *
 * This controller is responsible only for the HTTP layer:
 * receiving requests, delegating to the AlertService, and
 * returning a simple JSON response.
 *
 * @see docs/06-api-specification.md section 6.3
 */
class AlertController extends Controller
{
    /**
     * Create a new AlertController instance.
     *
     * @param  AlertServiceInterface  $alertService  The alert service contract.
     */
    public function __construct(
        private readonly AlertServiceInterface $alertService
    ) {
    }

    /**
     * Get a paginated list of alerts with optional filters.
     *
     * @param  GetAlertsRequest  $request  Validated request.
     * @return JsonResponse
     */
    public function index(GetAlertsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->alertService->getAllAlerts(
            $validated['device_id'] ?? null,
            $validated['status'] ?? null,
            isset($validated['start_date'])
                ? Carbon::parse($validated['start_date'])
                : null,
            isset($validated['end_date'])
                ? Carbon::parse($validated['end_date'])
                : null,
            (int) ($validated['per_page'] ?? 20)
        );

        return AlertResource::collection($result)->response();
    }

    /**
     * Get a single alert by its primary key.
     *
     * @param  int  $id  The alert primary key.
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->alertService->getAlertById($id);

        return (new AlertResource($result))->response();
    }
}
