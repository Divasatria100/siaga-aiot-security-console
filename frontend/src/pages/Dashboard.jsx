import { useNavigate } from 'react-router-dom'
import { AlertTriangle, HardDrive, Wifi, WifiOff } from 'lucide-react'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardCard } from '@/components/shared/DashboardCard'
import { DeviceStatusCard } from '@/components/shared/DeviceStatusCard'
import { LoadingIndicator } from '@/components/shared/LoadingIndicator'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatRelativeTime } from '@/utils/format'
import {
  countAttentionDevices,
  sortDevicesBySeverity,
} from '@/utils/devices'

/**
 * Dashboard Page (FDD Bab 7.1) — ringkasan kondisi sistem secara
 * keseluruhan. Data berasal dari GET /api/v1/system/status via
 * useSystemStatus() (polling otomatis, tanpa duplicate interval).
 *
 * State:
 * - loading  → LoadingIndicator
 * - success  → summary cards + device overview
 * - empty    → EmptyState saat sistem belum memiliki device
 * - error    → ErrorState dengan retry (refetch); bila data lama masih
 *              tersedia, data ditampilkan dengan notice "data terakhir".
 *
 * Interaksi: Device Status Card dapat diklik menuju Monitoring device
 * terkait (FDD Bab 7.1).
 */
export default function DashboardPage() {
  const { data, loading, error, lastUpdated, refetch } = useSystemStatus()
  const navigate = useNavigate()

  const handleSelectDevice = (deviceId) => {
    navigate(`/monitoring/${encodeURIComponent(deviceId)}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan kondisi sistem: total device, konektivitas, dan status sistem terkini tiap perangkat."
        actions={
          lastUpdated ? (
            <div className="flex items-center gap-2 rounded-control border border-border bg-surface/40 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-status-online" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-foreground">
                Diperbarui {formatRelativeTime(lastUpdated)}
              </span>
            </div>
          ) : undefined
        }
      />

      {loading && !data && <LoadingIndicator label="Memuat status sistem…" />}

      {error && !data && <ErrorState error={error} onRetry={refetch} />}

      {!data && !loading && !error && (
        <EmptyState
          title="Data tidak tersedia"
          description="Status sistem belum dapat dimuat."
        />
      )}

      {data && (
        <DashboardContent
          system={data}
          error={error}
          onSelectDevice={handleSelectDevice}
        />
      )}
    </div>
  )
}

/**
 * DashboardContent — bagian konten Dashboard (success state), presentational.
 * Dipisahkan agar dapat diverifikasi secara statis (SSR smoke) dan
 * memisahkan logika data (hook) dari penyajian.
 *
 * @param {object} props
 * @param {import('@/types').SystemStatus} props.system Data /system/status
 * @param {import('@/lib/axios').ApiError|null} [props.error] Error polling terakhir (data lama masih tampil)
 * @param {(deviceId: string) => void} props.onSelectDevice Navigasi ke Monitoring device
 */
export function DashboardContent({ system, error, onSelectDevice }) {
  const totalDevices = system?.total_devices ?? 0
  const onlineDevices = system?.online_devices ?? 0
  const offlineDevices = system?.offline_devices ?? 0
  const devices = system?.devices ?? []
  const attentionDevices = countAttentionDevices(devices)
  const sortedDevices = sortDevicesBySeverity(devices)

  return (
    <>
      {error && (
        <p
          role="status"
          className="rounded-control border border-status-danger/30 bg-status-danger/10 px-3 py-2 font-mono text-xs text-status-danger"
        >
          Gagal memperbarui data · menampilkan data terakhir
        </p>
      )}

      <section
        aria-label="Ringkasan sistem"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <DashboardCard
          label="Total Device"
          value={totalDevices}
          description="Perangkat terdaftar"
          icon={<HardDrive className="h-5 w-5" aria-hidden="true" />}
        />
        <DashboardCard
          label="Device Online"
          value={onlineDevices}
          tone="online"
          description="Terhubung dan aktif"
          icon={<Wifi className="h-5 w-5" aria-hidden="true" />}
        />
        <DashboardCard
          label="Device Offline"
          value={offlineDevices}
          tone="offline"
          description="Tidak terhubung"
          icon={<WifiOff className="h-5 w-5" aria-hidden="true" />}
        />
        <DashboardCard
          label="Perlu Perhatian"
          value={attentionDevices}
          tone="warning"
          description="Device berstatus Warning atau Danger"
          icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        />
      </section>

      <section aria-labelledby="device-overview-heading">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <h2
              id="device-overview-heading"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              Device Overview
            </h2>
            <p className="text-xs text-muted-foreground">
              Status konektivitas dan sistem terkini tiap perangkat.
            </p>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {totalDevices} device · {onlineDevices} online · {offlineDevices} offline
          </p>
        </div>

        {devices.length === 0 ? (
          <EmptyState
            title="Belum ada device"
            description="Device akan muncul otomatis saat pertama kali mengirim data sensor."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedDevices.map((device) => (
              <DeviceStatusCard
                key={device.device_id}
                device={device}
                latestStatus={device.latest_status}
                onClick={() => onSelectDevice(device.device_id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
