<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GetLatestSensorDataRequest;
use App\Http\Requests\GetSensorDataHistoryRequest;
use App\Http\Requests\StoreSensorDataRequest;
use App\Services\Contracts\SensorDataServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

/**
 * Handles HTTP requests for the sensor-data resource.
 *
 * This controller is responsible only for the HTTP layer:
 * receiving requests, delegating to the SensorDataService, and
 * returning a simple JSON response.
 *
 * @see docs/06-api-specification.md section 6.2
 */
class SensorDataController extends Controller
{
    /**
     * Create a new SensorDataController instance.
     *
     * @param  SensorDataServiceInterface  $sensorDataService  The sensor data service contract.
     */
    public function __construct(
        private readonly SensorDataServiceInterface $sensorDataService
    ) {
    }

    /**
     * Persist a new sensor reading for a device.
     *
     * @param  StoreSensorDataRequest  $request  Validated request.
     * @param  string  $deviceId  The unique device business key.
     * @return JsonResponse
     */
    public function store(StoreSensorDataRequest $request, string $deviceId): JsonResponse
    {
        $result = $this->sensorDataService->storeSensorData(
            $deviceId,
            $request->validated()
        );

        return response()->json([
            'data' => $result,
        ], 201);
    }

    /**
     * Get the most recent sensor reading for a device.
     *
     * @param  GetLatestSensorDataRequest  $request  Validated request.
     * @return JsonResponse
     */
    public function latest(GetLatestSensorDataRequest $request): JsonResponse
    {
        $deviceId = $request->validated()['device_id'];

        $result = $this->sensorDataService->getLatestSensorData($deviceId);

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Get paginated sensor data history for a device within a time range.
     *
     * @param  GetSensorDataHistoryRequest  $request  Validated request.
     * @return JsonResponse
     */
    public function history(GetSensorDataHistoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->sensorDataService->getSensorDataHistory(
            $validated['device_id'],
            Carbon::parse($validated['start_date']),
            Carbon::parse($validated['end_date']),
            (int) ($validated['per_page'] ?? 50)
        );

        return response()->json([
            'data' => $result,
        ]);
    }
}
