import { usePolling } from '@/hooks/usePolling'

/**
 * Base hook Server State untuk resource API SIAGA.
 *
 * Membungkus `usePolling` dan menormalkan envelope respons
 * ({ success, data, meta, message }) menjadi bentuk yang langsung
 * dipakai halaman:
 *   { data, meta, message, loading, error, lastUpdated, refetch }
 *
 * @param {() => Promise<{ data: unknown, meta?: object, message?: string }>} fetchFn Dimemo
 * @param {object} [options]
 * @param {number} [options.pollInterval] Interval polling ms (0 = sekali)
 * @param {boolean} [options.enabled] Matikan pengambilan data
 * @returns {{
 *   data: unknown,
 *   meta: import('@/types').PaginationMeta | null,
 *   message: string | null,
 *   loading: boolean,
 *   error: import('@/lib/axios').ApiError | null,
 *   lastUpdated: number | null,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useApiResource(
  fetchFn,
  { pollInterval = 0, enabled = true } = {}
) {
  const {
    data: envelope,
    loading,
    error,
    lastUpdated,
    refetch,
  } = usePolling(fetchFn, { interval: pollInterval, enabled })

  return {
    data: envelope?.data ?? null,
    meta: envelope?.meta ?? null,
    message: envelope?.message ?? null,
    loading,
    error,
    lastUpdated,
    refetch,
  }
}
