/**
 * Verifikasi shared components (presentational) via SSR renderToStaticMarkup.
 *
 * Tidak memerlukan browser. Cukup memastikan setiap komponen me-render
 * tanpa error dan menghasilkan markup yang diharapkan (label, status,
 * format angka/tanggal id-ID, dan sebagainya).
 *
 * Jalankan: `npm run smoke:components`
 */
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

// Polyfill minimal agar ResponsiveContainer (recharts) dapat di-SSR.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
if (!globalThis.matchMedia) {
  globalThis.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  })
}

import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingIndicator } from '@/components/shared/LoadingIndicator'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardCard } from '@/components/shared/DashboardCard'
import { SensorCard } from '@/components/shared/SensorCard'
import { SensorTrendSparkline } from '@/components/shared/SensorTrendSparkline'
import { downsampleRecords } from '@/utils/series'
import { DeviceStatusCard } from '@/components/shared/DeviceStatusCard'
import { AlertCard } from '@/components/shared/AlertCard'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { Chart } from '@/components/shared/Chart'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import { AlertSeverityChart } from '@/components/shared/AlertSeverityChart'
import { FilterField } from '@/components/shared/FilterField'
import { ApiError } from '@/lib/axios'
import { sortAlertsBySeverity, countAlertsByStatus } from '@/utils/alerts'
import DashboardPage, { DashboardContent } from '@/pages/Dashboard'
import MonitoringPage from '@/pages/Monitoring'
import { MonitoringContent, SensorGrid } from '@/pages/Monitoring/MonitoringView'
import HistoricalDataPage, { HistoricalDataContent } from '@/pages/HistoricalData'
import AlertsPage, { AlertsContent } from '@/pages/Alerts'
import DevicesPage, { DevicesContent } from '@/pages/Devices'

const render = (element) => renderToStaticMarkup(element)

const device = {
  device_id: 'SIAGA-001',
  name: 'Ruang Server Utama',
  status: 'online',
  last_seen_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  created_at: '2026-06-01T08:00:00Z',
  updated_at: new Date().toISOString(),
}

const alert = {
  id: 512,
  device_id: 'SIAGA-001',
  sensor_data_id: 10452,
  status: 'WARNING',
  triggered_at: '2026-07-31T09:15:00Z',
  sensor_data: {
    temperature: 29.5,
    humidity: 68.2,
    motion: true,
    light: 120.0,
    obstacle: false,
  },
}

const historyRows = [
  {
    id: 1,
    device_id: 'SIAGA-001',
    recorded_at: '2026-07-31T09:00:00Z',
    temperature: 28.1,
    humidity: 65.4,
    motion: false,
    light: 110.0,
    obstacle: false,
    status: 'NORMAL',
  },
  {
    id: 2,
    device_id: 'SIAGA-001',
    recorded_at: '2026-07-31T09:10:00Z',
    temperature: 29.5,
    humidity: 68.2,
    motion: true,
    light: 120.0,
    obstacle: false,
    status: 'WARNING',
  },
]

const columns = [
  { key: 'device_id', header: 'Device', align: 'left' },
  {
    key: 'temperature',
    header: 'Suhu',
    align: 'right',
    cell: (row) => `${row.temperature} °C`,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    cell: (row) => h(StatusBadge, { kind: 'system', status: row.status }),
  },
]

function run() {
  // 1. StatusBadge
  assert.ok(render(h(StatusBadge, { kind: 'system', status: 'NORMAL' })).includes('Normal'))
  assert.ok(render(h(StatusBadge, { kind: 'device', status: 'online' })).includes('Online'))
  assert.ok(render(h(StatusBadge, { kind: 'device', status: 'offline' })).includes('Offline'))
  console.log('✓ StatusBadge (system/device labels)')

  // 2. LoadingIndicator
  const loading = render(h(LoadingIndicator, { label: 'Mengambil data' }))
  assert.ok(loading.includes('Mengambil data'))
  assert.ok(loading.includes('role="status"'))
  console.log('✓ LoadingIndicator')

  // 3. EmptyState + ErrorState
  assert.ok(render(h(EmptyState)).includes('Data tidak tersedia'))
  const errorHtml = render(h(ErrorState, { error: { isNetworkError: true, message: 'offline' }, onRetry: () => {} }))
  assert.ok(errorHtml.includes('Tidak dapat terhubung ke server'))
  assert.ok(errorHtml.includes('Coba lagi'))
  console.log('✓ EmptyState + ErrorState')

  // 4. PageHeader
  const header = render(
    h(PageHeader, {
      title: 'Monitoring',
      meta: 'SIAGA / Monitoring',
      description: 'Data sensor terkini per device.',
      actions: h('span', null, 'aksi'),
    })
  )
  assert.ok(header.includes('SIAGA / Monitoring'))
  assert.ok(header.includes('Monitoring'))
  assert.ok(header.includes('aksi'))
  console.log('✓ PageHeader')

  // 5. DashboardCard
  const dash = render(h(DashboardCard, { label: 'Device Online', value: 2, unit: 'device', tone: 'online' }))
  assert.ok(dash.includes('Device Online'))
  assert.ok(dash.includes('2'))
  assert.ok(dash.includes('device'))
  console.log('✓ DashboardCard')

  // 6. SensorCard
  const sensor = render(h(SensorCard, { label: 'Suhu', value: 29.5, unit: '°C' }))
  assert.ok(sensor.includes('Suhu'))
  assert.ok(sensor.includes('29.5'))
  assert.ok(sensor.includes('°C'))
  console.log('✓ SensorCard')

  // 6b. SensorTrendSparkline — minimal, non-interaktif, degradasi lembut
  const sparkData = [
    { recorded_at: '09:00', value: 28.1 },
    { recorded_at: '09:05', value: 29.5 },
    { recorded_at: '09:10', value: 30.2 },
  ]
  const sparkHtml = render(h(SensorTrendSparkline, { data: sparkData, color: '#f97316' }))
  assert.ok(sparkHtml.includes('Tren nilai naik'))
  assert.ok(sparkHtml.includes('aria-hidden="true"'))
  assert.equal(render(h(SensorTrendSparkline, { data: [] })), '')
  assert.equal(render(h(SensorTrendSparkline, { data: [{ recorded_at: '09:00', value: 28 }] })), '')
  console.log('✓ SensorTrendSparkline (trend label + aria-hidden + minimal data)')

  // 7. DeviceStatusCard
  const devCard = render(h(DeviceStatusCard, { device, latestStatus: 'WARNING' }))
  assert.ok(devCard.includes('Ruang Server Utama'))
  assert.ok(devCard.includes('SIAGA-001'))
  assert.ok(devCard.includes('Online'))
  assert.ok(devCard.includes('Warning'))
  assert.ok(devCard.includes('5 mnt lalu'))
  console.log('✓ DeviceStatusCard')

  // 8. AlertCard (dengan sensor_data terformat id-ID)
  const alertHtml = render(h(AlertCard, { alert }))
  assert.ok(alertHtml.includes('SIAGA-001'))
  assert.ok(alertHtml.includes('Warning'))
  assert.ok(alertHtml.includes('31 Jul 2026'))
  assert.ok(alertHtml.includes('29,5 °C'))
  assert.ok(alertHtml.includes('68,2 %'))
  assert.ok(alertHtml.includes('Ada'))
  assert.ok(alertHtml.includes('Tidak'))
  const alertMin = render(h(AlertCard, { alert: { ...alert, sensor_data: undefined } }))
  assert.ok(!alertMin.includes('29,5 °C'))
  console.log('✓ AlertCard (detail + minimal)')

  // 9. DataTable — data, loading skeleton, empty
  const table = render(h(DataTable, { columns, data: historyRows, rowKey: (row) => String(row.id) }))
  assert.ok(table.includes('Device'))
  assert.ok(table.includes('Suhu'))
  assert.ok(table.includes('SIAGA-001'))
  assert.ok(table.includes('29.5 °C'))
  assert.ok(table.includes('Warning'))
  const loadingTable = render(h(DataTable, { columns, data: [], loading: true }))
  assert.ok(loadingTable.includes('animate-pulse'))
  assert.ok(loadingTable.includes('Device'))
  const emptyTable = render(h(DataTable, { columns, data: [], emptyTitle: 'Belum ada data' }))
  assert.ok(emptyTable.includes('Belum ada data'))
  console.log('✓ DataTable (data/loading/empty)')

  // 10. Pagination — halaman tengah, halaman awal, tanpa meta
  const pager = render(h(Pagination, { meta: { current_page: 3, per_page: 10, total: 240 }, onPageChange: () => {} }))
  assert.ok(pager.includes('Menampilkan 21–30 dari 240 data'))
  assert.ok(pager.includes('Hal. 3 dari 24'))
  assert.ok(pager.includes('aria-label="Halaman sebelumnya"'))
  assert.ok(pager.includes('aria-label="Halaman berikutnya"'))
  assert.ok(pager.includes('aria-current="page"'))
  assert.ok(pager.includes('…'))
  const firstPage = render(h(Pagination, { meta: { current_page: 1, per_page: 50, total: 5 }, onPageChange: () => {} }))
  assert.ok(firstPage.includes('Menampilkan 1–5 dari 5 data'))
  assert.ok(firstPage.includes('disabled'))
  assert.equal(render(h(Pagination, { meta: null, onPageChange: () => {} })), '')
  console.log('✓ Pagination (meta/disabled/empty)')

  // 11. ChartTooltip — format nilai id-ID
  const tip = render(
    h(ChartTooltip, {
      active: true,
      label: '09:15',
      payload: [{ dataKey: 'temperature', name: 'Suhu', value: 29.5, color: '#f97316' }],
    })
  )
  assert.ok(tip.includes('09:15'))
  assert.ok(tip.includes('Suhu'))
  assert.ok(tip.includes('29,5'))
  assert.equal(render(h(ChartTooltip, { active: false, payload: [] })), '')
  console.log('✓ ChartTooltip')

  // 12. Chart — line/area/bar SSR render tanpa error
  const chartData = [
    { t: '09:00', temperature: 28.1 },
    { t: '09:10', temperature: 29.5 },
  ]
  const lineHtml = render(
    h(Chart, {
      type: 'line',
      data: chartData,
      xKey: 't',
      series: [{ key: 'temperature', name: 'Suhu' }],
      showLegend: false,
    })
  )
  assert.ok(typeof lineHtml === 'string' && lineHtml.length > 0)
  const areaHtml = render(h(Chart, { type: 'area', data: chartData, xKey: 't', series: [{ key: 'temperature', name: 'Suhu' }] }))
  const barHtml = render(h(Chart, { type: 'bar', data: chartData, xKey: 't', series: [{ key: 'temperature', name: 'Suhu' }] }))
  assert.ok(typeof areaHtml === 'string' && areaHtml.length > 0)
  assert.ok(typeof barHtml === 'string' && barHtml.length > 0)

  // 12b. Chart bar — per-bar Cell fill (cellDataKey) tetap render SSR
  const cellData = [
    { t: 'DANGER', temperature: 5, fill: '#ef4444' },
    { t: 'WARNING', temperature: 3, fill: '#f59e0b' },
  ]
  const barCellHtml = render(
    h(Chart, {
      type: 'bar',
      data: cellData,
      xKey: 't',
      series: [{ key: 'temperature', name: 'Jumlah', cellDataKey: 'fill' }],
    })
  )
  assert.ok(typeof barCellHtml === 'string' && barCellHtml.length > 0)
  console.log('✓ Chart (line/area/bar SSR + per-bar cell fill)')

  // 12c. AlertSeverityChart — states: loading, error+retry, empty, success, truncated
  const overviewLoading = render(h(AlertSeverityChart, { loading: true, counts: null }))
  assert.ok(overviewLoading.includes('Ringkasan Alert'))
  assert.ok(overviewLoading.includes('animate-pulse'))
  const overviewError = render(h(AlertSeverityChart, { error: { message: 'timeout' }, onRetry: () => {} }))
  assert.ok(overviewError.includes('Gagal memuat ringkasan'))
  assert.ok(overviewError.includes('Muat ulang'))
  const overviewEmpty = render(h(AlertSeverityChart, { counts: { DANGER: 0, WARNING: 0 }, total: 0 }))
  assert.ok(overviewEmpty.includes('Belum ada data alert untuk filter ini.'))
  assert.ok(!overviewEmpty.includes('animate-pulse'))
  const overviewOk = render(
    h(AlertSeverityChart, {
      counts: { DANGER: 5, WARNING: 3 },
      total: 8,
      loading: false,
    })
  )
  assert.ok(overviewOk.includes('Ringkasan Alert'))
  assert.ok(overviewOk.includes('8'))
  assert.ok(overviewOk.includes('data-testid="alert-overview-chart"'))
  const overviewTruncated = render(
    h(AlertSeverityChart, { counts: { DANGER: 100, WARNING: 60 }, total: 160, truncated: true })
  )
  assert.ok(overviewTruncated.includes('Agregat berdasarkan data terbaru (sample)'))
  console.log('✓ AlertSeverityChart (loading/error/empty/success/truncated)')

  // 12d. sortAlertsBySeverity — DANGER di atas WARNING, secondary newest
  const sortAlerts = [
    { id: 2, status: 'WARNING', triggered_at: '2026-07-31T08:50:00Z' },
    { id: 1, status: 'DANGER', triggered_at: '2026-07-31T08:45:00Z' },
    { id: 3, status: 'WARNING', triggered_at: '2026-07-31T08:55:00Z' },
  ]
  const severitySorted = sortAlertsBySeverity(sortAlerts)
  assert.deepEqual(
    severitySorted.map((alert) => alert.id),
    [1, 3, 2]
  )
  assert.deepEqual(sortAlertsBySeverity([]), [])

  // 12e. countAlertsByStatus — agregat per status tanpa bergantung pagination
  assert.deepEqual(
    countAlertsByStatus([
      { id: 1, status: 'DANGER' },
      { id: 2, status: 'WARNING' },
      { id: 3, status: 'WARNING' },
    ]),
    { WARNING: 2, DANGER: 1 }
  )
  assert.deepEqual(countAlertsByStatus([]), { WARNING: 0, DANGER: 0 })
  console.log('✓ sortAlertsBySeverity + countAlertsByStatus (utilities)')

  // 12f. FilterField — select dengan label mono uppercase + opsi
  const statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
  ]
  const fieldSelect = render(
    h(FilterField, {
      id: 'devices-status',
      label: 'Status',
      value: 'online',
      onChange: () => {},
      options: statusOptions,
    })
  )
  assert.ok(fieldSelect.includes('devices-status'))
  assert.ok(fieldSelect.includes('>Status<'))
  assert.ok(fieldSelect.includes('uppercase tracking-widest'))
  assert.ok(fieldSelect.includes('Online'))
  assert.ok(fieldSelect.includes('Offline'))
  assert.ok(fieldSelect.includes('>Semua<'))
  assert.ok(fieldSelect.includes('selected'))

  // 12g. FilterField — date input + min/max + disabled + loadingOptions
  const fieldDate = render(
    h(FilterField, {
      id: 'devices-start-date',
      label: 'Tanggal Awal',
      type: 'date',
      value: '2026-07-01',
      onChange: () => {},
      min: '2026-07-01',
      max: '2026-07-31',
    })
  )
  assert.ok(fieldDate.includes('type="date"'))
  assert.ok(fieldDate.includes('min="2026-07-01"'))
  assert.ok(fieldDate.includes('max="2026-07-31"'))
  assert.ok(fieldDate.includes('Tanggal Awal'))
  const fieldLoading = render(
    h(FilterField, {
      id: 'devices-status',
      label: 'Status',
      value: '',
      onChange: () => {},
      options: [],
      loadingOptions: true,
    })
  )
  assert.ok(fieldLoading.includes('Memuat…'))
  const fieldDisabled = render(
    h(FilterField, {
      id: 'devices-status',
      label: 'Status',
      value: '',
      onChange: () => {},
      options: [],
      disabled: true,
    })
  )
  assert.ok(fieldDisabled.includes('disabled'))
  console.log('✓ FilterField (select/date/loading/disabled)')

  // 13. Dashboard Page — render awal (loading state) tanpa error
  const dashPage = render(h(MemoryRouter, null, h(DashboardPage)))
  assert.ok(dashPage.includes('Memuat status sistem'))
  assert.ok(dashPage.includes('Dashboard'))
  console.log('✓ Dashboard Page (SSR initial/loading)')

  // 14. DashboardContent — success state (summary + device cards)
  const sysOk = {
    total_devices: 3,
    online_devices: 2,
    offline_devices: 1,
    devices: [
      { device_id: 'SIAGA-001', status: 'online', latest_status: 'WARNING', last_seen_at: new Date().toISOString() },
      { device_id: 'SIAGA-002', status: 'online', latest_status: 'NORMAL', last_seen_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { device_id: 'SIAGA-003', status: 'offline', latest_status: null, last_seen_at: null },
    ],
  }
  const okHtml = render(h(DashboardContent, { system: sysOk, onSelectDevice: () => {} }))
  assert.ok(okHtml.includes('Total Device'))
  assert.ok(okHtml.includes('Device Online'))
  assert.ok(okHtml.includes('Device Offline'))
  assert.ok(okHtml.includes('Device Overview'))
  assert.ok(okHtml.includes('SIAGA-001'))
  assert.ok(okHtml.includes('SIAGA-002'))
  assert.ok(okHtml.includes('SIAGA-003'))
  assert.ok(okHtml.includes('Online'))
  assert.ok(okHtml.includes('Offline'))
  assert.ok(okHtml.includes('Warning'))
  assert.ok(!okHtml.includes('Belum ada device'))
  console.log('✓ DashboardContent (success + device cards)')

  // 15. DashboardContent — empty state (total_devices = 0)
  const sysEmpty = { total_devices: 0, online_devices: 0, offline_devices: 0, devices: [] }
  const emptyHtml = render(h(DashboardContent, { system: sysEmpty, onSelectDevice: () => {} }))
  assert.ok(emptyHtml.includes('Belum ada device'))
  console.log('✓ DashboardContent (empty state)')

  // 16. DashboardContent — stale data saat polling gagal
  const staleHtml = render(h(DashboardContent, { system: sysOk, error: { message: 'offline' }, onSelectDevice: () => {} }))
  assert.ok(staleHtml.includes('menampilkan data terakhir'))
  assert.ok(staleHtml.includes('SIAGA-001'))
  console.log('✓ DashboardContent (stale data + error notice)')

  // 16a. DashboardContent + Recent Alerts — populated (reuse AlertCard)
  const recentAlerts = [
    { id: 512, device_id: 'SIAGA-001', sensor_data_id: 10452, status: 'DANGER', triggered_at: '2026-07-31T09:15:00Z', created_at: '2026-07-31T09:15:00Z' },
    { id: 511, device_id: 'SIAGA-002', sensor_data_id: 10451, status: 'WARNING', triggered_at: '2026-07-31T08:50:00Z', created_at: '2026-07-31T08:50:00Z' },
  ]
  const alertsOkHtml = render(
    h(DashboardContent, {
      system: sysOk,
      onSelectDevice: () => {},
      alerts: recentAlerts,
      alertsLoading: false,
      alertsError: null,
      onAlertsRetry: () => {},
      onViewAllAlerts: () => {},
    })
  )
  assert.ok(alertsOkHtml.includes('Recent Alerts'))
  assert.ok(alertsOkHtml.includes('Lihat semua alert'))
  assert.ok(alertsOkHtml.includes('SIAGA-001'))
  assert.ok(alertsOkHtml.includes('Danger'))
  assert.ok(alertsOkHtml.includes('Warning'))
  assert.ok(alertsOkHtml.includes('31 Jul 2026'))
  assert.ok(!alertsOkHtml.includes('Belum ada alert'))
  assert.ok(alertsOkHtml.includes('Device Overview'))
  console.log('✓ DashboardContent + Recent Alerts (populated via AlertCard)')

  // 16b. DashboardContent + Recent Alerts — loading tanpa memblokir Device Overview
  const alertsLoadingHtml = render(
    h(DashboardContent, {
      system: sysOk,
      onSelectDevice: () => {},
      alerts: null,
      alertsLoading: true,
      alertsError: null,
      onAlertsRetry: () => {},
      onViewAllAlerts: () => {},
    })
  )
  assert.ok(alertsLoadingHtml.includes('Memuat alert terbaru'))
  assert.ok(alertsLoadingHtml.includes('SIAGA-001'))
  console.log('✓ DashboardContent + Recent Alerts (loading, Device Overview tetap tampil)')

  // 16c. DashboardContent + Recent Alerts — error tidak memblokir Device Overview
  const alertsErrorHtml = render(
    h(DashboardContent, {
      system: sysOk,
      onSelectDevice: () => {},
      alerts: null,
      alertsLoading: false,
      alertsError: { isNetworkError: true, message: 'offline' },
      onAlertsRetry: () => {},
      onViewAllAlerts: () => {},
    })
  )
  assert.ok(alertsErrorHtml.includes('Tidak dapat terhubung ke server'))
  assert.ok(alertsErrorHtml.includes('Coba lagi'))
  assert.ok(alertsErrorHtml.includes('SIAGA-001'))
  assert.ok(alertsErrorHtml.includes('Total Device'))
  console.log('✓ DashboardContent + Recent Alerts (error tidak memblokir Device Overview)')

  // 16d. DashboardContent + Recent Alerts — empty state
  const alertsEmptyHtml = render(
    h(DashboardContent, {
      system: sysOk,
      onSelectDevice: () => {},
      alerts: [],
      alertsLoading: false,
      alertsError: null,
      onAlertsRetry: () => {},
      onViewAllAlerts: () => {},
    })
  )
  assert.ok(alertsEmptyHtml.includes('Belum ada alert'))
  assert.ok(alertsEmptyHtml.includes('SIAGA-001'))
  console.log('✓ DashboardContent + Recent Alerts (empty state)')

  // 16e. RecentAlerts — stale data saat refetch alert gagal
  const alertsStaleHtml = render(
    h(DashboardContent, {
      system: sysOk,
      onSelectDevice: () => {},
      alerts: recentAlerts,
      alertsLoading: false,
      alertsError: { message: 'timeout' },
      onAlertsRetry: () => {},
      onViewAllAlerts: () => {},
    })
  )
  assert.ok(alertsStaleHtml.includes('menampilkan data terakhir'))
  assert.ok(alertsStaleHtml.includes('SIAGA-001'))
  console.log('✓ DashboardContent + Recent Alerts (stale data + notice)')

  // 17. Monitoring Page — SSR initial (loading selector, belum pilih device)
  const mon = render(h(MemoryRouter, null, h(MonitoringPage)))
  assert.ok(mon.includes('Memuat daftar device'))
  assert.ok(mon.includes('Monitoring'))
  assert.ok(mon.includes('Pilih device…'))
  console.log('✓ Monitoring Page (SSR initial/loading)')

  // 18. SensorGrid — sensor terkini terformat (id-ID, Ada/Tidak, unit)
  const sensorHtml = render(
    h(SensorGrid, {
      sensor: { temperature: 29.5, humidity: 68.2, light: 120, motion: true, obstacle: false },
    })
  )
  assert.ok(sensorHtml.includes('Suhu'))
  assert.ok(sensorHtml.includes('Kelembapan'))
  assert.ok(sensorHtml.includes('Cahaya'))
  assert.ok(sensorHtml.includes('Gerakan'))
  assert.ok(sensorHtml.includes('Obstacle'))
  assert.ok(sensorHtml.includes('29,5'))
  assert.ok(sensorHtml.includes('68,2'))
  assert.ok(sensorHtml.includes('120'))
  assert.ok(sensorHtml.includes('Ada'))
  assert.ok(sensorHtml.includes('Tidak'))
  assert.ok(sensorHtml.includes('°C'))
  assert.ok(sensorHtml.includes('%'))
  assert.ok(sensorHtml.includes('lux'))
  console.log('✓ SensorGrid (labels, id-ID values, Ada/Tidak, units)')

  // 18b. SensorGrid — sparkline hanya untuk 3 sensor kontinu
  const trendRows = [
    { recorded_at: '2026-07-31T09:00:00Z', temperature: 28.1, humidity: 65.4, light: 100 },
    { recorded_at: '2026-07-31T09:10:00Z', temperature: 29.5, humidity: 68.2, light: 120 },
  ]
  const trendHtml = render(
    h(SensorGrid, {
      sensor: { temperature: 29.5, humidity: 68.2, light: 120, motion: true, obstacle: false },
      trend: trendRows,
    })
  )
  assert.equal((trendHtml.match(/Tren nilai naik/g) || []).length, 3)
  const noTrendHtml = render(
    h(SensorGrid, {
      sensor: { temperature: 29.5, humidity: 68.2, light: 120, motion: true, obstacle: false },
      trend: [],
    })
  )
  assert.ok(!noTrendHtml.includes('Tren nilai'))
  console.log('✓ SensorGrid (sparkline hanya pada 3 sensor kontinu)')

  // 19. MonitoringContent — device belum punya data sensor (404 latest)
  const notFound = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Sensor data tidak ditemukan' })
  const noSensor = render(
    h(MonitoringContent, {
      device: { device_id: 'SIAGA-001', name: 'Ruang Server Utama', status: 'online', last_seen_at: null },
      deviceError: null,
      latest: null,
      latestError: notFound,
      latestLoading: false,
      onRetryDevice: () => {},
      onRetryLatest: () => {},
    })
  )
  assert.ok(noSensor.includes('Belum ada data sensor'))
  assert.ok(noSensor.includes('Ruang Server Utama'))
  console.log('✓ MonitoringContent (404 latest → empty state)')

  // 20. MonitoringContent — device tidak ditemukan (404 device)
  const deviceNotFoundHtml = render(
    h(MonitoringContent, {
      device: null,
      deviceError: notFound,
      latest: null,
      latestError: null,
      latestLoading: false,
      onRetryDevice: () => {},
      onRetryLatest: () => {},
    })
  )
  assert.ok(deviceNotFoundHtml.includes('Device tidak ditemukan'))
  console.log('✓ MonitoringContent (404 device → empty state)')

  // 21. MonitoringContent — error jaringan (ErrorState + retry)
  const networkErr = new ApiError({ code: 'NETWORK_ERROR', message: 'Gagal terhubung ke server. Periksa koneksi dan coba lagi.', isNetworkError: true })
  const errMon = render(
    h(MonitoringContent, {
      device: null,
      deviceError: null,
      latest: null,
      latestError: networkErr,
      latestLoading: false,
      onRetryDevice: () => {},
      onRetryLatest: () => {},
    })
  )
  assert.ok(errMon.includes('Tidak dapat terhubung ke server'))
  assert.ok(errMon.includes('Coba lagi'))
  console.log('✓ MonitoringContent (network error → ErrorState)')

  // 22. MonitoringContent — success + stale notice
  const latestSensor = { device_id: 'SIAGA-001', recorded_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), temperature: 29.5, humidity: 68.2, motion: true, light: 120.0, obstacle: false, status: 'WARNING' }
  const staleMon = render(
    h(MonitoringContent, {
      device: { device_id: 'SIAGA-001', name: 'Ruang Server Utama', status: 'online', last_seen_at: new Date().toISOString() },
      deviceError: null,
      latest: latestSensor,
      latestError: { message: 'timeout' },
      latestLoading: false,
      onRetryDevice: () => {},
      onRetryLatest: () => {},
    })
  )
  assert.ok(staleMon.includes('menampilkan pembacaan terakhir'))
  assert.ok(staleMon.includes('Warning'))
  assert.ok(staleMon.includes('SIAGA-001'))
  assert.ok(staleMon.includes('Suhu'))
  console.log('✓ MonitoringContent (success + stale data)')

  // 23. Historical Data Page — SSR initial (filter belum terisi)
  const histPage = render(h(MemoryRouter, null, h(HistoricalDataPage)))
  assert.ok(histPage.includes('Historical Data'))
  assert.ok(histPage.includes('Filter Riwayat'))
  assert.ok(histPage.includes('Pilih device dan rentang waktu'))
  assert.ok(histPage.includes('Tanggal Awal'))
  assert.ok(histPage.includes('Tanggal Akhir'))
  console.log('✓ Historical Data Page (SSR initial/loading)')

  const historyRecords = [
    { id: 1, device_id: 'SIAGA-001', recorded_at: '2026-07-31T09:00:00Z', temperature: 29.5, humidity: 65.4, motion: false, light: 120.0, obstacle: false, status: 'NORMAL' },
    { id: 2, device_id: 'SIAGA-001', recorded_at: '2026-07-31T09:05:00Z', temperature: 29.8, humidity: 64.1, motion: true, light: 135.0, obstacle: false, status: 'WARNING' },
  ]
  const historyMeta = { current_page: 1, per_page: 50, total: 2 }
  const chartRecords = [
    ...historyRecords,
    { id: 3, device_id: 'SIAGA-001', recorded_at: '2026-07-31T09:10:00Z', temperature: 30.1, humidity: 62.8, motion: false, light: 140.0, obstacle: false, status: 'WARNING' },
  ]
  const noop = () => {}

  // 24. HistoricalDataContent — success (chart + table + pagination)
  const histOk = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: historyRecords,
      meta: historyMeta,
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      chartRecords,
      chartLoading: false,
      chartError: null,
      chartTruncated: false,
      onChartRetry: noop,
    })
  )
  assert.ok(histOk.includes('Tren Sensor'))
  assert.ok(histOk.includes('Detail Riwayat'))
  assert.ok(histOk.includes('Grafik tren suhu, kelembapan, dan cahaya'))
  assert.ok(histOk.includes('29,5'))
  assert.ok(histOk.includes('65,4'))
  assert.ok(histOk.includes('Normal'))
  assert.ok(histOk.includes('Warning'))
  assert.ok(histOk.includes('Ada'))
  assert.ok(histOk.includes('Tidak'))
  assert.ok(histOk.includes('Menampilkan 1–2 dari 2 data'))
  assert.ok(!histOk.includes('Menampilkan tren berdasarkan sampel data'))
  console.log('✓ HistoricalDataContent (success + chart + table)')

  // 24b. downsampleRecords — mengurangi ukuran, mempertahankan titik awal/akhir
  const series = Array.from({ length: 10 }, (_, i) => ({ t: i, v: i }))
  const sampled = downsampleRecords(series, 4)
  assert.equal(sampled.length, 4)
  assert.equal(sampled[0].v, 0)
  assert.equal(sampled[3].v, 9)
  assert.deepEqual(downsampleRecords(series, 100), series)
  console.log('✓ downsampleRecords (ukuran + titik awal/akhir)')

  // 25. HistoricalDataContent — tidak ada data dalam rentang (200 kosong)
  const histEmpty = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: [],
      meta: { current_page: 1, per_page: 50, total: 0 },
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      chartRecords: [],
      chartLoading: false,
      chartError: null,
      chartTruncated: false,
      onChartRetry: noop,
    })
  )
  assert.ok(histEmpty.includes('Tidak ada data dalam rentang waktu ini'))
  console.log('✓ HistoricalDataContent (200 empty range)')

  // 26. HistoricalDataContent — rentang waktu tidak valid
  const histInvalid = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-31',
      endDate: '2026-07-01',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: null,
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
    })
  )
  assert.ok(histInvalid.includes('Rentang waktu tidak valid'))
  console.log('✓ HistoricalDataContent (invalid range)')

  // 27. HistoricalDataContent — error jaringan (ErrorState + retry)
  const histError = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: null,
      meta: null,
      page: 1,
      loading: false,
      error: networkErr,
      onPageChange: noop,
      onRetry: noop,
    })
  )
  assert.ok(histError.includes('Tidak dapat terhubung ke server'))
  assert.ok(histError.includes('Coba lagi'))
  console.log('✓ HistoricalDataContent (network error)')

  // 28. HistoricalDataContent — data lama saat refetch gagal (stale)
  const histStale = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: historyRecords,
      meta: historyMeta,
      page: 1,
      loading: false,
      error: { message: 'timeout' },
      onPageChange: noop,
      onRetry: noop,
      chartRecords,
      chartLoading: false,
      chartError: null,
      chartTruncated: false,
      onChartRetry: noop,
    })
  )
  assert.ok(histStale.includes('menampilkan data terakhir'))
  assert.ok(histStale.includes('Tren Sensor'))
  assert.ok(histStale.includes('Detail Riwayat'))
  console.log('✓ HistoricalDataContent (stale data + notice)')

  // 28b. HistoricalDataContent — chart loading (skeleton) saat tabel sudah siap
  const histChartLoading = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: historyRecords,
      meta: historyMeta,
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      chartRecords: null,
      chartLoading: true,
      chartError: null,
      chartTruncated: false,
      onChartRetry: noop,
    })
  )
  assert.ok(histChartLoading.includes('animate-pulse'))
  assert.ok(histChartLoading.includes('Detail Riwayat'))
  console.log('✓ HistoricalDataContent (chart loading skeleton)')

  // 28c. HistoricalDataContent — chart gagal dimuat, tabel tetap tampil
  const histChartError = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: historyRecords,
      meta: historyMeta,
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      chartRecords: null,
      chartLoading: false,
      chartError: { message: 'timeout' },
      chartTruncated: false,
      onChartRetry: noop,
    })
  )
  assert.ok(histChartError.includes('Grafik tren tidak dapat dimuat'))
  assert.ok(histChartError.includes('Muat ulang'))
  assert.ok(histChartError.includes('Detail Riwayat'))
  assert.ok(histChartError.includes('29,5'))
  console.log('✓ HistoricalDataContent (chart error + table tetap tampil)')

  // 28d. HistoricalDataContent — chart memakai sampel data (downsampled)
  const histSampled = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: historyRecords,
      meta: historyMeta,
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      chartRecords,
      chartLoading: false,
      chartError: null,
      chartTruncated: true,
      onChartRetry: noop,
    })
  )
  assert.ok(histSampled.includes('Menampilkan tren berdasarkan sampel data'))
  assert.ok(histSampled.includes('Detail Riwayat'))
  console.log('✓ HistoricalDataContent (chart downsampled notice)')

  // 28e. HistoricalDataContent — chart kosong padahal tabel berisi data
  const histChartEmpty = render(
    h(HistoricalDataContent, {
      devices: [device],
      deviceId: 'SIAGA-001',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      onDeviceChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      records: historyRecords,
      meta: historyMeta,
      page: 1,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      chartRecords: [],
      chartLoading: false,
      chartError: null,
      chartTruncated: false,
      onChartRetry: noop,
    })
  )
  assert.ok(histChartEmpty.includes('Grafik tren tidak tersedia untuk rentang ini'))
  assert.ok(histChartEmpty.includes('Detail Riwayat'))
  assert.ok(histChartEmpty.includes('29,5'))
  console.log('✓ HistoricalDataContent (chart empty, table tetap tampil)')

  // 29. Alerts Page — SSR initial (list loading, filter belum terisi)
  const alertsPage = render(h(MemoryRouter, null, h(AlertsPage)))
  assert.ok(alertsPage.includes('Alerts'))
  assert.ok(alertsPage.includes('Filter Alert'))
  assert.ok(alertsPage.includes('Tanggal Awal'))
  assert.ok(alertsPage.includes('Tanggal Akhir'))
  assert.ok(alertsPage.includes('Status'))
  console.log('✓ Alerts Page (SSR initial/loading)')

  const alertsRows = [
    { id: 1, device_id: 'SIAGA-001', sensor_data_id: 10448, status: 'DANGER', triggered_at: '2026-07-31T08:45:00Z', created_at: '2026-07-31T08:45:00Z' },
    { id: 2, device_id: 'SIAGA-002', sensor_data_id: 10449, status: 'WARNING', triggered_at: '2026-07-31T08:50:00Z', created_at: '2026-07-31T08:50:00Z' },
  ]
  const alertsMeta = { current_page: 1, per_page: 50, total: 2 }

  // 30. AlertsContent — list success + pagination + aggregate chart
  const alertsOk = render(
    h(AlertsContent, {
      devices: [device],
      alerts: alertsRows,
      meta: alertsMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      sortOrder: 'recent',
      onSortOrderChange: noop,
      overviewCounts: { DANGER: 1, WARNING: 1 },
      overviewTotal: 2,
      overviewLoading: false,
    })
  )
  assert.ok(alertsOk.includes('#1'))
  assert.ok(alertsOk.includes('SIAGA-001'))
  assert.ok(alertsOk.includes('Danger'))
  assert.ok(alertsOk.includes('Warning'))
  assert.ok(alertsOk.includes('Waktu Kejadian'))
  assert.ok(alertsOk.includes('31 Jul 2026'))
  assert.ok(alertsOk.includes('Menampilkan 1–2 dari 2 data'))
  assert.ok(alertsOk.includes('Ringkasan Alert'))
  assert.ok(alertsOk.includes('Urutkan'))
  assert.ok(alertsOk.includes('Terbaru'))
  assert.ok(alertsOk.includes('Prioritas'))
  assert.ok(alertsOk.includes('id="alerts-sort"'))

  // 30b. AlertsContent — sort severity menempatkan DANGER sebelum WARNING
  // pada dataset yang ditampilkan
  const seaRows = [
    { id: 2, device_id: 'SIAGA-002', status: 'WARNING', triggered_at: '2026-07-31T08:50:00Z' },
    { id: 1, device_id: 'SIAGA-001', status: 'DANGER', triggered_at: '2026-07-31T08:45:00Z' },
  ]
  const alertsSorted = render(
    h(AlertsContent, {
      alerts: seaRows,
      meta: alertsMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      sortOrder: 'severity',
      onSortOrderChange: noop,
    })
  )
  assert.ok(alertsSorted.indexOf('#1') < alertsSorted.indexOf('#2'))
  console.log('✓ AlertsContent (list success + chart + sort control + severity sort)')

  // 31. AlertsContent — empty result (dibedakan tanpa/ada filter)
  const alertsEmpty = render(
    h(AlertsContent, {
      alerts: [],
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
    })
  )
  assert.ok(alertsEmpty.includes('Belum ada alert'))
  const alertsEmptyFiltered = render(
    h(AlertsContent, {
      status: 'DANGER',
      alerts: [],
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
    })
  )
  assert.ok(alertsEmptyFiltered.includes('Tidak ada alert yang sesuai dengan filter'))
  console.log('✓ AlertsContent (empty without/with filter)')

  // 32. AlertsContent — error jaringan (ErrorState + retry)
  const alertsError = render(
    h(AlertsContent, {
      alerts: null,
      loading: false,
      error: networkErr,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
    })
  )
  assert.ok(alertsError.includes('Tidak dapat terhubung ke server'))
  assert.ok(alertsError.includes('Coba lagi'))
  console.log('✓ AlertsContent (network error + retry)')

  // 33. AlertsContent — 422 validation details (ApiError.details)
  const validationError = new ApiError({
    status: 422,
    code: 'VALIDATION_ERROR',
    message: 'The given data was invalid.',
    details: { status: ['The selected status is invalid. It must be one of WARNING, DANGER.'] },
  })
  const alerts422 = render(
    h(AlertsContent, {
      alerts: null,
      loading: false,
      error: validationError,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
    })
  )
  assert.ok(alerts422.includes('VALIDATION_ERROR'))
  assert.ok(alerts422.includes('The selected status is invalid.'))
  console.log('✓ AlertsContent (422 validation details)')

  // 34. Alert detail — success + nested sensor_data
  const alertDetail = {
    id: 5,
    device_id: 'SIAGA-001',
    sensor_data_id: 10460,
    status: 'WARNING',
    triggered_at: '2026-07-31T09:15:00Z',
    created_at: '2026-07-31T09:15:00Z',
    sensor_data: { temperature: 29.5, humidity: 68.2, motion: true, light: 120.0, obstacle: false },
  }
  const alertsDetail = render(
    h(AlertsContent, {
      devices: [device],
      alerts: alertsRows,
      meta: alertsMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      alertId: 5,
      detail: alertDetail,
      detailLoading: false,
      detailError: null,
    })
  )
  assert.ok(alertsDetail.includes('Alert Detail'))
  assert.ok(alertsDetail.includes('Kejadian #5'))
  assert.ok(alertsDetail.includes('SIAGA-001'))
  assert.ok(alertsDetail.includes('Suhu'))
  assert.ok(alertsDetail.includes('29,5'))
  assert.ok(alertsDetail.includes('68,2'))
  assert.ok(alertsDetail.includes('Ada'))
  assert.ok(alertsDetail.includes('Tidak'))
  assert.ok(alertsDetail.includes('Tutup detail alert'))
  console.log('✓ Alert detail (success + nested sensor_data)')

  // 35. Alert detail — 404 (EmptyState, bukan error generic)
  const alertsDetail404 = render(
    h(AlertsContent, {
      alerts: alertsRows,
      meta: alertsMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onDeviceChange: noop,
      onStatusChange: noop,
      onStartDateChange: noop,
      onEndDateChange: noop,
      onSelectAlert: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      alertId: 999,
      detail: null,
      detailLoading: false,
      detailError: notFound,
    })
  )
  assert.ok(alertsDetail404.includes('Alert tidak ditemukan'))
  console.log('✓ Alert detail (404 not found)')

  // 36. Devices Page — SSR initial (list loading, filter belum terisi)
  const devicesPage = render(h(MemoryRouter, null, h(DevicesPage)))
  assert.ok(devicesPage.includes('Devices'))
  assert.ok(devicesPage.includes('Filter Device'))
  assert.ok(devicesPage.includes('Status'))
  console.log('✓ Devices Page (SSR initial/loading)')

  const deviceRows = [
    { device_id: 'SIAGA-001', name: 'Ruang Server Utama', status: 'online', last_seen_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), created_at: '2026-06-01T08:00:00Z', updated_at: new Date().toISOString() },
    { device_id: 'SIAGA-002', name: 'Lobi Utama', status: 'offline', last_seen_at: '2026-07-30T10:00:00Z', created_at: '2026-06-02T08:00:00Z', updated_at: '2026-07-30T10:00:00Z' },
  ]
  const devicesMeta = { current_page: 1, per_page: 50, total: 2 }

  // 37. DevicesContent — list success + pagination
  const devicesOk = render(
    h(DevicesContent, {
      status: '',
      onStatusChange: noop,
      devices: deviceRows,
      meta: devicesMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
    })
  )
  assert.ok(devicesOk.includes('SIAGA-001'))
  assert.ok(devicesOk.includes('Ruang Server Utama'))
  assert.ok(devicesOk.includes('SIAGA-002'))
  assert.ok(devicesOk.includes('Lobi Utama'))
  assert.ok(devicesOk.includes('Online'))
  assert.ok(devicesOk.includes('Offline'))
  assert.ok(devicesOk.includes('Terakhir Terlihat'))
  assert.ok(devicesOk.includes('Menampilkan 1–2 dari 2 data'))

  // 37b. DevicesContent — filter memakai FilterField dengan lebar proporsional
  assert.ok(devicesOk.includes('id="devices-status"'))
  assert.ok(devicesOk.includes('max-w-xs'))
  assert.ok(devicesOk.includes('>Semua<'))
  assert.ok(!devicesOk.includes('lg:grid-cols-4'))
  console.log('✓ DevicesContent (list success + pagination + FilterField width)')

  // 38. DevicesContent — empty result (dibedakan tanpa/ada filter)
  const devicesEmpty = render(
    h(DevicesContent, {
      status: '',
      onStatusChange: noop,
      devices: [],
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
    })
  )
  assert.ok(devicesEmpty.includes('Belum ada device terdaftar'))
  const devicesEmptyFiltered = render(
    h(DevicesContent, {
      status: 'offline',
      onStatusChange: noop,
      devices: [],
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
    })
  )
  assert.ok(devicesEmptyFiltered.includes('Tidak ada device yang sesuai dengan filter'))
  console.log('✓ DevicesContent (empty without/with filter)')

  // 39. DevicesContent — error jaringan (ErrorState + retry)
  const devicesError = render(
    h(DevicesContent, {
      status: '',
      onStatusChange: noop,
      devices: null,
      loading: false,
      error: networkErr,
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
    })
  )
  assert.ok(devicesError.includes('Tidak dapat terhubung ke server'))
  assert.ok(devicesError.includes('Coba lagi'))
  console.log('✓ DevicesContent (network error + retry)')

  // 40. DevicesContent — stale data saat refetch gagal
  const devicesStale = render(
    h(DevicesContent, {
      status: '',
      onStatusChange: noop,
      devices: deviceRows,
      meta: devicesMeta,
      loading: false,
      error: { message: 'timeout' },
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
    })
  )
  assert.ok(devicesStale.includes('menampilkan data terakhir'))
  assert.ok(devicesStale.includes('SIAGA-001'))
  console.log('✓ DevicesContent (stale data + notice)')

  // 41. Device detail — success + timestamp + action monitoring
  const deviceDetail = {
    device_id: 'SIAGA-001',
    name: 'Ruang Server Utama',
    status: 'offline',
    last_seen_at: '2026-07-30T10:00:00Z',
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-07-30T10:00:00Z',
  }
  const deviceDetailOk = render(
    h(DevicesContent, {
      status: '',
      onStatusChange: noop,
      devices: deviceRows,
      meta: devicesMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
      deviceId: 'SIAGA-001',
      detail: deviceDetail,
      detailLoading: false,
      detailError: null,
    })
  )
  assert.ok(deviceDetailOk.includes('Device Detail'))
  assert.ok(deviceDetailOk.includes('Perangkat SIAGA-001'))
  assert.ok(deviceDetailOk.includes('Ruang Server Utama'))
  assert.ok(deviceDetailOk.includes('Offline'))
  assert.ok(deviceDetailOk.includes('Terakhir Terlihat'))
  assert.ok(deviceDetailOk.includes('Terdaftar'))
  assert.ok(deviceDetailOk.includes('Diperbarui'))
  assert.ok(deviceDetailOk.includes('30 Jul 2026'))
  assert.ok(deviceDetailOk.includes('Buka Monitoring'))
  assert.ok(deviceDetailOk.includes('Tutup detail device'))
  console.log('✓ Device detail (success + timestamps + monitoring action)')

  // 42. Device detail — 404 (EmptyState, bukan error generic)
  const deviceDetail404 = render(
    h(DevicesContent, {
      status: '',
      onStatusChange: noop,
      devices: deviceRows,
      meta: devicesMeta,
      loading: false,
      error: null,
      onPageChange: noop,
      onRetry: noop,
      onSelectDevice: noop,
      onDetailClose: noop,
      onDetailRetry: noop,
      onOpenMonitoring: noop,
      deviceId: 'SIAGA-999',
      detail: null,
      detailLoading: false,
      detailError: notFound,
    })
  )
  assert.ok(deviceDetail404.includes('Device tidak ditemukan'))
  console.log('✓ Device detail (404 not found)')

  console.log('\nSMOKE PASSED — all shared components render OK')
}

run()
