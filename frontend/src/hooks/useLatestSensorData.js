import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getLatestSensorData } from '@/services/sensorData'
import { POLLING_INTERVAL } from '@/config/env'

/**
 * Server State — data sensor & status sistem terkini satu device.
 * Data bersifat live, sehingga polling aktif secara default
 * (bisa dimatikan dengan pollInterval: 0).
 *
 * 404 (device belum punya record) diekspos via `error.status === 404`
 * agar halaman dapat menampilkan Empty State.
 *
 * @param {string|null|undefined} deviceId Business key perangkat
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (default POLLING_INTERVAL)
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useLatestSensorData(
  deviceId,
  { pollInterval = POLLING_INTERVAL, enabled = true } = {}
) {
  const isEnabled = enabled && Boolean(deviceId)

  const fetcher = useCallback(() => getLatestSensorData(deviceId), [deviceId])

  return useApiResource(fetcher, { pollInterval, enabled: isEnabled })
}
