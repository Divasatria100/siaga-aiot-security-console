import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getSystemStatus } from '@/services/systemStatus'
import { POLLING_INTERVAL } from '@/config/env'

/**
 * Server State — ringkasan kondisi sistem (Dashboard).
 * Bersifat live, polling aktif secara default
 * (bisa dimatikan dengan pollInterval: 0).
 *
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (default POLLING_INTERVAL)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useSystemStatus({
  pollInterval = POLLING_INTERVAL,
  enabled = true,
} = {}) {
  const fetcher = useCallback(() => getSystemStatus(), [])
  return useApiResource(fetcher, { pollInterval, enabled })
}
