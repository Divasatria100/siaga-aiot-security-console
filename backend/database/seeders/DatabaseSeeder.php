<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * The SIAGA project does not use a users table (see the master schema
     * migration, which creates devices, sensor_data, alerts, and system_logs
     * only). The default Laravel user seeding has been intentionally removed
     * so the seeder matches the project structure.
     */
    public function run(): void
    {
        // No default seeds are required for the SIAGA MVP schema.
    }
}
