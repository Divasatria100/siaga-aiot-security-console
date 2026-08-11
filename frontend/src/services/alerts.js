import apiClient from '@/lib/axios'
import { DEFAULT_PER_PAGE } from '@/config/env'

/**
 * @typedef {import('@/types').Alert} Alert
 * @typedef {import('@/types').ApiSuccessResponse} ApiSuccessResponse
 */

/**
 * GET /api/v1/alerts — daftar alert dengan filter opsional (paginated).
 *
 * @param {object} [params]
 * @param {string} [params.deviceId] Filter perangkat
 * @param {'WARNING'|'DANGER'} [params.status] Filter status alert
 * @param {string} [params.startDate] Awal rentang (ISO 8601)
 * @param {string} [params.endDate] Akhir rentang (ISO 8601)
 * @param {number} [params.page] Nomor halaman
 * @param {number} [params.perPage] Jumlah record per halaman
 * @returns {Promise<ApiSuccessResponse<Alert[]>>}
 */
export async function getAlerts({
  deviceId,
  status,
  startDate,
  endDate,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
} = {}) {
  return apiClient.get('/alerts', {
    params: {
      device_id: deviceId,
      status,
      start_date: startDate,
      end_date: endDate,
      page,
      per_page: perPage,
    },
  })
}

/**
 * GET /api/v1/alerts/{id} — detail satu alert beserta sensor pemicunya.
 *
 * @param {number} id Primary key alert
 * @returns {Promise<ApiSuccessResponse<Alert>>}
 */
export async function getAlert(id) {
  return apiClient.get(`/alerts/${id}`)
}
