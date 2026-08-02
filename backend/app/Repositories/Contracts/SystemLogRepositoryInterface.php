<?php

namespace App\Repositories\Contracts;

use App\Models\SystemLog;

interface SystemLogRepositoryInterface
{
    /**
     * Store a new system log entry.
     *
     * Used internally by the Backend for Backend Log and API Log per the
     * Logging Strategy (SDD section 9). This repository is not exposed as
     * a REST API resource on MVP (API Spec section 5).
     *
     * @param  array  $data  The system log payload.
     * @return \App\Models\SystemLog
     */
    public function create(array $data): SystemLog;
}
