import apiClient from '@/lib/axios'

/**
 * @typedef {import('@/types').SystemStatus} SystemStatus
 * @typedef {import('@/types').ApiSuccessEnvelope} ApiSuccessEnvelope
 */

/**
 * GET /api/v1/system/status — ringkasan kondisi sistem untuk Dashboard.
 *
 * @returns {Promise<ApiSuccessEnvelope<SystemStatus>>}
 */
export async function getSystemStatus() {
  return apiClient.get('/system/status')
}
