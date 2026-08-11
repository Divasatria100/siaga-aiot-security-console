import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getDevices } from '@/services/devices'
import { DEVICES_PER_PAGE } from '@/config/env'

/**
 * Server State — daftar device (paginated), filter status opsional.
 *
 * @param {object} [params]
 * @param {'online'|'offline'} [params.status] Filter status konektivitas
 * @param {number} [params.page] Nomor halaman
 * @param {number} [params.perPage] Jumlah record per halaman
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (0 = sekali)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useDevices(
  { status, page = 1, perPage = DEVICES_PER_PAGE } = {},
  { pollInterval = 0, enabled = true } = {}
) {
  const fetcher = useCallback(
    () => getDevices({ status, page, perPage }),
    [status, page, perPage]
  )
  return useApiResource(fetcher, { pollInterval, enabled })
}
