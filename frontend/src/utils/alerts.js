import { ALERT_STATUS } from '@/config/constants'

const SEVERITY_RANK = {
  [ALERT_STATUS.DANGER]: 0,
  [ALERT_STATUS.WARNING]: 1,
}

/**
 * Urutkan alert berdasarkan prioritas severity: DANGER → WARNING → lainnya.
 * Secondary sort mempertahankan urutan waktu terbaru (triggered_at) di dalam
 * severity yang sama agar informasi kronologis tetap masuk akal. Mengembalikan
 * array baru (tidak mengubah array asli) dan stabil untuk rank yang sama.
 *
 * @param {import('@/types').Alert[]} [alerts]
 * @returns {import('@/types').Alert[]}
 */
export function sortAlertsBySeverity(alerts = []) {
  return [...alerts].sort((a, b) => {
    const rankA = SEVERITY_RANK[a.status] ?? 2
    const rankB = SEVERITY_RANK[b.status] ?? 2
    if (rankA !== rankB) return rankA - rankB
    return new Date(b.triggered_at) - new Date(a.triggered_at)
  })
}

/**
 * Hitung jumlah alert per status (WARNING / DANGER) dari dataset lengkap.
 * Digunakan oleh agregat alert agar tidak bergantung pada pagination tabel.
 *
 * @param {import('@/types').Alert[]} [alerts]
 * @returns {{ WARNING: number, DANGER: number }}
 */
export function countAlertsByStatus(alerts = []) {
  return alerts.reduce(
    (counts, alert) => {
      if (alert.status in counts) counts[alert.status] += 1
      return counts
    },
    { WARNING: 0, DANGER: 0 }
  )
}
