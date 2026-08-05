<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms an Alert model into the API response shape.
 *
 * This resource is responsible only for response transformation. It does
 * not contain business logic, run database queries, or eager-load
 * relationships. The business-key device_id and the nested sensor_data
 * are only included when their relations have already been loaded by the
 * Service Layer.
 *
 * @see docs/06-api-specification.md section 6.3
 */
class AlertResource extends JsonResource
{
    /**
     * Transform the alert resource into an array.
     *
     * @param  Request  $request  The incoming HTTP request.
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_id' => $this->whenLoaded('device', fn () => $this->device?->device_id),
            'sensor_data_id' => $this->sensor_data_id,
            'status' => $this->status,
            'triggered_at' => $this->triggered_at?->toIso8601ZuluString(),
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'sensor_data' => $this->whenLoaded('sensorData', function (): array {
                return [
                    'temperature' => (float) $this->sensorData->temperature,
                    'humidity' => (float) $this->sensorData->humidity,
                    'motion' => (bool) $this->sensorData->motion,
                    'light' => (float) $this->sensorData->light,
                    'obstacle' => (bool) $this->sensorData->obstacle,
                ];
            }),
        ];
    }
}
