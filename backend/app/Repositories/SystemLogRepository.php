<?php

namespace App\Repositories;

use App\Models\SystemLog;
use App\Repositories\Contracts\SystemLogRepositoryInterface;

class SystemLogRepository implements SystemLogRepositoryInterface
{
    /**
     * Store a new system log entry.
     */
    public function create(array $data): SystemLog
    {
        return SystemLog::query()->create($data);
    }
}
