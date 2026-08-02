<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'devices';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'device_id',
        'name',
        'status',
        'last_seen_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * Get the sensor data records for the device.
     */
    public function sensorData(): HasMany
    {
        return $this->hasMany(SensorData::class);
    }

    /**
     * Get the alerts for the device.
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Get the system logs for the device.
     */
    public function systemLogs(): HasMany
    {
        return $this->hasMany(SystemLog::class);
    }
}
