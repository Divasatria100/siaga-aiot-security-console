<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Central helper for shaping the SIAGA API response contract.
 *
 * This helper is responsible ONLY for wrapping JSON responses into the
 * contract defined in docs/06-api-specification.md chapter 9. It contains
 * no business logic and performs no database queries.
 *
 * @see docs/ADR.md ADR-005
 */
class ApiResponse
{
    /**
     * Build a success response.
     *
     * @param  mixed  $data  The resource payload to wrap.
     * @param  string|null  $message  Optional human-readable message.
     * @param  int  $status  HTTP status code.
     */
    public static function success(mixed $data, ?string $message = null, int $status = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'data' => $data,
        ];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }

    /**
     * Build a paginated success response.
     *
     * The resource collection remains the single source of data
     * transformation; this helper only extracts the flattened item array
     * and the pagination metadata from the paginator.
     *
     * @param  LengthAwarePaginator  $paginator  The underlying paginator.
     * @param  AnonymousResourceCollection  $collection  The transformed resource collection.
     * @param  string|null  $message  Optional human-readable message.
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        AnonymousResourceCollection $collection,
        ?string $message = null
    ): JsonResponse {
        $payload = [
            'success' => true,
            'data' => $collection->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload);
    }

    /**
     * Build an error response.
     *
     * @param  string  $code  Stable machine-readable error code.
     * @param  string  $message  Human-readable error message.
     * @param  array<string, mixed>  $details  Optional structured error details.
     * @param  int  $status  HTTP status code.
     */
    public static function error(
        string $code,
        string $message,
        array $details = [],
        int $status = 500
    ): JsonResponse {
        // Per API Spec §9.2, details must be an empty object ({}) when no
        // structured error details are provided. It only becomes an
        // associative array when a ValidationException supplies field errors.
        $errorDetails = $details === [] ? (object) [] : $details;

        return response()->json([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $errorDetails,
            ],
        ], $status);
    }
}
