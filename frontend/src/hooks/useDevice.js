import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getDevice } from '@/services/devices'

/**
 * Server State — detail satu device berdasarkan business key.
 * Request hanya berjalan ketika `deviceId` terisi.
 *
 * @param {string|null|undefined} deviceId Business key perangkat
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (0 = sekali)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useDevice(deviceId, { pollInterval = 0, enabled = true } = {}) {
  const isEnabled = enabled && Boolean(deviceId)

  const fetcher = useCallback(() => getDevice(deviceId), [deviceId])

  return useApiResource(fetcher, { pollInterval, enabled: isEnabled })
}
