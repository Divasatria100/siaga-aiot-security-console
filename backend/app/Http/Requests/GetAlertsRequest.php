<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the query parameters for fetching paginated alerts.
 *
 * Ensures the optional device_id, status, date range, and pagination
 * parameters are structurally valid before reaching the AlertService
 * (ADR-003 Phase 1). The date range is only enforced when both
 * start_date and end_date are present.
 */
class GetAlertsRequest extends FormRequest
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
            'device_id' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:WARNING,DANGER'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
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
            'device_id.string' => 'The device_id must be a string.',
            'device_id.max' => 'The device_id must not exceed 255 characters.',
            'status.in' => 'The selected status is invalid. It must be one of WARNING, DANGER.',
            'start_date.date' => 'The start_date must be a valid date.',
            'end_date.date' => 'The end_date must be a valid date.',
            'end_date.after_or_equal' => 'The end_date must be a date after or equal to the start_date.',
            'page.integer' => 'The page must be an integer.',
            'page.min' => 'The page must be at least 1.',
            'per_page.integer' => 'The per_page must be an integer.',
            'per_page.min' => 'The per_page must be at least 1.',
            'per_page.max' => 'The per_page must not exceed 100.',
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
            'status' => 'status',
            'start_date' => 'start_date',
            'end_date' => 'end_date',
            'page' => 'page',
            'per_page' => 'per_page',
        ];
    }
}
