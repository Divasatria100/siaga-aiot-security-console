<?php

use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render structured JSON error responses for API requests only.
        $exceptions->shouldRenderJsonWhen(function (Request $request): bool {
            return $request->is('api/*');
        });

        // Validation errors → 422 Unprocessable Entity.
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'VALIDATION_ERROR',
                    'Data yang dikirimkan tidak valid',
                    $e->errors(),
                    422
                );
            }
        });

        // Model not found → 404 Not Found.
        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'NOT_FOUND',
                    'Resource yang diminta tidak ditemukan',
                    [],
                    404
                );
            }
        });

        // Route not found → 404 Not Found.
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'NOT_FOUND',
                    'Resource yang diminta tidak ditemukan',
                    [],
                    404
                );
            }
        });

        // Method not allowed → 405 Method Not Allowed.
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'METHOD_NOT_ALLOWED',
                    'Metode HTTP tidak diizinkan untuk endpoint ini',
                    [],
                    405
                );
            }
        });

        // Unauthenticated → 401 Unauthorized.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'UNAUTHENTICATED',
                    'Autentikasi diperlukan',
                    [],
                    401
                );
            }
        });

        // Unauthorized action → 403 Forbidden.
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'FORBIDDEN',
                    'Akses ditolak',
                    [],
                    403
                );
            }
        });

        // Any other exception → 500 Internal Server Error.
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    'INTERNAL_SERVER_ERROR',
                    'Terjadi kesalahan pada server',
                    [],
                    500
                );
            }
        });
    })->create();
