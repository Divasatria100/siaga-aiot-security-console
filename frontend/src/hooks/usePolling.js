import { useCallback, useEffect, useRef, useState } from 'react'
import { POLLING_INTERVAL } from '@/config/env'

/**
 * Hook pengambilan data (Server State) yang mendukung polling berkala.
 *
 * - interval > 0 : fetch awal saat mount, lalu refetch tiap interval.
 * - interval <= 0: fetch sekali saat mount (untuk halaman statis/historis).
 * - Request yang masih berjalan akan dilewati pada tick berikutnya
 *   untuk mencegah tumpang tindih (overlapping request).
 *
 * @param {() => Promise<unknown>} fetchFn Fungsi pengambilan data
 * @param {object} [options]
 * @param {number} [options.interval] Interval polling dalam ms
 * @param {boolean} [options.enabled] Matikan pengambilan data
 * @returns {{
 *   data: unknown,
 *   loading: boolean,
 *   error: import('@/lib/axios').ApiError | null,
 *   lastUpdated: number | null,
 *   refetch: () => Promise<void>,
 * }}
 */
export function usePolling(
  fetchFn,
  { interval = POLLING_INTERVAL, enabled = true } = {}
) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchRef = useRef(fetchFn)
  const busyRef = useRef(false)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    fetchRef.current = fetchFn
    enabledRef.current = enabled
  }, [fetchFn, enabled])

  const load = useCallback(async ({ silent = false } = {}) => {
    if (busyRef.current) return
    busyRef.current = true

    if (!silent) {
      setLoading(true)
      setError(null)
    }

    try {
      const result = await fetchRef.current()
      setData(result)
      setError(null)
      setLastUpdated(Date.now())
    } catch (caught) {
      setError(caught)
    } finally {
      setLoading(false)
      busyRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabledRef.current) return undefined

    load()

    if (interval > 0) {
      const timer = setInterval(() => load({ silent: true }), interval)
      return () => clearInterval(timer)
    }

    return undefined
  }, [load, interval])

  return { data, loading, error, lastUpdated, refetch: load }
}
