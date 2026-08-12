import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useDevices } from '@/hooks/useDevices'
import { useSensorDataHistory } from '@/hooks/useSensorDataHistory'
import { useSensorHistoryChart } from '@/hooks/useSensorHistoryChart'
import { PageHeader } from '@/components/shared/PageHeader'
import { Chart } from '@/components/shared/Chart'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SENSOR_UNITS } from '@/config/constants'
import { HISTORY_CHART_MAX_POINTS } from '@/config/env'
import { downsampleRecords } from '@/utils/series'
import {
  dateToEndIso,
  dateToStartIso,
  formatDateTime,
  formatNumber,
  formatSensorValue,
  formatTime,
} from '@/utils/format'

/** Seri Line Chart: nilai sensor kontinu (FDD Bab 11.2). */
const CHART_SERIES = [
  { key: 'temperature', name: 'Suhu (°C)', color: '#f97316' },
  { key: 'humidity', name: 'Kelembapan (%)', color: '#818cf8' },
  { key: 'light', name: 'Cahaya (lux)', color: '#22c55e' },
]

/** Kolom tabel riwayat sensor (FDD Bab 7.3 & 11.1). */
const TABLE_COLUMNS = [
  {
    key: 'recorded_at',
    header: 'Waktu',
    cell: (row) => formatDateTime(row.recorded_at),
  },
  {
    key: 'temperature',
    header: 'Suhu',
    align: 'right',
    className: 'font-mono',
    cell: (row) => formatSensorValue(row.temperature, SENSOR_UNITS.temperature),
  },
  {
    key: 'humidity',
    header: 'Kelembapan',
    align: 'right',
    className: 'font-mono',
    cell: (row) => formatSensorValue(row.humidity, SENSOR_UNITS.humidity),
  },
  {
    key: 'light',
    header: 'Cahaya',
    align: 'right',
    className: 'font-mono',
    cell: (row) => formatSensorValue(row.light, SENSOR_UNITS.light),
  },
  {
    key: 'motion',
    header: 'Gerakan',
    align: 'center',
    cell: (row) => (row.motion ? 'Ada' : 'Tidak'),
  },
  {
    key: 'obstacle',
    header: 'Obstacle',
    align: 'center',
    cell: (row) => (row.obstacle ? 'Ada' : 'Tidak'),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge kind="system" status={row.status} />,
  },
]

/**
 * Siapkan data chart dari record: urutkan menaik berdasarkan waktu dan
 * format sumbu X sebagai jam:menit (id-ID). Diterapkan pada dataset chart
 * yang mewakili SELURUH rentang terpilih (bukan halaman tabel aktif).
 *
 * @param {Array<{ recorded_at: string, temperature: number, humidity: number, light: number }>} records
 * @returns {Array<{ time: string, temperature: number, humidity: number, light: number }>}
 */
function toChartData(records) {
  return records
    .slice()
    .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
    .map((record) => ({
      time: formatTime(record.recorded_at),
      temperature: record.temperature,
      humidity: record.humidity,
      light: record.light,
    }))
}

/**
 * Historical Data Page (FDD Bab 7.3) — riwayat data sensor dan status
 * sistem berdasarkan rentang waktu yang dipilih, sesuai FR-018.
 *
 * Data berasal dari GET /api/v1/sensor-data/history via useSensorDataHistory
 * (one-shot, tanpa polling). Filter (device + rentang waktu) bersifat
 * auto-apply: request hanya berjalan ketika seluruh filter terisi dan
 * rentang valid; pergantian filter mengembalikan halaman ke 1.
 */
export default function HistoricalDataPage() {
  const [deviceId, setDeviceId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)

  const devicesQuery = useDevices()

  const filtersComplete = Boolean(deviceId && startDate && endDate)
  const invalidRange = filtersComplete && endDate < startDate
  const applied = filtersComplete && !invalidRange

  const historyQuery = useSensorDataHistory(
    {
      deviceId,
      startDate: dateToStartIso(startDate),
      endDate: dateToEndIso(endDate),
      page,
    },
    { enabled: applied }
  )

  // Dataset chart untuk SELURUH rentang terpilih — independen dari halaman
  // tabel aktif, sehingga pagination tidak memengaruhi visualisasi tren.
  const chartQuery = useSensorHistoryChart(
    {
      deviceId,
      startDate: dateToStartIso(startDate),
      endDate: dateToEndIso(endDate),
    },
    { enabled: applied }
  )

  const handleDeviceChange = (value) => {
    setDeviceId(value)
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Data"
        meta="RIWAYAT"
        description="Riwayat data sensor dan status sistem berdasarkan rentang waktu yang dipilih."
      />

      <HistoricalDataContent
        devices={devicesQuery.data}
        devicesLoading={devicesQuery.loading}
        devicesError={devicesQuery.error}
        onDevicesRetry={devicesQuery.refetch}
        deviceId={deviceId}
        startDate={startDate}
        endDate={endDate}
        onDeviceChange={handleDeviceChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        records={historyQuery.data}
        meta={historyQuery.meta}
        loading={historyQuery.loading}
        error={historyQuery.error}
        onPageChange={setPage}
        onRetry={historyQuery.refetch}
        chartRecords={chartQuery.data?.records ?? null}
        chartLoading={chartQuery.loading}
        chartError={chartQuery.error}
        chartTruncated={Boolean(chartQuery.data?.truncated)}
        onChartRetry={chartQuery.refetch}
      />
    </div>
  )
}

/**
 * HistoricalDataContent — bagian konten Historical Data Page (success +
 * empty + error + stale state), presentational. Dipisahkan agar dapat
 * diverifikasi secara statis (SSR smoke) dan memisahkan logika data
 * (hook) dari penyajian.
 */
export function HistoricalDataContent({
  devices = [],
  devicesLoading = false,
  devicesError = null,
  onDevicesRetry,
  deviceId = '',
  startDate = '',
  endDate = '',
  onDeviceChange,
  onStartDateChange,
  onEndDateChange,
  records = null,
  meta = null,
  loading = false,
  error = null,
  onPageChange,
  onRetry,
  chartRecords = null,
  chartLoading = false,
  chartError = null,
  chartTruncated = false,
  onChartRetry,
}) {
  const filtersComplete = Boolean(deviceId && startDate && endDate)
  const invalidRange = filtersComplete && endDate < startDate
  const hasRecords = Array.isArray(records) && records.length > 0

  return (
    <div className="space-y-6">
      <HistoryFilters
        devices={devices}
        devicesLoading={devicesLoading}
        devicesError={devicesError}
        onDevicesRetry={onDevicesRetry}
        deviceId={deviceId}
        startDate={startDate}
        endDate={endDate}
        onDeviceChange={onDeviceChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      {!filtersComplete && (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
          title="Pilih device dan rentang waktu"
          description="Riwayat akan ditampilkan setelah device serta tanggal awal dan akhir dipilih."
        />
      )}

      {filtersComplete && invalidRange && (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
          title="Rentang waktu tidak valid"
          description="Tanggal akhir harus sama dengan atau setelah tanggal awal."
        />
      )}

      {filtersComplete && !invalidRange && error && !hasRecords && (
        <ErrorState error={error} onRetry={onRetry} />
      )}

      {filtersComplete && !invalidRange && !error && records && !hasRecords && (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
          title="Tidak ada data dalam rentang waktu ini"
          description="Belum ada pembacaan sensor pada rentang waktu dan device yang dipilih."
        />
      )}

      {filtersComplete && !invalidRange && (hasRecords || loading) && (
        <HistoryResults
          records={records ?? []}
          meta={meta}
          loading={loading}
          error={error}
          onPageChange={onPageChange}
          chartRecords={chartRecords}
          chartLoading={chartLoading}
          chartError={chartError}
          chartTruncated={chartTruncated}
          onChartRetry={onChartRetry}
        />
      )}
    </div>
  )
}

/**
 * HistoryFilters — filter bar Historical Data: device + rentang waktu.
 * Murni presentational; nilai filter dikontrol pemanggil.
 */
function HistoryFilters({
  devices,
  devicesLoading,
  devicesError,
  onDevicesRetry,
  deviceId,
  startDate,
  endDate,
  onDeviceChange,
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
        <CardTitle>Filter Riwayat</CardTitle>
        <CardDescription>
          Pilih device dan rentang waktu untuk menampilkan riwayat sensor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="history-device" className={labelClass}>
              Device
            </label>
            <select
              id="history-device"
              value={deviceId}
              onChange={(event) => onDeviceChange(event.target.value)}
              className={controlClass}
            >
              <option value="">Pilih device…</option>
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
            <label htmlFor="history-start-date" className={labelClass}>
              Tanggal Awal
            </label>
            <input
              id="history-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => onStartDateChange(event.target.value)}
              className={controlClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="history-end-date" className={labelClass}>
              Tanggal Akhir
            </label>
            <input
              id="history-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => onEndDateChange(event.target.value)}
              className={controlClass}
            />
          </div>
        </div>

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
 * HistoryResults — Chart tren sensor (seluruh rentang) + Data Table riwayat
 * (halaman aktif, paginated). Murni presentational.
 *
 * Chart menggunakan `chartRecords` (seluruh rentang, sudah di-downsample)
 * yang independen dari `records` tabel. Masing-masing memiliki state
 * loading/empty/error sendiri agar kegagalan chart tidak menghilangkan
 * tabel, dan sebaliknya.
 */
function HistoryResults({
  records,
  meta,
  loading,
  error,
  onPageChange,
  chartRecords,
  chartLoading,
  chartError,
  chartTruncated,
  onChartRetry,
}) {
  const chartData = toChartData(
    downsampleRecords(chartRecords ?? [], HISTORY_CHART_MAX_POINTS)
  )
  const chartSampled = Boolean(
    chartTruncated ||
      (Array.isArray(chartRecords) && chartData.length < chartRecords.length)
  )

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

      <section aria-labelledby="history-chart-heading">
        <Card>
          <CardHeader>
            <CardTitle id="history-chart-heading">Tren Sensor</CardTitle>
            <CardDescription>
              Suhu, kelembapan, dan cahaya pada rentang waktu terpilih.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-[280px] w-full" aria-hidden="true" />
            ) : chartError && !chartRecords ? (
              <div className="flex flex-wrap items-center gap-2 py-8">
                <p className="font-mono text-xs text-status-danger">
                  Grafik tren tidak dapat dimuat.
                </p>
                <Button variant="outline" size="sm" onClick={onChartRetry}>
                  Muat ulang
                </Button>
              </div>
            ) : !chartRecords || chartRecords.length === 0 ? (
              <p className="py-8 font-mono text-xs text-muted-foreground">
                Grafik tren tidak tersedia untuk rentang ini.
              </p>
            ) : (
              <div
                role="img"
                aria-label="Grafik tren suhu, kelembapan, dan cahaya terhadap waktu"
              >
                <Chart
                  type="line"
                  data={chartData}
                  xKey="time"
                  series={CHART_SERIES}
                  height={280}
                  valueFormatter={(value) => formatNumber(value)}
                />
              </div>
            )}
            {chartSampled &&
              !chartLoading &&
              !(chartError && !chartRecords) &&
              (chartRecords?.length ?? 0) > 0 && (
                <p
                  role="status"
                  className="mt-2 font-mono text-xs text-muted-foreground"
                >
                  Menampilkan tren berdasarkan sampel data.
                </p>
              )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="history-table-heading">
        <Card>
          <CardHeader>
            <CardTitle id="history-table-heading">Detail Riwayat</CardTitle>
            <CardDescription>
              Record sensor_data per pembacaan dengan pagination.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTable
              columns={TABLE_COLUMNS}
              data={records}
              loading={loading}
              rowKey={(row) => row.id}
              ariaLabel="Riwayat data sensor"
              emptyTitle="Tidak ada data dalam rentang waktu ini"
              emptyDescription="Belum ada pembacaan sensor pada rentang waktu dan device yang dipilih."
            />
            {meta && <Pagination meta={meta} onPageChange={onPageChange} />}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
