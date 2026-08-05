<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GetDevicesRequest;
use App\Http\Resources\DeviceResource;
use App\Services\Contracts\DeviceServiceInterface;
use Illuminate\Http\JsonResponse;

/**
 * Handles HTTP requests for the devices resource.
 *
 * This controller is responsible only for the HTTP layer:
 * receiving requests, delegating to the DeviceService, and
 * returning a simple JSON response.
 *
 * @see docs/06-api-specification.md section 6.1
 */
class DeviceController extends Controller
{
    /**
     * Create a new DeviceController instance.
     *
     * @param  DeviceServiceInterface  $deviceService  The device service contract.
     */
    public function __construct(
        private readonly DeviceServiceInterface $deviceService
    ) {
    }

    /**
     * Get a paginated list of devices, optionally filtered by status.
     *
     * @param  GetDevicesRequest  $request  Validated request.
     * @return JsonResponse
     */
    public function index(GetDevicesRequest $request): JsonResponse
    {
        $status = $request->validated()['status'] ?? null;

        $result = $this->deviceService->getAllDevices($status);

        return DeviceResource::collection($result)->response();
    }

    /**
     * Get a single device by its business key (device_id).
     *
     * @param  string  $deviceId  The unique device business key.
     * @return JsonResponse
     */
    public function show(string $deviceId): JsonResponse
    {
        $result = $this->deviceService->getDeviceByDeviceId($deviceId);

        return (new DeviceResource($result))->response();
    }
}
