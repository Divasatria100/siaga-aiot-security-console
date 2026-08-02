<?php

namespace App\Providers;

use App\Repositories\AlertRepository;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\DeviceRepositoryInterface;
use App\Repositories\Contracts\SensorDataRepositoryInterface;
use App\Repositories\Contracts\SystemLogRepositoryInterface;
use App\Repositories\DeviceRepository;
use App\Repositories\SensorDataRepository;
use App\Repositories\SystemLogRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            DeviceRepositoryInterface::class,
            DeviceRepository::class
        );

        $this->app->bind(
            SensorDataRepositoryInterface::class,
            SensorDataRepository::class
        );

        $this->app->bind(
            AlertRepositoryInterface::class,
            AlertRepository::class
        );

        $this->app->bind(
            SystemLogRepositoryInterface::class,
            SystemLogRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
