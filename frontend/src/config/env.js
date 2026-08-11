/**
 * Centralized runtime configuration.
 * Semua nilai dapat dioverride melalui environment variable Vite (VITE_*).
 */

const asNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

// Aman diakses di luar Vite (mis. runtime Node untuk verifikasi data layer):
// `import.meta.env` tersedia di Vite, undefined di Node.
const env = import.meta.env ?? {}

/** Base path REST API backend (version prefix /api/v1). */
export const API_BASE_URL = env.VITE_API_BASE_URL ?? '/api/v1'

/** Timeout default request API (ms). */
export const API_TIMEOUT = asNumber(env.VITE_API_TIMEOUT, 10_000)

/** Interval polling data terkini (ms). */
export const POLLING_INTERVAL = asNumber(
  env.VITE_POLLING_INTERVAL,
  5_000
)

/** Default per_page untuk request yang menggunakan pagination. */
export const DEFAULT_PER_PAGE = asNumber(
  env.VITE_DEFAULT_PER_PAGE,
  50
)

/** Default per_page untuk daftar device. */
export const DEVICES_PER_PAGE = asNumber(
  env.VITE_DEVICES_PER_PAGE,
  50
)

/** Ambang waktu (ms) sejak last_seen_at untuk menandai device sebagai stale. */
export const STALE_THRESHOLD_MS = asNumber(
  env.VITE_STALE_THRESHOLD_MS,
  60_000
)
