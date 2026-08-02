<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SensorData extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sensor_data';

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    public const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'device_id',
        'recorded_at',
        'temperature',
        'humidity',
        'motion',
        'light',
        'obstacle',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'temperature' => 'decimal:2',
            'humidity' => 'decimal:2',
            'motion' => 'boolean',
            'light' => 'decimal:2',
            'obstacle' => 'boolean',
        ];
    }

    /**
     * Get the device that owns the sensor data record.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /**
     * Get the alert associated with the sensor data record.
     */
    public function alert(): HasOne
    {
        return $this->hasOne(Alert::class, 'sensor_data_id');
    }
}
