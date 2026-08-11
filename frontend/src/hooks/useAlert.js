import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getAlert } from '@/services/alerts'

/**
 * Server State — detail satu alert beserta sensor pemicunya.
 * Request hanya berjalan ketika `id` terisi.
 *
 * @param {number|null|undefined} id Primary key alert
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (0 = sekali)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useAlert(id, { pollInterval = 0, enabled = true } = {}) {
  const isEnabled = enabled && id != null

  const fetcher = useCallback(() => getAlert(id), [id])

  return useApiResource(fetcher, { pollInterval, enabled: isEnabled })
}
