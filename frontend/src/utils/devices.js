import { SYSTEM_STATUS } from '@/config/constants'

const SEVERITY_RANK = {
  [SYSTEM_STATUS.DANGER]: 0,
  [SYSTEM_STATUS.WARNING]: 1,
}

/**
 * Urutkan device berdasarkan prioritas severity status sistem terkini:
 * DANGER → WARNING → lainnya (NORMAL / tanpa status). Mengembalikan array
 * baru (tidak mengubah array asli), dengan urutan stabil untuk rank yang
 * sama agar DOM order konsisten dengan visual order (Dashboard).
 *
 * @param {import('@/types').SystemDeviceStatus[]} [devices]
 * @returns {import('@/types').SystemDeviceStatus[]}
 */
export function sortDevicesBySeverity(devices = []) {
  return [...devices].sort((a, b) => {
    const rankA = SEVERITY_RANK[a.latest_status] ?? 2
    const rankB = SEVERITY_RANK[b.latest_status] ?? 2
    return rankA - rankB
  })
}

/**
 * Jumlah device yang perlu perhatian — status sistem terkini WARNING atau
 * DANGER. Dipakai sebagai metrik "Perlu Perhatian" pada Dashboard.
 *
 * @param {import('@/types').SystemDeviceStatus[]} [devices]
 * @returns {number}
 */
export function countAttentionDevices(devices = []) {
  return devices.reduce(
    (count, device) =>
      device.latest_status === SYSTEM_STATUS.WARNING ||
      device.latest_status === SYSTEM_STATUS.DANGER
        ? count + 1
        : count,
    0
  )
}
