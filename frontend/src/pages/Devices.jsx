import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Boxes, ExternalLink, X } from 'lucide-react'
import { useDevices } from '@/hooks/useDevices'
import { useDevice } from '@/hooks/useDevice'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isNotFoundError } from '@/lib/axios'
import { cn } from '@/lib/utils'
import { DEVICE_STATUS, DEVICE_STATUS_LABEL } from '@/config/constants'
import { formatDateTime, formatRelativeTime } from '@/utils/format'

/**
 * Kolom daftar device (FDD Bab 7.5): identitas, status konektivitas, dan
 * waktu terakhir terlihat. Field mengikuti DeviceResource backend aktual
 * (device_id, name, status, last_seen_at).
 */
const DEVICE_COLUMNS = [
  {
    key: 'device_id',
    header: 'Device',
    cell: (row) => (
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold text-foreground">{row.device_id}</p>
        {row.name && row.name !== row.device_id && (
          <p className="truncate text-xs text-muted-foreground">{row.name}</p>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge kind="device" status={row.status} />,
  },
  {
    key: 'last_seen_at',
    header: 'Terakhir Terlihat',
    cell: (row) => formatDateTime(row.last_seen_at),
  },
]

/**
 * Parse device_id dari URL; null bila kosong. Device_id adalah business
 * key berupa string (mis. "SIAGA-001"), bukan primary key integer.
 */
function parseDeviceId(deviceId) {
  if (!deviceId) return null
  const trimmed = String(deviceId).trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Devices Page (FDD Bab 7.5) — daftar dan detail perangkat terdaftar.
 *
 * Route /devices (tanpa id) dan /devices/:deviceId berbagi komponen page
 * yang sama; pemilihan device tercermin pada URL (refresh-safe, shareable)
 * dan state filter tetap dipertahankan saat membuka/menutup detail karena
 * komponen tidak di-remount saat parameter berubah.
 *
 * List: GET /api/v1/devices via useDevices (one-shot, tanpa polling).
 * Detail: GET /api/v1/devices/{device_id} via useDevice.
 */
export default function DevicesPage() {
  const { deviceId: deviceIdParam } = useParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const devicesQuery = useDevices({ status: status || undefined, page })

  const deviceId = parseDeviceId(deviceIdParam)
  const detailQuery = useDevice(deviceId)

  const handleSelectDevice = (id) => {
    navigate(`/devices/${encodeURIComponent(id)}`)
  }
  const handleDetailClose = () => {
    navigate('/devices')
  }
  const handleStatusChange = (value) => {
    setStatus(value)
    setPage(1)
  }
  const handleOpenMonitoring = (id) => {
    navigate(`/monitoring/${encodeURIComponent(id)}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        meta="DEVICE"
        description="Daftar perangkat terdaftar beserta status konektivitas dan detail."
      />

      <DevicesContent
        status={status}
        onStatusChange={handleStatusChange}
        devices={devicesQuery.data}
        meta={devicesQuery.meta}
        loading={devicesQuery.loading}
        error={devicesQuery.error}
        onPageChange={setPage}
        onRetry={devicesQuery.refetch}
        deviceId={deviceId}
        detail={detailQuery.data}
        detailLoading={detailQuery.loading}
        detailError={detailQuery.error}
        onDetailRetry={detailQuery.refetch}
        onSelectDevice={handleSelectDevice}
        onDetailClose={handleDetailClose}
        onOpenMonitoring={handleOpenMonitoring}
      />
    </div>
  )
}

/**
 * DevicesContent — bagian konten Devices Page (filter + list + detail),
 * presentational. Dipisahkan agar dapat diverifikasi secara statis
 * (SSR smoke) dan memisahkan logika data (hook) dari penyajian.
 */
export function DevicesContent({
  status = '',
  onStatusChange,
  devices = null,
  meta = null,
  loading = false,
  error = null,
  onPageChange,
  onRetry,
  deviceId = null,
  detail = null,
  detailLoading = false,
  detailError = null,
  onDetailRetry,
  onSelectDevice,
  onDetailClose,
  onOpenMonitoring,
}) {
  const hasDevices = Array.isArray(devices) && devices.length > 0
  const hasFilter = Boolean(status)
  const hasDetail = deviceId != null

  return (
    <div
      className={cn(
        'grid gap-6',
        hasDetail && 'xl:grid-cols-[minmax(0,1fr)_360px]'
      )}
    >
      <div className="min-w-0 space-y-6">
        <DeviceFilters status={status} onStatusChange={onStatusChange} />

        {error && hasDevices && (
          <p
            role="status"
            className="rounded-control border border-status-danger/30 bg-status-danger/10 px-3 py-2 font-mono text-xs text-status-danger"
          >
            Gagal memperbarui data · menampilkan data terakhir
          </p>
        )}

        {loading && !hasDevices && (
          <DataTable
            columns={DEVICE_COLUMNS}
            data={[]}
            loading
            ariaLabel="Daftar device"
          />
        )}

        {error && !hasDevices && <ErrorState error={error} onRetry={onRetry} />}

        {!error && !hasDevices && devices && (
          <EmptyState
            icon={<Boxes className="h-6 w-6" aria-hidden="true" />}
            title={
              hasFilter
                ? 'Tidak ada device yang sesuai dengan filter'
                : 'Belum ada device terdaftar'
            }
            description={
              hasFilter
                ? 'Coba ubah filter status konektivitas.'
                : 'Device muncul otomatis saat pertama kali mengirim data sensor.'
            }
          />
        )}

        {hasDevices && (
          <>
            <DataTable
              columns={DEVICE_COLUMNS}
              data={devices}
              rowKey={(row) => row.device_id}
              onRowClick={(row) => onSelectDevice(row.device_id)}
              ariaLabel="Daftar device"
            />
            {meta && <Pagination meta={meta} onPageChange={onPageChange} />}
          </>
        )}
      </div>

      {hasDetail && (
        <aside
          className="space-y-4 xl:sticky xl:top-6 xl:self-start"
          aria-label="Detail device"
        >
          <DeviceDetailPanel
            deviceId={deviceId}
            detail={detail}
            loading={detailLoading}
            error={detailError}
            onRetry={onDetailRetry}
            onClose={onDetailClose}
            onOpenMonitoring={onOpenMonitoring}
          />
        </aside>
      )}
    </div>
  )
}

/**
 * DeviceFilters — filter bar Devices: hanya status konektivitas
 * (online/offline). Filter dilakukan server-side oleh API; murni
 * presentational. Perubahan filter me-reset halaman ke 1.
 */
function DeviceFilters({ status, onStatusChange }) {
  const controlClass =
    'h-9 w-full rounded-control border border-border bg-surface/40 px-3 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50'
  const labelClass =
    'block font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Device</CardTitle>
        <CardDescription>
          Filter daftar perangkat berdasarkan status konektivitas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label htmlFor="devices-status" className={labelClass}>
              Status
            </label>
            <select
              id="devices-status"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className={controlClass}
            >
              <option value="">Semua</option>
              {Object.entries(DEVICE_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {DEVICE_STATUS_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * DeviceDetailPanel — detail satu device (GET /api/v1/devices/{device_id}).
 * Menampilkan identitas, status konektivitas, waktu terakhir terlihat,
 * serta timestamp registrasi/pembaruan. Presentational; request dikelola
 * pemanggil.
 */
function DeviceDetailPanel({
  deviceId,
  detail,
  loading,
  error,
  onRetry,
  onClose,
  onOpenMonitoring,
}) {
  const notFound = isNotFoundError(error)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle>Device Detail</CardTitle>
            <CardDescription>Perangkat {deviceId} dan status konektivitasnya.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            aria-label="Tutup detail device"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !detail && (
          <div className="space-y-3" aria-hidden="true">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-pill" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        )}

        {notFound && (
          <EmptyState
            title="Device tidak ditemukan"
            description="Perangkat belum terdaftar atau sudah tidak tersedia."
            className="py-8"
          />
        )}

        {error && !notFound && (
          <ErrorState error={error} onRetry={onRetry} className="py-8" />
        )}

        {detail && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{detail.name || detail.device_id}</p>
              {detail.name && (
                <p className="font-mono text-xs text-muted-foreground">{detail.device_id}</p>
              )}
              <StatusBadge kind="device" status={detail.status} />
            </div>

            <dl className="space-y-2 border-t border-border pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Terakhir Terlihat
                </dt>
                <dd className="text-right font-mono text-xs text-foreground">
                  {formatDateTime(detail.last_seen_at)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Jarak Waktu
                </dt>
                <dd className="text-right font-mono text-xs text-foreground">
                  {formatRelativeTime(detail.last_seen_at)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Terdaftar
                </dt>
                <dd className="text-right font-mono text-xs text-foreground">
                  {formatDateTime(detail.created_at)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Diperbarui
                </dt>
                <dd className="text-right font-mono text-xs text-foreground">
                  {formatDateTime(detail.updated_at)}
                </dd>
              </div>
            </dl>

            <div className="border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenMonitoring(detail.device_id)}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Buka Monitoring
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
