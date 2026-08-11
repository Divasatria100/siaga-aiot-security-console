import apiClient from '@/lib/axios'

/**
 * @typedef {import('@/types').SystemStatus} SystemStatus
 * @typedef {import('@/types').ApiSuccessResponse} ApiSuccessResponse
 */

/**
 * GET /api/v1/system/status — ringkasan kondisi sistem untuk Dashboard.
 *
 * @returns {Promise<ApiSuccessResponse<SystemStatus>>}
 */
export async function getSystemStatus() {
  return apiClient.get('/system/status')
}
