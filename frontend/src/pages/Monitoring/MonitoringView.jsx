import { useMemo } from 'react'
import { Activity, Box, Droplets, Radio, Sun, Thermometer } from 'lucide-react'
import { useDevices } from '@/hooks/useDevices'
import { useDevice } from '@/hooks/useDevice'
import { useLatestSensorData } from '@/hooks/useLatestSensorData'
import { PageHeader } from '@/components/shared/PageHeader'
import { SensorCard } from '@/components/shared/SensorCard'
import { DeviceStatusCard } from '@/components/shared/DeviceStatusCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingIndicator } from '@/components/shared/LoadingIndicator'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isNotFoundError } from '@/lib/axios'
import {
  formatDateTime,
  formatRelativeTime,
  formatSensorValue,
} from '@/utils/format'
import { SENSOR_LABELS, SENSOR_UNITS } from '@/config/constants'

/** Definisi sensor MVP dengan ikon (FDD Bab 3.3 & 7.2). */
const SENSOR_ITEMS = [
  { key: 'temperature', icon: Thermometer },
  { key: 'humidity', icon: Droplets },
  { key: 'light', icon: Sun },
  { key: 'motion', icon: Activity },
  { key: 'obstacle', icon: Box },
]

/**
 * DeviceSelector — selector device untuk Monitoring (page-specific).
 * Berisi daftar device dari GET /api/v1/devices. Murni presentational;
 * aksi pemilihan diteruskan ke `onSelectDevice`.
 *
 * @param {object} props
 * @param {string|null} props.deviceId Device aktif (null = belum dipilih)
 * @param {import('@/types').Device[]} props.devices Daftar device
 * @param {boolean} props.loading Status loading daftar device
 * @param {import('@/lib/axios').ApiError|null} props.error Error daftar device
 * @param {() => void} props.onRetry Retry memuat daftar device
 * @param {(deviceId: string) => void} props.onSelectDevice Aksi pilih device
 */
function DeviceSelector({
  deviceId,
  devices,
  loading,
  error,
  onRetry,
  onSelectDevice,
}) {
  const options = useMemo(() => {
    const list = devices.map((device) => ({
      value: device.device_id,
      label: device.name || device.device_id,
    }))
    // Device aktif dari URL belum tentu ada di halaman 1 daftar device;
    // pastikan tetap tampil sebagai opsi aktif agar select tidak kosong.
    if (deviceId && !list.some((option) => option.value === deviceId)) {
      list.unshift({ value: deviceId, label: deviceId })
    }
    return list
  }, [devices, deviceId])

  if (error && devices.length === 0) {
    return (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Muat ulang device
      </Button>
    )
  }

  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Device
      </span>
      <select
        value={deviceId ?? ''}
        onChange={(event) => onSelectDevice(event.target.value)}
        disabled={loading && devices.length === 0}
        className="h-8 rounded-control border border-border bg-surface/40 px-3 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
      >
        {deviceId === null && <option value="">Pilih device…</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * SensorGrid — grid SensorCard untuk data sensor terkini (page-specific).
 * Nilai boolean (motion/obstacle) ditampilkan sebagai Ada/Tidak tanpa
 * diinterpretasikan sebagai status sistem.
 *
 * @param {object} props
 * @param {import('@/types').SensorData} props.sensor Data sensor terkini
 */
export function SensorGrid({ sensor }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SENSOR_ITEMS.map(({ key, icon: Icon }) => {
        const isBoolean = key === 'motion' || key === 'obstacle'
        const raw = sensor[key]
        return (
          <SensorCard
            key={key}
            label={SENSOR_LABELS[key]}
            value={isBoolean ? (raw ? 'Ada' : 'Tidak') : formatSensorValue(raw)}
            unit={isBoolean ? undefined : SENSOR_UNITS[key]}
            tone={isBoolean ? (raw ? 'default' : 'muted') : 'default'}
            icon={<Icon className="h-5 w-5" aria-hidden="true" />}
          />
        )
      })}
    </div>
  )
}

function SensorGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: SENSOR_ITEMS.length }).map((_, index) => (
        <Card key={index} className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-9 w-9 rounded-control" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function DeviceStatusSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-pill" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <Skeleton className="h-6 w-16 rounded-pill" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  )
}

/**
 * MonitoringContent — konten Monitoring untuk device aktif, presentational.
 * Semua state (loading/success/empty/error/stale) dipisahkan dari logika
 * data agar dapat diverifikasi secara statis (SSR smoke).
 *
 * @param {object} props
 * @param {import('@/types').Device|null} props.device Data device
 * @param {import('@/lib/axios').ApiError|null} props.deviceError Error detail device
 * @param {import('@/types').SensorData|null} props.latest Data sensor terkini
 * @param {import('@/lib/axios').ApiError|null} props.latestError Error data sensor terkini
 * @param {boolean} [props.latestLoading] Status loading data sensor
 * @param {() => void} props.onRetryDevice Retry detail device
 * @param {() => void} props.onRetryLatest Retry data sensor
 */
export function MonitoringContent({
  device,
  deviceError,
  latest,
  latestError,
  latestLoading = false,
  onRetryDevice,
  onRetryLatest,
}) {
  const deviceNotFound = isNotFoundError(deviceError)
  const latestNotFound = isNotFoundError(latestError)

  return (
    <div className="space-y-6">
      {/* Device status */}
      {device && !deviceNotFound && (
        <DeviceStatusCard device={device} latestStatus={latest?.status ?? null} />
      )}
      {!device && !deviceError && <DeviceStatusSkeleton />}
      {deviceError && !deviceNotFound && (
        <ErrorState error={deviceError} onRetry={onRetryDevice} className="py-8" />
      )}

      {/* Latest sensor data */}
      <section aria-labelledby="latest-sensor-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div>
            <h2
              id="latest-sensor-heading"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              Latest Sensor Data
            </h2>
            <p className="text-xs text-muted-foreground">
              Pembacaan sensor terbaru dari device.
            </p>
          </div>
          {latest && (
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge kind="system" status={latest.status} />
              <span className="font-mono text-xs text-muted-foreground">
                {formatDateTime(latest.recorded_at)}
              </span>
            </div>
          )}
        </div>

        {latestError && latest && (
          <p
            role="status"
            className="mb-4 rounded-control border border-status-danger/30 bg-status-danger/10 px-3 py-2 font-mono text-xs text-status-danger"
          >
            Gagal memperbarui data · menampilkan pembacaan terakhir{' '}
            {formatRelativeTime(latest.recorded_at)}
          </p>
        )}

        {deviceNotFound ? (
          <EmptyState
            title="Device tidak ditemukan"
            description="Perangkat belum terdaftar atau belum pernah mengirim data sensor."
          />
        ) : latestNotFound ? (
          <EmptyState
            title="Belum ada data sensor"
            description="Device belum memiliki record sensor data. Tunggu pengiriman data berikutnya."
          />
        ) : latestLoading && !latest ? (
          <SensorGridSkeleton />
        ) : latestError && !latest ? (
          <ErrorState error={latestError} onRetry={onRetryLatest} />
        ) : latest ? (
          <SensorGrid sensor={latest} />
        ) : null}
      </section>
    </div>
  )
}

/**
 * MonitoringView — konten Monitoring yang dipakai oleh route /monitoring
 * (device belum dipilih) maupun /monitoring/:deviceId (device dari URL).
 * Polling data sensor terkini hanya aktif ketika deviceId tersedia
 * (ditangani di dalam useLatestSensorData).
 *
 * @param {object} props
 * @param {string|null} [props.deviceId] Device aktif
 * @param {(deviceId: string) => void} props.onSelectDevice Navigasi saat ganti device
 */
export function MonitoringView({ deviceId = null, onSelectDevice }) {
  const devicesQuery = useDevices()
  const deviceQuery = useDevice(deviceId)
  const latestQuery = useLatestSensorData(deviceId)

  const device = deviceQuery.data
  const devices = devicesQuery.data ?? []

  const handleSelectDevice = (nextDeviceId) => {
    if (nextDeviceId && nextDeviceId !== deviceId) onSelectDevice(nextDeviceId)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={device ? device.name : deviceId ?? 'Monitoring'}
        meta={device ? device.device_id : undefined}
        description={
          deviceId
            ? 'Data sensor terkini, status sistem, dan konektivitas device.'
            : 'Pilih device untuk memantau data sensor secara real-time.'
        }
        actions={
          <DeviceSelector
            deviceId={deviceId}
            devices={devices}
            loading={devicesQuery.loading}
            error={devicesQuery.error}
            onRetry={devicesQuery.refetch}
            onSelectDevice={handleSelectDevice}
          />
        }
      />

      {!deviceId ? (
        devicesQuery.loading && !devicesQuery.data ? (
          <LoadingIndicator label="Memuat daftar device…" />
        ) : devicesQuery.error && !devicesQuery.data ? (
          <ErrorState error={devicesQuery.error} onRetry={devicesQuery.refetch} />
        ) : devices.length === 0 ? (
          <EmptyState
            title="Belum ada device"
            description="Device akan muncul otomatis saat pertama kali mengirim data sensor."
          />
        ) : (
          <EmptyState
            icon={<Radio className="h-6 w-6" aria-hidden="true" />}
            title="Pilih device"
            description="Pilih salah satu device dari selector untuk memantau data sensor."
          />
        )
      ) : (
        <MonitoringContent
          device={device}
          deviceError={deviceQuery.error}
          latest={latestQuery.data}
          latestError={latestQuery.error}
          latestLoading={latestQuery.loading}
          onRetryDevice={deviceQuery.refetch}
          onRetryLatest={latestQuery.refetch}
        />
      )}
    </div>
  )
}
