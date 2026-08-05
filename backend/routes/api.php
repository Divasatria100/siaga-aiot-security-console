<?php

declare(strict_types=1);

use App\Http\Controllers\AlertController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\SystemStatusController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and assigned to the "api"
| middleware group. Enjoy building your API!
|
*/

Route::prefix('v1')->group(function (): void {
    // Devices
    Route::get('devices', [DeviceController::class, 'index'])
        ->name('devices.index');

    Route::get('devices/{device_id}', [DeviceController::class, 'show'])
        ->name('devices.show');

    // Sensor Data
    Route::post('devices/{device_id}/sensor-data', [SensorDataController::class, 'store'])
        ->name('sensor-data.store');

    Route::get('sensor-data/latest', [SensorDataController::class, 'latest'])
        ->name('sensor-data.latest');

    Route::get('sensor-data/history', [SensorDataController::class, 'history'])
        ->name('sensor-data.history');

    // Alerts
    Route::get('alerts', [AlertController::class, 'index'])
        ->name('alerts.index');

    Route::get('alerts/{id}', [AlertController::class, 'show'])
        ->name('alerts.show');

    // System
    Route::get('system/status', [SystemStatusController::class, 'show'])
        ->name('system.status');
});
