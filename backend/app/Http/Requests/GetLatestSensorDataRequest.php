<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the parameters for fetching the most recent sensor reading
 * of a device.
 *
 * Ensures the device_id is present and correctly typed before reaching
 * the SensorDataService (ADR-003 Phase 1).
 */
class GetLatestSensorDataRequest extends FormRequest
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
            'device_id' => ['required', 'string', 'max:255'],
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
            'device_id.required' => 'The device_id field is required.',
            'device_id.string' => 'The device_id must be a string.',
            'device_id.max' => 'The device_id must not exceed 255 characters.',
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
            'device_id' => 'device_id',
        ];
    }
}
