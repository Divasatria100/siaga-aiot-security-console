<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the payload for persisting a new sensor reading.
 *
 * Ensures structural integrity of the sensor ingestion payload before
 * it reaches the SensorDataService (ADR-003 Phase 1).
 */
class StoreSensorDataRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'recorded_at' => ['required', 'date'],
            'temperature' => ['required', 'numeric'],
            'humidity' => ['required', 'numeric'],
            'motion' => ['required', 'boolean'],
            'light' => ['required', 'numeric'],
            'obstacle' => ['required', 'boolean'],
            'status' => ['required', 'in:NORMAL,WARNING,DANGER'],
        ];
    }

    /**
     * Get custom validation messages for the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'recorded_at.required' => 'The recorded_at field is required.',
            'recorded_at.date' => 'The recorded_at must be a valid date.',
            'temperature.required' => 'The temperature field is required.',
            'temperature.numeric' => 'The temperature must be a number.',
            'humidity.required' => 'The humidity field is required.',
            'humidity.numeric' => 'The humidity must be a number.',
            'motion.required' => 'The motion field is required.',
            'motion.boolean' => 'The motion must be a boolean.',
            'light.required' => 'The light field is required.',
            'light.numeric' => 'The light must be a number.',
            'obstacle.required' => 'The obstacle field is required.',
            'obstacle.boolean' => 'The obstacle must be a boolean.',
            'status.required' => 'The status field is required.',
            'status.in' => 'The selected status is invalid. It must be one of NORMAL, WARNING, DANGER.',
        ];
    }

    /**
     * Get custom attribute names for the request.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'recorded_at' => 'recorded_at',
            'temperature' => 'temperature',
            'humidity' => 'humidity',
            'motion' => 'motion',
            'light' => 'light',
            'obstacle' => 'obstacle',
            'status' => 'status',
        ];
    }
}
