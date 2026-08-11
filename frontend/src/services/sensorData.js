import apiClient from '@/lib/axios'
import { DEFAULT_PER_PAGE } from '@/config/env'

/**
 * @typedef {import('@/types').SensorData} SensorData
 * @typedef {import('@/types').ApiSuccessEnvelope} ApiSuccessEnvelope
 */

/**
 * GET /api/v1/sensor-data/latest — data sensor terkini satu device.
 * 404 (belum ada record) dilaporkan sebagai ApiError.status === 404.
 *
 * @param {string} deviceId Business key perangkat
 * @returns {Promise<ApiSuccessEnvelope<SensorData>>}
 */
export async function getLatestSensorData(deviceId) {
  return apiClient.get('/sensor-data/latest', {
    params: { device_id: deviceId },
  })
}

/**
 * GET /api/v1/sensor-data/history — riwayat sensor dalam rentang waktu.
 *
 * @param {object} params
 * @param {string} params.deviceId Business key perangkat
 * @param {string} params.startDate Awal rentang (ISO 8601)
 * @param {string} params.endDate Akhir rentang (ISO 8601)
 * @param {number} [params.page] Nomor halaman
 * @param {number} [params.perPage] Jumlah record per halaman
 * @returns {Promise<ApiSuccessEnvelope<SensorData[]>>}
 */
export async function getSensorDataHistory({
  deviceId,
  startDate,
  endDate,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
}) {
  return apiClient.get('/sensor-data/history', {
    params: {
      device_id: deviceId,
      start_date: startDate,
      end_date: endDate,
      page,
      per_page: perPage,
    },
  })
}
