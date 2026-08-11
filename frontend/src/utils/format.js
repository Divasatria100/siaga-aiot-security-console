/**
 * Utilitas pemformatan data untuk keperluan display.
 * Seluruh timestamp dari backend berformat ISO 8601 Zulu.
 */

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const numberFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 1,
})

/**
 * Parsing timestamp ISO 8601 menjadi Date. Mengembalikan null bila invalid.
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {Date|null}
 */
export function parseDate(value) {
  if (value === null || value === undefined || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Format timestamp menjadi "31 Jul 2026, 09:15".
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export function formatDateTime(value) {
  const date = parseDate(value)
  return date ? dateTimeFormatter.format(date) : '—'
}

/**
 * Format timestamp menjadi "31 Jul 2026".
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  const date = parseDate(value)
  return date ? dateFormatter.format(date) : '—'
}

/**
 * Format timestamp menjadi "09:15".
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export function formatTime(value) {
  const date = parseDate(value)
  return date ? timeFormatter.format(date) : '—'
}

/**
 * Format jarak waktu relatif terhadap sekarang, mis. "2 mnt lalu".
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export function formatRelativeTime(value) {
  const date = parseDate(value)
  if (!date) return '—'

  const diffMs = Date.now() - date.getTime()
  const abs = Math.abs(diffMs)
  const minuteMs = 60_000
  const hourMs = 3_600_000
  const dayMs = 86_400_000

  if (abs < minuteMs) return 'baru saja'
  if (abs < hourMs) {
    const minutes = Math.floor(abs / minuteMs)
    return diffMs >= 0 ? `${minutes} mnt lalu` : `dalam ${minutes} mnt`
  }
  if (abs < dayMs) {
    const hours = Math.floor(abs / hourMs)
    return diffMs >= 0 ? `${hours} jam lalu` : `dalam ${hours} jam`
  }
  const days = Math.floor(abs / dayMs)
  return diffMs >= 0 ? `${days} hari lalu` : `dalam ${days} hari`
}

/**
 * Format angka dengan pemisah ribuan dan 1 desimal, mis. "1.250,5".
 *
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? numberFormatter.format(number) : '—'
}

/**
 * Format nilai sensor dengan satuan, mis. "29,5 °C".
 *
 * @param {number|string|null|undefined} value
 * @param {string} [unit] Satuan sensor (SENSOR_UNITS)
 * @param {number} [digits] Jumlah desimal
 * @returns {string}
 */
export function formatSensorValue(value, unit = '', digits = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  const formatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
  return unit ? `${formatter.format(number)} ${unit}` : formatter.format(number)
}

/**
 * Konversi Date/string menjadi ISO 8601 Zulu untuk query start_date/end_date.
 *
 * @param {Date|string} value
 * @returns {string}
 */
export function toIsoString(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

/**
 * Konversi nilai tanggal (input date) menjadi ISO 8601 Zulu,
 * dengan waktu awal hari (00:00:00) untuk start_date.
 *
 * @param {string} yyyyMmDd Nilai dari <input type="date">
 * @returns {string}
 */
export function dateToStartIso(yyyyMmDd) {
  if (!yyyyMmDd) return ''
  return new Date(`${yyyyMmDd}T00:00:00.000Z`).toISOString()
}

/**
 * Konversi nilai tanggal (input date) menjadi ISO 8601 Zulu,
 * dengan waktu akhir hari (23:59:59) untuk end_date.
 *
 * @param {string} yyyyMmDd Nilai dari <input type="date">
 * @returns {string}
 */
export function dateToEndIso(yyyyMmDd) {
  if (!yyyyMmDd) return ''
  return new Date(`${yyyyMmDd}T23:59:59.999Z`).toISOString()
}
