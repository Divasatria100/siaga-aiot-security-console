/**
 * Verifikasi data layer SIAGA (mock-based, tidak memerlukan backend).
 *
 * Menguji modul data layer ASLI (lib/axios, services, utils/pagination)
 * terhadap adapter axios tiruan yang mensimulasikan kontrak backend:
 * - params serializer: omit undefined/null/empty, encode ISO 8601 offset (`+`)
 * - envelope unwrap ({ success, data, meta })
 * - normalisasi error (404/422/500/network)
 * - helper pagination
 *
 * Jalankan: `npm run smoke:api`
 */
import assert from 'node:assert/strict'
import axios from 'axios'
import apiClient, { ApiError, isNotFoundError } from '@/lib/axios'
import { getDevices, getDevice } from '@/services/devices'
import {
  createSensorData,
  getLatestSensorData,
  getSensorDataHistory,
} from '@/services/sensorData'
import { getAlerts, getAlert } from '@/services/alerts'
import { getSystemStatus } from '@/services/systemStatus'
import {
  getTotalPages,
  hasNextPage,
  hasPreviousPage,
} from '@/utils/pagination'

const calls = []

const deviceDetail = {
  device_id: 'SIAGA-001',
  name: 'Ruang Server Utama',
  status: 'online',
  last_seen_at: '2026-07-31T09:15:00Z',
  created_at: '2026-06-01T08:00:00Z',
  updated_at: '2026-07-31T09:15:00Z',
}

const latestData = {
  device_id: 'SIAGA-001',
  recorded_at: '2026-07-31T09:15:00Z',
  temperature: 29.5,
  humidity: 68.2,
  motion: true,
  light: 120.0,
  obstacle: false,
  status: 'WARNING',
}

const routerAdapter = async (config) => {
  const serialized = apiClient.getUri(config)
  calls.push(serialized)
  const [fullPath, query = ''] = serialized.split('?')
  const path = fullPath.replace('/api/v1', '')

  const ok = (body) => ({ status: 200, body })
  const respond = (status, code, message, details) => ({
    status,
    body: {
      success: false,
      error: { code, message, details: details ?? {} },
    },
  })

  let body = config.data
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }

  let resp
  if (path.endsWith('/sensor-data') && config.method === 'post') {
    resp = {
      status: 201,
      body: {
        success: true,
        message: 'Sensor data berhasil disimpan',
        data: { id: 10452, device_id: body.device_id, ...body },
      },
    }
  } else if (path === '/sensor-data/latest') {
    resp = ok({ success: true, data: latestData })
  } else if (path === '/sensor-data/history') {
    resp = ok({
      success: true,
      data: [
        { id: 10448, device_id: 'SIAGA-001', recorded_at: '2026-07-31T09:00:00Z', temperature: 28.1, humidity: 65.4, motion: false, light: 110.0, obstacle: false, status: 'NORMAL' },
      ],
      meta: { current_page: 1, per_page: 50, total: 240 },
    })
  } else if (path === '/devices') {
    resp = ok({
      success: true,
      data: [deviceDetail],
      meta: { current_page: 1, per_page: 50, total: 1 },
    })
  } else if (path.startsWith('/devices/')) {
    const id = decodeURIComponent(path.split('/devices/')[1])
    if (id === 'SIAGA-001') resp = ok({ success: true, data: deviceDetail })
    else if (id === 'SIAGA-422') {
      resp = respond(422, 'VALIDATION_ERROR', 'Data yang dikirimkan tidak valid', {
        status: ['Field status wajib diisi dan harus salah satu dari NORMAL, WARNING, DANGER'],
      })
    } else {
      resp = respond(404, 'NOT_FOUND', 'Device tidak ditemukan')
    }
  } else if (path === '/alerts/512') {
    resp = ok({
      success: true,
      data: {
        id: 512,
        device_id: 'SIAGA-001',
        sensor_data_id: 10452,
        status: 'WARNING',
        triggered_at: '2026-07-31T09:15:00Z',
        sensor_data: { temperature: 29.5, humidity: 68.2, motion: true, light: 120.0, obstacle: false },
      },
    })
  } else if (path === '/alerts') {
    resp = ok({
      success: true,
      data: [
        { id: 512, device_id: 'SIAGA-001', sensor_data_id: 10452, status: 'WARNING', triggered_at: '2026-07-31T09:15:00Z' },
      ],
      meta: { current_page: 1, per_page: 50, total: 1 },
    })
  } else if (path === '/system/status') {
    resp = ok({
      success: true,
      data: {
        total_devices: 3,
        online_devices: 2,
        offline_devices: 1,
        devices: [{ device_id: 'SIAGA-001', status: 'online', latest_status: 'WARNING', last_seen_at: '2026-07-31T09:15:00Z' }],
      },
    })
  } else {
    resp = respond(500, 'INTERNAL_SERVER_ERROR', 'Terjadi kesalahan pada server')
  }

  const response = {
    data: resp.body,
    status: resp.status,
    statusText: resp.status < 400 ? 'OK' : 'ERROR',
    headers: {},
    config,
  }
  if (resp.status >= 200 && resp.status < 300) {
    return response
  }
  // axios 1.19: adapter custom wajib menolak non-2xx sendiri
  // (settle hanya dipanggil oleh adapter bawaan http/fetch/xhr).
  const axErr = new axios.AxiosError(
    `Request failed with status code ${resp.status}`,
    resp.status >= 400 && resp.status < 500
      ? axios.AxiosError.ERR_BAD_REQUEST
      : axios.AxiosError.ERR_BAD_RESPONSE,
    config,
    null,
    response,
  )
  throw axErr
}

const lastQuery = (path) => {
  const hit = calls.filter((u) => u.startsWith(`/api/v1${path}?`)).at(-1)
  return hit ? hit.split('?')[1] : ''
}

async function run() {
  apiClient.defaults.adapter = routerAdapter

  // 1. System status — envelope unwrap
  const sys = await getSystemStatus()
  assert.equal(sys.success, true)
  assert.equal(sys.data.total_devices, 3)
  console.log('✓ getSystemStatus() unwraps envelope')

  // 2. Devices — paginated + query params
  const devs = await getDevices({ status: 'online', page: 2, perPage: 10 })
  assert.equal(devs.data.length, 1)
  assert.equal(devs.meta.total, 1)
  const devUrl = lastQuery('/devices')
  assert.ok(devUrl.includes('status=online'), devUrl)
  assert.ok(devUrl.includes('page=2'), devUrl)
  assert.ok(devUrl.includes('per_page=10'), devUrl)
  console.log('✓ getDevices() serializes status/page/per_page')

  // 3. Query param omit undefined
  await getDevices({})
  const devUrl2 = lastQuery('/devices')
  assert.ok(!devUrl2.includes('status='), devUrl2)
  assert.ok(devUrl2.includes('per_page=50'), devUrl2)
  console.log('✓ undefined/null/empty params omitted')

  // 4. History — ISO 8601 offset di-encode (bug `+` pada test backend)
  await getSensorDataHistory({
    deviceId: 'SIAGA-001',
    startDate: '2026-07-31T00:00:00+07:00',
    endDate: '2026-07-31T23:59:59+07:00',
    page: 1,
    perPage: 50,
  })
  const histUrl = lastQuery('/sensor-data/history')
  assert.ok(
    histUrl.includes('start_date=2026-07-31T00%3A00%3A00%2B07%3A00'),
    `expected encoded +07:00, got: ${histUrl}`,
  )
  console.log('✓ history ISO 8601 offset encoded as %2B07%3A00')

  // 5. Latest sensor data
  const latest = await getLatestSensorData('SIAGA-001')
  assert.equal(latest.data.status, 'WARNING')
  assert.equal(typeof latest.data.temperature, 'number')
  assert.equal(typeof latest.data.motion, 'boolean')
  console.log('✓ getLatestSensorData() types (number/boolean)')

  // 6. POST sensor-data
  const created = await createSensorData('SIAGA-001', {
    recorded_at: '2026-07-31T09:15:00Z',
    temperature: 29.5,
    humidity: 68.2,
    motion: true,
    light: 120.0,
    obstacle: false,
    status: 'WARNING',
  })
  assert.equal(created.data.status, 'WARNING')
  assert.ok(created.data.id === 10452)
  console.log('✓ createSensorData() POST')

  // 7. Alerts + pagination helpers
  const alerts = await getAlerts({ deviceId: 'SIAGA-001', page: 1 })
  assert.equal(alerts.data.length, 1)
  assert.equal(getTotalPages(alerts.meta), 1)
  assert.equal(getTotalPages({ total: 240, per_page: 50, current_page: 1 }), 5)
  assert.equal(getTotalPages(null), 0)
  assert.ok(hasNextPage({ total: 240, per_page: 50, current_page: 4 }))
  assert.ok(!hasPreviousPage({ total: 240, per_page: 50, current_page: 1 }))
  console.log('✓ pagination helpers (getTotalPages/hasNextPage/hasPreviousPage)')

  // 8. Alert detail — nested sensor_data
  const alertDetail = await getAlert(512)
  assert.ok(alertDetail.data.sensor_data)
  assert.equal(alertDetail.data.sensor_data.temperature, 29.5)
  console.log('✓ getAlert() detail with nested sensor_data')

  // 9. Error 404 → ApiError + isNotFoundError
  try {
    await getDevice('SIAGA-404')
    assert.fail('should reject 404')
  } catch (e) {
    assert.ok(e instanceof ApiError)
    assert.equal(e.status, 404)
    assert.equal(e.code, 'NOT_FOUND')
    assert.ok(isNotFoundError(e))
  }
  console.log('✓ 404 normalized to ApiError (isNotFoundError)')

  // 10. Error 422 → details preserved
  try {
    await getDevice('SIAGA-422')
    assert.fail('should reject 422')
  } catch (e) {
    assert.ok(e instanceof ApiError)
    assert.equal(e.status, 422)
    assert.equal(e.code, 'VALIDATION_ERROR')
    assert.ok(Array.isArray(e.details.status))
  }
  console.log('✓ 422 normalized with validation details')

  // 11. Network error → distinguishable
  apiClient.defaults.adapter = async () => {
    throw Object.assign(new Error('Network Error'), { config: undefined })
  }
  try {
    await getSystemStatus()
    assert.fail('should reject network error')
  } catch (e) {
    assert.ok(e instanceof ApiError)
    assert.equal(e.isNetworkError, true)
    assert.equal(e.status, undefined)
  }
  console.log('✓ network error distinguishable from HTTP error')

  console.log('\nSMOKE PASSED — all data layer checks OK')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nSMOKE FAILED')
    console.error(err)
    process.exit(1)
  })
