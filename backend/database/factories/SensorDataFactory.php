<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\SensorData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SensorData>
 */
class SensorDataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'device_id' => Device::factory(),
            'recorded_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'temperature' => fake()->randomFloat(2, 20, 40),
            'humidity' => fake()->randomFloat(2, 40, 90),
            'motion' => fake()->boolean(),
            'light' => fake()->randomFloat(2, 0, 500),
            'obstacle' => fake()->boolean(),
            'status' => fake()->randomElement(['NORMAL', 'WARNING', 'DANGER']),
        ];
    }

    /**
     * Indicate that the sensor reading has a normal status.
     */
    public function normal(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'NORMAL',
        ]);
    }

    /**
     * Indicate that the sensor reading has a warning status.
     */
    public function warning(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'WARNING',
        ]);
    }

    /**
     * Indicate that the sensor reading has a danger status.
     */
    public function danger(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'DANGER',
        ]);
    }
}
