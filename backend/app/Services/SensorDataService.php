<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\SensorData;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\DeviceRepositoryInterface;
use App\Repositories\Contracts\SensorDataRepositoryInterface;
use App\Repositories\Contracts\SystemLogRepositoryInterface;
use App\Services\Contracts\SensorDataServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Core orchestration service for sensor ingestion.
 *
 * Handles the primary write pipeline (ADR-002 §5):
 *  1. Ensure the device exists (auto-register when unknown).
 *  2. Mark the device online / update last_seen_at.
 *  3. Persist the sensor reading.
 *  4. Derive an alert when status is WARNING or DANGER.
 *
 * Only storeSensorData() runs inside a transaction (ADR-002 §6).
 * Logging happens after the transaction commits so a logging failure can
 * never roll back successfully ingested sensor data (ADR-002 §7).
 */
class SensorDataService implements SensorDataServiceInterface
{
    private const VALID_SENSOR_STATUSES = ['NORMAL', 'WARNING', 'DANGER'];

    private const ALERT_STATUSES = ['WARNING', 'DANGER'];

    public function __construct(
        private readonly SensorDataRepositoryInterface $sensorDataRepository,
        private readonly DeviceRepositoryInterface $deviceRepository,
        private readonly AlertRepositoryInterface $alertRepository,
        private readonly SystemLogRepositoryInterface $systemLogRepository
    ) {
    }

    /**
     * Primary ingestion flow. Runs inside a database transaction.
     *
     * @param  string  $deviceId  The unique device business key.
     * @param  array<string, mixed>  $payload  The sensor reading payload.
     * @return SensorData
     *
     * @throws ValidationException When the payload status is not a valid value.
     * @throws \Throwable On any persistence failure (transaction auto-rolls back).
     */
    public function storeSensorData(string $deviceId, array $payload): SensorData
    {
        $status = $this->validateStatus($payload['status'] ?? null);
        $recordedAt = $this->resolveRecordedAt($payload['recorded_at'] ?? null);

        $wasAutoRegistered = false;
        $createdAlert = null;

        $sensorData = DB::transaction(function () use (
            $deviceId,
            $payload,
            $status,
            $recordedAt,
            &$wasAutoRegistered,
            &$createdAlert
        ): SensorData {
            // 1. Ensure the device exists; auto-register when unknown.
            $device = $this->deviceRepository->findByDeviceId($deviceId);

            if ($device === null) {
                $device = $this->deviceRepository->createOrUpdate([
                    'device_id' => $deviceId,
                    'name' => "Device {$deviceId}",
                    'status' => 'online',
                    'last_seen_at' => now(),
                ]);
                $wasAutoRegistered = true;
            } else {
                // 2. Device is proven active because it sent data.
                $this->deviceRepository->updateLastSeen($device->id, 'online');
            }

            // 3. Persist the sensor reading.
            $sensorData = $this->sensorDataRepository->create([
                'device_id' => $device->id,
                'recorded_at' => $recordedAt,
                'temperature' => $payload['temperature'],
                'humidity' => $payload['humidity'],
                'motion' => $payload['motion'],
                'light' => $payload['light'],
                'obstacle' => $payload['obstacle'],
                'status' => $status,
            ]);

            // 4. Alert derivation rule: WARNING/DANGER produce an alert.
            if (in_array($status, self::ALERT_STATUSES, true)) {
                $createdAlert = $this->alertRepository->create([
                    'device_id' => $device->id,
                    'sensor_data_id' => $sensorData->id,
                    'status' => $status,
                    'triggered_at' => $recordedAt,
                ]);
            }

            return $sensorData;
        });

        $this->logAfterCommit($deviceId, $sensorData, $status, $wasAutoRegistered, $createdAlert);

        return $sensorData;
    }

    /**
     * Get the most recent sensor data record for a device.
     *
     * @throws ModelNotFoundException When the device has no sensor data.
     */
    public function getLatestSensorData(string $deviceId): SensorData
    {
        return $this->sensorDataRepository->getLatestByDeviceId($deviceId)
            ?? throw (new ModelNotFoundException)->setModel(SensorData::class, [$deviceId]);
    }

    /**
     * Get paginated sensor data history for a device within a time range.
     *
     * @throws ValidationException When the start date is after the end date.
     */
    public function getSensorDataHistory(
        string $deviceId,
        Carbon $startDate,
        Carbon $endDate,
        int $perPage = 50
    ): LengthAwarePaginator {
        if ($startDate->greaterThan($endDate)) {
            throw ValidationException::withMessages([
                'start_date' => 'The start date must not be later than the end date.',
            ]);
        }

        return $this->sensorDataRepository->getHistoryByDeviceId(
            $deviceId,
            $startDate,
            $endDate,
            $perPage
        );
    }

    /**
     * Defensive business validation for the sensor status value.
     *
     * The FormRequest layer performs structural validation; this guards
     * against invalid status values reaching the persistence layer
     * (ADR-002 §8).
     *
     * @throws ValidationException
     */
    private function validateStatus(mixed $status): string
    {
        if (! is_string($status) || ! in_array($status, self::VALID_SENSOR_STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => 'The selected status is invalid. It must be one of NORMAL, WARNING, DANGER.',
            ]);
        }

        return $status;
    }

    /**
     * Resolve the recorded_at timestamp for the reading.
     *
     * Falls back to now() when the payload does not carry a recorded_at value.
     */
    private function resolveRecordedAt(mixed $recordedAt): Carbon
    {
        if ($recordedAt instanceof Carbon) {
            return $recordedAt;
        }

        if (is_string($recordedAt) && $recordedAt !== '') {
            return Carbon::parse($recordedAt);
        }

        return now();
    }

    /**
     * Log the ingestion pipeline after a successful commit (ADR-002 §7).
     *
     * Logging failures are intentionally isolated so they never roll back
     * the committed transaction. Logs the auto-registration, ingestion
     * success, and alert creation events.
     *
     * @param  Alert|null  $createdAlert  The derived alert, if any.
     */
    private function logAfterCommit(
        string $deviceId,
        SensorData $sensorData,
        string $status,
        bool $wasAutoRegistered,
        ?Alert $createdAlert
    ): void {
        try {
            $device = $this->deviceRepository->findByDeviceId($deviceId);

            // Auto-registration event (ADR-002 §7).
            if ($wasAutoRegistered) {
                $this->systemLogRepository->create([
                    'device_id' => $device?->id,
                    'log_level' => 'info',
                    'source' => 'SensorDataService',
                    'message' => "Device auto-registered. [device_id={$deviceId}]",
                ]);

                Log::info('Device auto-registered.', ['device_id' => $deviceId]);
            }

            // Alert creation event (ADR-002 §7).
            if ($createdAlert !== null) {
                $logLevel = $createdAlert->status === 'DANGER' ? 'error' : 'warning';

                $this->systemLogRepository->create([
                    'device_id' => $device?->id,
                    'log_level' => $logLevel,
                    'source' => 'SensorDataService',
                    'message' => sprintf(
                        'Alert created. [device_id=%s, alert_id=%d, status=%s]',
                        $deviceId,
                        $createdAlert->id,
                        $createdAlert->status
                    ),
                ]);

                Log::log($logLevel, 'Alert created.', [
                    'device_id' => $deviceId,
                    'alert_id' => $createdAlert->id,
                    'status' => $createdAlert->status,
                ]);
            }

            // Successful ingestion event (ADR-002 §7).
            $this->systemLogRepository->create([
                'device_id' => $device?->id,
                'log_level' => 'info',
                'source' => 'SensorDataService',
                'message' => sprintf(
                    'Sensor data stored. [device_id=%s, sensor_data_id=%d, status=%s]',
                    $deviceId,
                    $sensorData->id,
                    $status
                ),
            ]);

            Log::info('Sensor data stored.', [
                'device_id' => $deviceId,
                'sensor_data_id' => $sensorData->id,
                'status' => $status,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to write ingestion log.', [
                'device_id' => $deviceId,
                'sensor_data_id' => $sensorData->id,
                'exception' => $e->getMessage(),
            ]);
        }
    }
}
