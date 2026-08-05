<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms a SensorData model into the API response shape.
 *
 * This resource is responsible only for response transformation. It does
 * not contain business logic, run database queries, or eager-load
 * relationships. The business-key device_id is only included when the
 * device relation has already been loaded by the Service Layer.
 *
 * @see docs/06-api-specification.md section 6.2
 */
class SensorDataResource extends JsonResource
{
    /**
     * Transform the sensor data resource into an array.
     *
     * @param  Request  $request  The incoming HTTP request.
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_id' => $this->whenLoaded('device', fn () => $this->device?->device_id),
            'recorded_at' => $this->recorded_at?->toIso8601ZuluString(),
            'temperature' => (float) $this->temperature,
            'humidity' => (float) $this->humidity,
            'motion' => (bool) $this->motion,
            'light' => (float) $this->light,
            'obstacle' => (bool) $this->obstacle,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601ZuluString(),
        ];
    }
}
