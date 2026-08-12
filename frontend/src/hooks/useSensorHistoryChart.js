import { useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { getSensorDataHistory } from '@/services/sensorData'
import {
  HISTORY_CHART_MAX_RECORDS,
  HISTORY_CHART_PER_PAGE,
} from '@/config/env'

/**
 * Server State — dataset chart Historical Data untuk SELURUH rentang yang
 * dipilih (independen dari halaman tabel aktif).
 *
 * Endpoint GET /api/v1/sensor-data/history bersifat paginated dan backend
 * membatasi `per_page` maksimal 100, sehingga dataset chart dimuat lewat
 * beberapa halaman hingga total record tercapai. Bila jumlah record melebihi
 * batas `maxRecords` (rentang sangat besar), fetch dihentikan dan data
 * `truncated` diset — pemanggil menampilkan catatan non-blocking bahwa tren
 * didasarkan pada sampel data. Downsampling untuk render dilakukan oleh
 * pemanggil (downsampleRecords).
 *
 * Hook ini berdiri terpisah dari query tabel ber-pagination: query chart
 * tidak menerima halaman, sehingga berganti page tabel tidak mengubah chart.
 * Kegagalan query ini tidak memblokir halaman (table tetap tampil).
 *
 * @param {object} [params]
 * @param {string} [params.deviceId] Business key perangkat
 * @param {string} [params.startDate] Awal rentang (ISO 8601)
 * @param {string} [params.endDate] Akhir rentang (ISO 8601)
 * @param {number} [params.maxRecords] Batas maksimum record yang diambil
 * @param {number} [params.perPage] per_page per request (backend cap 100)
 * @param {object} [options]
 * @param {boolean} [options.enabled]
 * @returns {{
 *   data: { records: import('@/types').SensorData[], total: number, truncated: boolean } | null,
 *   loading: boolean,
 *   error: import('@/lib/axios').ApiError | null,
 *   lastUpdated: number | null,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useSensorHistoryChart(
  {
    deviceId,
    startDate,
    endDate,
    maxRecords = HISTORY_CHART_MAX_RECORDS,
    perPage = HISTORY_CHART_PER_PAGE,
  } = {},
  { enabled = true } = {}
) {
  const isEnabled = enabled && Boolean(deviceId && startDate && endDate)

  const fetcher = useCallback(async () => {
    let records = []
    let page = 1
    let total = 0
    let truncated = false

    for (;;) {
      const envelope = await getSensorDataHistory({
        deviceId,
        startDate,
        endDate,
        page,
        perPage,
      })
      const pageRecords = envelope?.data ?? []
      records = records.concat(pageRecords)
      total = envelope?.meta?.total ?? records.length

      const reachedTotal = records.length >= total
      const reachedCap = records.length >= maxRecords
      if (pageRecords.length === 0 || reachedTotal || reachedCap) {
        truncated = !reachedTotal && (reachedCap || pageRecords.length === 0)
        break
      }
      page += 1
    }

    return { records, total, truncated }
  }, [deviceId, startDate, endDate, maxRecords, perPage])

  return usePolling(fetcher, { interval: 0, enabled: isEnabled })
}