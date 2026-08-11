import { useCallback, useEffect, useRef, useState } from 'react'
import { POLLING_INTERVAL } from '@/config/env'

/**
 * Hook pengambilan data (Server State) yang mendukung polling berkala.
 *
 * - interval > 0 : fetch awal saat mount, lalu refetch tiap interval.
 * - interval <= 0: fetch sekali saat mount (untuk halaman statis/historis).
 * - Request yang masih berjalan dilewati pada tick berikutnya untuk
 *   mencegah tumpang tindih (overlapping request).
 * - Ketika `fetchFn` berubah (mis. parameter berubah) SELAGI request
 *   masih berjalan, request baru TIDAK di-drop: setelah request aktif
 *   selesai, fetch terbaru dieksekusi ulang. Response request lama
 *   dibuang agar tidak menimpa state untuk parameter terbaru.
 *   `fetchFn` HARUS dimemo dengan `useCallback` oleh pemanggil.
 * - `loading` bersifat derived (enabled && belum ada data && tidak error),
 *   sehingga tidak ada synchronous setState di dalam effect.
 *
 * @param {() => Promise<unknown>} fetchFn Fungsi pengambilan data (dimemo)
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
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Menandai ada request yang sedang berjalan (anti-overlap).
  const busyRef = useRef(false)
  // Menandai bahwa konteks/parameter berubah selagi request berjalan;
  // setelah request aktif selesai, fetch terbaru dieksekusi ulang.
  const pendingRef = useRef(false)
  // fetchFn dari request yang sedang berjalan.
  const inflightFetchFnRef = useRef(null)
  // fetchFn paling baru yang diinginkan pemanggil.
  const intentFetchFnRef = useRef(null)
  // load terbaru agar re-run setelah pending memakai fetchFn/param terkini.
  const loadRef = useRef(null)
  // Status enabled terkini agar re-run tidak terjadi saat hook dimatikan.
  const enabledRef = useRef(enabled)

  const load = useCallback(async ({ silent = false } = {}) => {
    intentFetchFnRef.current = fetchFn

    if (busyRef.current) {
      // Konteks berubah selagi request berjalan → jangan drop, tandai
      // untuk dieksekusi ulang setelah request aktif selesai.
      if (fetchFn !== inflightFetchFnRef.current) {
        pendingRef.current = true
      } else {
        // Kembali ke konteks yang sedang berjalan → tidak perlu re-run.
        pendingRef.current = false
      }
      return
    }

    busyRef.current = true
    inflightFetchFnRef.current = fetchFn

    if (!silent) {
      // Menunda update state hingga melampaui scope sinkron effect
      // (canonical async effect pattern).
      await Promise.resolve()
      setData(null)
      setError(null)
    }

    try {
      const result = await fetchFn()
      // Response dari konteks yang sudah digantikan dibuang agar tidak
      // menimpa state untuk parameter terbaru.
      if (fetchFn === intentFetchFnRef.current) {
        setData(result)
        setError(null)
        setLastUpdated(Date.now())
      }
    } catch (caught) {
      if (fetchFn === intentFetchFnRef.current) {
        setError(caught)
      }
    } finally {
      busyRef.current = false
      inflightFetchFnRef.current = null

      const shouldRerun = pendingRef.current && enabledRef.current
      pendingRef.current = false
      if (shouldRerun) {
        loadRef.current?.({ silent: false })
      }
    }
  }, [fetchFn])

  // Sinkronkan ref "latest" setelah render (aturan react-hooks/refs
  // melarang penulisan ref saat render). Dideklarasikan sebelum efek fetch
  // agar pending re-run selalu memakai load/enabled terkini.
  useEffect(() => {
    loadRef.current = load
    enabledRef.current = enabled
  })

  useEffect(() => {
    if (!enabled) return undefined

    // Panggil melalui async runner agar tidak ada setState sinkron
    // di dalam scope sinkron effect (canonical async effect pattern).
    const run = async () => {
      await load()
    }
    run()

    if (interval > 0) {
      const timer = setInterval(() => load({ silent: true }), interval)
      return () => clearInterval(timer)
    }

    return undefined
  }, [load, interval, enabled])

  // loading = pengambilan awal/penggantian data yang masih berlangsung.
  const loading = enabled && data === null && error === null

  return { data, loading, error, lastUpdated, refetch: load }
}
