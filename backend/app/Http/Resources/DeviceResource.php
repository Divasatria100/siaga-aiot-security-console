<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms a Device model into the API response shape.
 *
 * This resource is responsible only for response transformation. It does
 * not contain business logic, run database queries, or eager-load
 * relationships.
 *
 * @see docs/06-api-specification.md section 6.1
 */
class DeviceResource extends JsonResource
{
    /**
     * Transform the device resource into an array.
     *
     * @param  Request  $request  The incoming HTTP request.
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'device_id' => $this->device_id,
            'name' => $this->name,
            'status' => $this->status,
            'last_seen_at' => $this->last_seen_at?->toIso8601ZuluString(),
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
