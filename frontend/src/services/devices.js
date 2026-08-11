import apiClient from '@/lib/axios'
import { DEVICES_PER_PAGE } from '@/config/env'

/**
 * @typedef {import('@/types').Device} Device
 * @typedef {import('@/types').ApiSuccessResponse} ApiSuccessResponse
 */

/**
 * GET /api/v1/devices — daftar device (paginated) dengan filter status opsional.
 *
 * @param {object} [params]
 * @param {'online'|'offline'} [params.status] Filter status konektivitas
 * @param {number} [params.page] Nomor halaman
 * @param {number} [params.perPage] Jumlah record per halaman
 * @returns {Promise<ApiSuccessResponse<Device[]>>}
 */
export async function getDevices({
  status,
  page = 1,
  perPage = DEVICES_PER_PAGE,
} = {}) {
  return apiClient.get('/devices', {
    params: { status, page, per_page: perPage },
  })
}

/**
 * GET /api/v1/devices/{device_id} — detail satu device.
 *
 * @param {string} deviceId Business key perangkat
 * @returns {Promise<ApiSuccessResponse<Device>>}
 */
export async function getDevice(deviceId) {
  return apiClient.get(`/devices/${encodeURIComponent(deviceId)}`)
}
