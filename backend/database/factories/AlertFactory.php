<?php

namespace Database\Factories;

use App\Models\Alert;
use App\Models\Device;
use App\Models\SensorData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Alert>
 */
class AlertFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sensorData = SensorData::factory()->create();

        return [
            'device_id' => $sensorData->device_id,
            'sensor_data_id' => $sensorData->id,
            'status' => fake()->randomElement(['WARNING', 'DANGER']),
            'triggered_at' => $sensorData->recorded_at,
        ];
    }

    /**
     * Indicate that the alert has a warning status.
     */
    public function warning(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'WARNING',
        ]);
    }

    /**
     * Indicate that the alert has a danger status.
     */
    public function danger(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'DANGER',
        ]);
    }
}
