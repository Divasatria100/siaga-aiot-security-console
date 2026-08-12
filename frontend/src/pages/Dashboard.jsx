import { useNavigate } from 'react-router-dom'
import { AlertTriangle, BellRing, HardDrive, Wifi, WifiOff } from 'lucide-react'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { useAlerts } from '@/hooks/useAlerts'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardCard } from '@/components/shared/DashboardCard'
import { DeviceStatusCard } from '@/components/shared/DeviceStatusCard'
import { AlertCard } from '@/components/shared/AlertCard'
import { LoadingIndicator } from '@/components/shared/LoadingIndicator'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
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
  // Recent Alerts — preview maks. 5 alert terbaru (planning-design.md
  // "Dashboard — Additional Enhancement"). One-shot (tanpa polling),
  // state independen dari Device Overview; kegagalan di sini tidak
  // memblokir konten utama Dashboard.
  const alertsQuery = useAlerts({ perPage: 5 })
  const navigate = useNavigate()

  const handleSelectDevice = (deviceId) => {
    navigate(`/monitoring/${encodeURIComponent(deviceId)}`)
  }

  const handleViewAllAlerts = () => {
    navigate('/alerts')
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
          alerts={alertsQuery.data}
          alertsLoading={alertsQuery.loading}
          alertsError={alertsQuery.error}
          onAlertsRetry={alertsQuery.refetch}
          onViewAllAlerts={handleViewAllAlerts}
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
 * @param {import('@/types').Alert[]|null} [props.alerts] Daftar alert terbaru (maks. 5)
 * @param {boolean} [props.alertsLoading] Loading state Recent Alerts
 * @param {import('@/lib/axios').ApiError|null} [props.alertsError] Error Recent Alerts
 * @param {() => void} [props.onAlertsRetry] Retry Recent Alerts
 * @param {() => void} [props.onViewAllAlerts] Navigasi ke halaman Alerts
 */
export function DashboardContent({
  system,
  error,
  onSelectDevice,
  alerts = null,
  alertsLoading = false,
  alertsError = null,
  onAlertsRetry,
  onViewAllAlerts,
}) {
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <section aria-labelledby="device-overview-heading" className="min-w-0">
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
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
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

        <RecentAlerts
          alerts={alerts}
          loading={alertsLoading}
          error={alertsError}
          onRetry={onAlertsRetry}
          onViewAll={onViewAllAlerts}
        />
      </div>
    </>
  )
}

/**
 * RecentAlerts — preview alert terbaru pada Dashboard (planning-design.md
 * "Dashboard — Additional Enhancement"). Murni presentational, mereuse
 * `AlertCard` dan `StatusBadge` (via AlertCard) tanpa komponen duplikat.
 *
 * State independen dari Device Overview: loading / empty / error ditangani
 * di panel ini sendiri, sehingga kegagalan fetch alert tidak memblokir
 * konten utama Dashboard. Maksimal 5 alert (perPage=5 dari pemanggil).
 *
 * @param {object} props
 * @param {import('@/types').Alert[]|null} [props.alerts] Daftar alert terbaru
 * @param {boolean} [props.loading] Loading state
 * @param {import('@/lib/axios').ApiError|null} [props.error] Error state
 * @param {() => void} [props.onRetry] Retry saat error
 * @param {() => void} [props.onViewAll] Navigasi ke halaman Alerts
 */
export function RecentAlerts({ alerts, loading, error, onRetry, onViewAll }) {
  const list = Array.isArray(alerts) ? alerts : []
  const hasAlerts = list.length > 0

  return (
    <section aria-labelledby="recent-alerts-heading" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2
            id="recent-alerts-heading"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Recent Alerts
          </h2>
          <p className="text-xs text-muted-foreground">
            Kejadian WARNING dan DANGER terbaru.
          </p>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            Lihat semua alert
          </Button>
        )}
      </div>

      {loading && !hasAlerts && (
        <LoadingIndicator label="Memuat alert terbaru…" />
      )}

      {error && !hasAlerts && !loading && (
        <ErrorState error={error} onRetry={onRetry} />
      )}

      {!loading && !error && !hasAlerts && (
        <EmptyState
          icon={<BellRing className="h-6 w-6" aria-hidden="true" />}
          title="Belum ada alert"
          description="Alert muncul otomatis saat sensor membaca status WARNING atau DANGER."
          className="py-8"
        />
      )}

      {error && hasAlerts && (
        <p
          role="status"
          className="rounded-control border border-status-danger/30 bg-status-danger/10 px-3 py-2 font-mono text-xs text-status-danger"
        >
          Gagal memperbarui data · menampilkan data terakhir
        </p>
      )}

      {hasAlerts && (
        <div className="space-y-3">
          {list.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </section>
  )
}
