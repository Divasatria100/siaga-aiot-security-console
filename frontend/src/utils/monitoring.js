/**
 * Util logika UI halaman Monitoring (page-specific).
 * Tidak ada side-effect — murni fungsi murni yang dapat diverifikasi statis.
 */

/**
 * Apakah perubahan activeSensor memerlukan auto-scroll ke SensorTrendDetail.
 * Scroll hanya saat memilih sensor baru (null → sensor) atau mengganti
 * sensor (sensor A → sensor B); TIDAK saat menutup (sensor → null) atau
 * tidak ada perubahan (null → null).
 *
 * @param {'temperature'|'humidity'|'light'|null} prevSensor
 * @param {'temperature'|'humidity'|'light'|null} nextSensor
 * @returns {boolean}
 */
export function shouldScrollToDetail(prevSensor, nextSensor) {
  return Boolean(nextSensor) && prevSensor !== nextSensor
}
