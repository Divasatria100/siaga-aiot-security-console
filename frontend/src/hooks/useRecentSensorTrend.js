import { useCallback } from 'react'
import { useApiResource } from '@/hooks/useApiResource'
import { getSensorDataHistory } from '@/services/sensorData'
import { TREND_LIMIT, TREND_WINDOW_MS } from '@/config/env'

/**
 * Server State — data tren singkat untuk sparkline Monitoring.
 * Mengambil N record sensor terakhir (rentang pendek dari endpoint history
 * yang sudah ada, tanpa endpoint baru), sekali per pemilihan device —
 * bukan polling, karena sparkline hanya konteks arah singkat.
 *
 * Kegagalan/kosongnya data tidak boleh memblokir halaman: pemanggil cukup
 * menyembunyikan sparkline (graceful degradation).
 *
 * @param {string|null|undefined} deviceId Business key perangkat
 * @param {object} [options]
 * @param {number} [options.windowMs] Rentang waktu ke belakang (ms)
 * @param {number} [options.limit] Maksimum record yang diambil
 * @param {boolean} [options.enabled]
 * @returns {import('@/hooks/useApiResource').ReturnType} useApiResource result
 */
export function useRecentSensorTrend(
  deviceId,
  { windowMs = TREND_WINDOW_MS, limit = TREND_LIMIT, enabled = true } = {}
) {
  const isEnabled = enabled && Boolean(deviceId)

  const fetcher = useCallback(() => {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - windowMs).toISOString()
    return getSensorDataHistory({
      deviceId,
      startDate,
      endDate,
      page: 1,
      perPage: limit,
    })
  }, [deviceId, windowMs, limit])

  return useApiResource(fetcher, { pollInterval: 0, enabled: isEnabled })
}