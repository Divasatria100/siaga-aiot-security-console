import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getSensorDataHistory } from '@/services/sensorData'
import { DEFAULT_PER_PAGE } from '@/config/env'

/**
 * Server State — riwayat sensor dalam rentang waktu (paginated).
 * Request hanya berjalan ketika deviceId + startDate + endDate terisi.
 *
 * @param {object} [params]
 * @param {string|null|undefined} params.deviceId Business key perangkat
 * @param {string|null|undefined} params.startDate Awal rentang (ISO 8601)
 * @param {string|null|undefined} params.endDate Akhir rentang (ISO 8601)
 * @param {number} [params.page] Nomor halaman
 * @param {number} [params.perPage] Jumlah record per halaman
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (0 = sekali)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useSensorDataHistory(
  {
    deviceId,
    startDate,
    endDate,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = {},
  { pollInterval = 0, enabled = true } = {}
) {
  const isEnabled = enabled && Boolean(deviceId && startDate && endDate)

  const fetcher = useCallback(
    () => getSensorDataHistory({ deviceId, startDate, endDate, page, perPage }),
    [deviceId, startDate, endDate, page, perPage]
  )

  return useApiResource(fetcher, { pollInterval, enabled: isEnabled })
}
