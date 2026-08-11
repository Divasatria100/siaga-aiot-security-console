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
import { DeviceStatusCard } from '@/components/shared/DeviceStatusCard'
import { AlertCard } from '@/components/shared/AlertCard'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { Chart } from '@/components/shared/Chart'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import DashboardPage, { DashboardContent } from '@/pages/Dashboard'

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
  console.log('✓ Chart (line/area/bar SSR)')

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

  console.log('\nSMOKE PASSED — all shared components render OK')
}

run()
