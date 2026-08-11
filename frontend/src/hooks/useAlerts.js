import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getAlerts } from '@/services/alerts'
import { DEFAULT_PER_PAGE } from '@/config/env'

/**
 * Server State — daftar alert dengan filter opsional (paginated).
 *
 * @param {object} [params]
 * @param {string|null|undefined} [params.deviceId] Filter perangkat
 * @param {'WARNING'|'DANGER'} [params.status] Filter status alert
 * @param {string|null|undefined} [params.startDate] Awal rentang (ISO 8601)
 * @param {string|null|undefined} [params.endDate] Akhir rentang (ISO 8601)
 * @param {number} [params.page] Nomor halaman
 * @param {number} [params.perPage] Jumlah record per halaman
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (0 = sekali)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useAlerts(
  {
    deviceId,
    status,
    startDate,
    endDate,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = {},
  { pollInterval = 0, enabled = true } = {}
) {
  const fetcher = useCallback(
    () =>
      getAlerts({ deviceId, status, startDate, endDate, page, perPage }),
    [deviceId, status, startDate, endDate, page, perPage]
  )

  return useApiResource(fetcher, { pollInterval, enabled })
}
