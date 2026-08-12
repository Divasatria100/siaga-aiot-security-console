import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BellRing, X } from 'lucide-react'
import { useDevices } from '@/hooks/useDevices'
import { useAlerts } from '@/hooks/useAlerts'
import { useAlertOverview } from '@/hooks/useAlertOverview'
import { useAlert } from '@/hooks/useAlert'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { AlertCard } from '@/components/shared/AlertCard'
import { AlertSeverityChart } from '@/components/shared/AlertSeverityChart'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { sortAlertsBySeverity } from '@/utils/alerts'
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
import { ALERT_STATUS, SYSTEM_STATUS_LABEL } from '@/config/constants'
import { dateToEndIso, dateToStartIso, formatDateTime } from '@/utils/format'

/**
 * Kolom daftar alert (FDD Bab 7.4): device, status, waktu kejadian.
 * Backend list (AlertResource dengan eager-load device) tidak menyertakan
 * `sensor_data`; data sensor pemicu hanya tersedia pada endpoint detail,
 * sehingga tidak dipaksa tampil pada list.
 */
const ALERT_COLUMNS = [
  { key: 'id', header: 'ID', className: 'font-mono', cell: (row) => `#${row.id}` },
  { key: 'device_id', header: 'Device', className: 'font-mono', cell: (row) => row.device_id },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge kind="system" status={row.status} />,
  },
  {
    key: 'triggered_at',
    header: 'Waktu Kejadian',
    cell: (row) => formatDateTime(row.triggered_at),
  },
]

/** Parse id alert dari URL; null bila bukan bilangan bulat positif. */
function parseAlertId(alertId) {
  if (!alertId) return null
  const parsed = Number.parseInt(alertId, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

/**
 * Render detail validasi (422) dari ApiError.details bila ada.
 *
 * @param {import('@/lib/axios').ApiError|null} error
 * @returns {import('react').ReactNode|null}
 */
function ValidationDetails({ error }) {
  const details = error?.details
  if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
    return null
  }
  const messages = Object.values(details)
    .flat()
    .map(String)
  return (
    <ul className="mx-auto max-w-md list-inside list-disc space-y-0.5 text-left font-mono text-xs text-status-danger">
      {messages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  )
}

/**
 * Alerts Page (FDD Bab 7.4) — riwayat kejadian WARNING dan DANGER beserta
 * data sensor pemicunya.
 *
 * Route /alerts (tanpa id) dan /alerts/:alertId berbagi komponen page yang
 * sama; pemilihan alert tercermin pada URL (refresh-safe, shareable) dan
 * state filter tetap dipertahankan saat membuka/menutup detail karena
 * komponen tidak di-remount saat parameter berubah.
 *
 * List: GET /api/v1/alerts via useAlerts (one-shot, tanpa polling manual).
 * Detail: GET /api/v1/alerts/{id} via useAlert.
 */
export default function AlertsPage() {
  const { alertId: alertIdParam } = useParams()
  const navigate = useNavigate()

  const [deviceId, setDeviceId] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('recent')

  const devicesQuery = useDevices()

  // Filter tanggal dikirim bila terisi; rentang invalid (end < start)
  // TIDAK dikirim agar tidak memicu 422 dari FormRequest, disertai
  // pesan validasi inline. Backend menerima rentang parsial.
  const invalidRange = Boolean(startDate && endDate) && endDate < startDate
  const startIso = invalidRange ? undefined : startDate ? dateToStartIso(startDate) : undefined
  const endIso = invalidRange ? undefined : endDate ? dateToEndIso(endDate) : undefined

  const alertsQuery = useAlerts({
    deviceId: deviceId || undefined,
    status: status || undefined,
    startDate: startIso,
    endDate: endIso,
    page,
  })

  // Dataset agregat SELURUH hasil filter (independen dari pagination tabel):
  // chart ringkasan severity memakai dataset tersendiri agar tidak bergantung
  // pada halaman aktif, mengikuti pola useSensorHistoryChart.
  const overviewQuery = useAlertOverview({
    deviceId: deviceId || undefined,
    status: status || undefined,
    startDate: startIso,
    endDate: endIso,
  })

  const alertId = parseAlertId(alertIdParam)
  const detailQuery = useAlert(alertId)

  const handleSelectAlert = (id) => {
    navigate(`/alerts/${id}`)
  }
  const handleDetailClose = () => {
    navigate('/alerts')
  }
  const handleDeviceChange = (value) => {
    setDeviceId(value)
    setPage(1)
  }
  const handleStatusChange = (value) => {
    setStatus(value)
    setPage(1)
  }
  const handleStartDateChange = (value) => {
    setStartDate(value)
    setPage(1)
  }
  const handleEndDateChange = (value) => {
    setEndDate(value)
    setPage(1)
  }
  const handleSortOrderChange = (value) => {
    setSortOrder(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        meta="ALERT"
        description="Riwayat kejadian WARNING dan DANGER beserta data sensor pemicunya."
      />

      <AlertsContent
        devices={devicesQuery.data}
        devicesLoading={devicesQuery.loading}
        devicesError={devicesQuery.error}
        onDevicesRetry={devicesQuery.refetch}
        deviceId={deviceId}
        status={status}
        startDate={startDate}
        endDate={endDate}
        invalidRange={invalidRange}
        onDeviceChange={handleDeviceChange}
        onStatusChange={handleStatusChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        overviewCounts={overviewQuery.data?.counts ?? null}
        overviewTotal={overviewQuery.data?.total ?? 0}
        overviewTruncated={overviewQuery.data?.truncated ?? false}
        overviewLoading={overviewQuery.loading}
        overviewError={overviewQuery.error}
        onOverviewRetry={overviewQuery.refetch}
        alerts={alertsQuery.data}
        meta={alertsQuery.meta}
        loading={alertsQuery.loading}
        error={alertsQuery.error}
        onPageChange={setPage}
        onRetry={alertsQuery.refetch}
        alertId={alertId}
        detail={detailQuery.data}
        detailLoading={detailQuery.loading}
        detailError={detailQuery.error}
        onDetailRetry={detailQuery.refetch}
        onSelectAlert={handleSelectAlert}
        onDetailClose={handleDetailClose}
      />
    </div>
  )
}

/**
 * AlertsContent — bagian konten Alerts Page (filter + list + detail),
 * presentational. Dipisahkan agar dapat diverifikasi secara statis
 * (SSR smoke) dan memisahkan logika data (hook) dari penyajian.
 */
export function AlertsContent({
  devices = [],
  devicesLoading = false,
  devicesError = null,
  onDevicesRetry,
  deviceId = '',
  status = '',
  startDate = '',
  endDate = '',
  invalidRange = false,
  onDeviceChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  sortOrder = 'recent',
  onSortOrderChange,
  overviewCounts = null,
  overviewTotal = 0,
  overviewTruncated = false,
  overviewLoading = false,
  overviewError = null,
  onOverviewRetry,
  alerts = null,
  meta = null,
  loading = false,
  error = null,
  onPageChange,
  onRetry,
  alertId = null,
  detail = null,
  detailLoading = false,
  detailError = null,
  onDetailRetry,
  onSelectAlert,
  onDetailClose,
}) {
  const hasAlerts = Array.isArray(alerts) && alerts.length > 0
  const hasFilters = Boolean(deviceId || status || startDate || endDate)
  const hasDetail = alertId != null

  // Sort severity hanya merombak urutan baris yang sudah ada pada dataset
  // yang ditampilkan (halaman aktif) — tidak memengaruhi pagination meta,
  // total record, maupun pemilihan detail (selalu by id).
  const sortedAlerts =
    sortOrder === 'severity' ? sortAlertsBySeverity(alerts ?? []) : alerts

  return (
    <div
      className={cn(
        'grid gap-6',
        hasDetail && 'xl:grid-cols-[minmax(0,1fr)_360px]'
      )}
    >
      <div className="min-w-0 space-y-6">
        <AlertsFilters
          devices={devices}
          devicesLoading={devicesLoading}
          devicesError={devicesError}
          onDevicesRetry={onDevicesRetry}
          deviceId={deviceId}
          status={status}
          startDate={startDate}
          endDate={endDate}
          invalidRange={invalidRange}
          onDeviceChange={onDeviceChange}
          onStatusChange={onStatusChange}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />

        <AlertSeverityChart
          counts={overviewCounts}
          total={overviewTotal}
          truncated={overviewTruncated}
          loading={overviewLoading}
          error={overviewError}
          onRetry={onOverviewRetry}
        />

        {error && hasAlerts && (
          <p
            role="status"
            className="rounded-control border border-status-danger/30 bg-status-danger/10 px-3 py-2 font-mono text-xs text-status-danger"
          >
            Gagal memperbarui data · menampilkan data terakhir
          </p>
        )}

        {loading && !hasAlerts && (
          <DataTable
            columns={ALERT_COLUMNS}
            data={[]}
            loading
            ariaLabel="Daftar alert"
          />
        )}

        {error && !hasAlerts && (
          <div className="space-y-3">
            <ErrorState error={error} onRetry={onRetry} />
            <ValidationDetails error={error} />
          </div>
        )}

        {!error && !hasAlerts && alerts && (
          <EmptyState
            icon={<BellRing className="h-6 w-6" aria-hidden="true" />}
            title={
              hasFilters
                ? 'Tidak ada alert yang sesuai dengan filter'
                : 'Belum ada alert'
            }
            description={
              hasFilters
                ? 'Coba ubah filter device, status, atau rentang waktu.'
                : 'Alert muncul otomatis saat sensor membaca status WARNING atau DANGER.'
            }
          />
        )}

        {hasAlerts && (
          <>
            <div className="flex items-center justify-end gap-2">
              <label
                htmlFor="alerts-sort"
                className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Urutkan
              </label>
              <select
                id="alerts-sort"
                value={sortOrder}
                onChange={(event) => onSortOrderChange(event.target.value)}
                className="h-8 rounded-control border border-border bg-surface/40 px-2 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="recent">Terbaru</option>
                <option value="severity">Prioritas</option>
              </select>
            </div>
            <DataTable
              columns={ALERT_COLUMNS}
              data={sortedAlerts}
              rowKey={(row) => row.id}
              onRowClick={(row) => onSelectAlert(row.id)}
              ariaLabel="Daftar alert"
            />
            {meta && <Pagination meta={meta} onPageChange={onPageChange} />}
          </>
        )}
      </div>

      {hasDetail && (
        <aside
          className="space-y-4 xl:sticky xl:top-6 xl:self-start"
          aria-label="Detail alert"
        >
          <AlertDetailPanel
            alertId={alertId}
            detail={detail}
            loading={detailLoading}
            error={detailError}
            onRetry={onDetailRetry}
            onClose={onDetailClose}
          />
        </aside>
      )}
    </div>
  )
}

/**
 * AlertsFilters — filter bar Alerts: device, status, dan rentang waktu.
 * Semua filter dilakukan server-side oleh API; murni presentational.
 */
function AlertsFilters({
  devices,
  devicesLoading,
  devicesError,
  onDevicesRetry,
  deviceId,
  status,
  startDate,
  endDate,
  invalidRange,
  onDeviceChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
}) {
  const controlClass =
    'h-9 w-full rounded-control border border-border bg-surface/40 px-3 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50'
  const labelClass =
    'block font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Alert</CardTitle>
        <CardDescription>
          Filter kejadian berdasarkan device, status, dan rentang waktu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label htmlFor="alerts-device" className={labelClass}>
              Device
            </label>
            <select
              id="alerts-device"
              value={deviceId}
              onChange={(event) => onDeviceChange(event.target.value)}
              className={controlClass}
            >
              <option value="">Semua</option>
              {devicesLoading && (
                <option value="" disabled>
                  Memuat device…
                </option>
              )}
              {(devices ?? []).map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_id} — {device.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="alerts-status" className={labelClass}>
              Status
            </label>
            <select
              id="alerts-status"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className={controlClass}
            >
              <option value="">Semua</option>
              {Object.entries(ALERT_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {SYSTEM_STATUS_LABEL[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="alerts-start-date" className={labelClass}>
              Tanggal Awal
            </label>
            <input
              id="alerts-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => onStartDateChange(event.target.value)}
              className={controlClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="alerts-end-date" className={labelClass}>
              Tanggal Akhir
            </label>
            <input
              id="alerts-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => onEndDateChange(event.target.value)}
              className={controlClass}
            />
          </div>
        </div>

        {invalidRange && (
          <p role="alert" className="font-mono text-xs text-status-danger">
            Tanggal akhir harus sama dengan atau setelah tanggal awal.
          </p>
        )}

        {devicesError && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs text-status-danger">
              Gagal memuat daftar device.
            </p>
            <Button variant="outline" size="sm" onClick={onDevicesRetry}>
              Muat ulang
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * AlertDetailPanel — detail satu alert beserta nested sensor_data pemicu
 * (GET /api/v1/alerts/{id}). Presentational; request dikelola pemanggil.
 */
function AlertDetailPanel({ alertId, detail, loading, error, onRetry, onClose }) {
  const notFound = isNotFoundError(error)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle>Alert Detail</CardTitle>
            <CardDescription>Kejadian #{alertId} dan data sensor pemicunya.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            aria-label="Tutup detail alert"
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
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        )}

        {notFound && (
          <EmptyState
            title="Alert tidak ditemukan"
            description="Kejadian tidak ditemukan atau sudah tidak tersedia."
            className="py-8"
          />
        )}

        {error && !notFound && (
          <ErrorState error={error} onRetry={onRetry} className="py-8" />
        )}

        {detail && <AlertCard alert={detail} />}
      </CardContent>
    </Card>
  )
}
