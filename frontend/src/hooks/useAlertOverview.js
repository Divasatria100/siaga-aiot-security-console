import { useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { getAlerts } from '@/services/alerts'
import { countAlertsByStatus } from '@/utils/alerts'
import {
  ALERT_OVERVIEW_MAX_RECORDS,
  ALERT_OVERVIEW_PER_PAGE,
} from '@/config/env'

/**
 * Server State — dataset agregat alert untuk SELURUH filter aktif
 * (independen dari halaman tabel aktif).
 *
 * Endpoint GET /api/v1/alerts bersifat paginated dan backend membatasi
 * `per_page` maksimal 100, sehingga dataset agregat dimuat lewat beberapa
 * halaman hingga total record tercapai. Bila jumlah record melebihi batas
 * `maxRecords` (rentang sangat besar), fetch dihentikan dan data `truncated`
 * diset — pemanggil menampilkan catatan non-blocking bahwa agregat didasarkan
 * pada sampel data terbaru.
 *
 * Hook ini berdiri terpisah dari query tabel ber-pagination: query agregat
 * tidak menerima halaman, sehingga berganti page tabel tidak mengubah chart.
 * Kegagalan query ini tidak memblokir halaman (table tetap tampil).
 *
 * @param {object} [params]
 * @param {string} [params.deviceId] Filter perangkat
 * @param {'WARNING'|'DANGER'} [params.status] Filter status alert
 * @param {string} [params.startDate] Awal rentang (ISO 8601)
 * @param {string} [params.endDate] Akhir rentang (ISO 8601)
 * @param {number} [params.maxRecords] Batas maksimum record yang diambil
 * @param {number} [params.perPage] per_page per request (backend cap 100)
 * @param {object} [options]
 * @param {boolean} [options.enabled]
 * @returns {{
 *   data: { counts: { WARNING: number, DANGER: number }, total: number, truncated: boolean } | null,
 *   loading: boolean,
 *   error: import('@/lib/axios').ApiError | null,
 *   lastUpdated: number | null,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useAlertOverview(
  {
    deviceId,
    status,
    startDate,
    endDate,
    maxRecords = ALERT_OVERVIEW_MAX_RECORDS,
    perPage = ALERT_OVERVIEW_PER_PAGE,
  } = {},
  { enabled = true } = {}
) {
  const fetcher = useCallback(async () => {
    let records = []
    let page = 1
    let total
    let truncated

    for (;;) {
      const envelope = await getAlerts({
        deviceId,
        status,
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

    return { counts: countAlertsByStatus(records), total, truncated }
  }, [deviceId, status, startDate, endDate, maxRecords, perPage])

  return usePolling(fetcher, { interval: 0, enabled })
}
