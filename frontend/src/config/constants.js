/**
 * Konstanta domain SIAGA yang selaras dengan API Specification.
 * Nilai status mengikuti Check Constraint pada DDD dan validasi backend.
 */

/** Status sistem hasil Rule-Based Decision Engine & FSM. */
export const SYSTEM_STATUS = {
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
}

/** Status konektivitas device. */
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
}

/** Status alert (subset dari SYSTEM_STATUS). */
export const ALERT_STATUS = {
  WARNING: 'WARNING',
  DANGER: 'DANGER',
}

/** Label status sistem untuk keperluan display. */
export const SYSTEM_STATUS_LABEL = {
  [SYSTEM_STATUS.NORMAL]: 'Normal',
  [SYSTEM_STATUS.WARNING]: 'Warning',
  [SYSTEM_STATUS.DANGER]: 'Danger',
}

/** Label status konektivitas untuk keperluan display. */
export const DEVICE_STATUS_LABEL = {
  [DEVICE_STATUS.ONLINE]: 'Online',
  [DEVICE_STATUS.OFFLINE]: 'Offline',
}

/** Satuan setiap metrik sensor (digunakan oleh SensorCard / formatting). */
export const SENSOR_UNITS = {
  temperature: '°C',
  humidity: '%',
  light: 'lux',
  motion: '',
  obstacle: '',
}

/** Label sensor untuk keperluan display. */
export const SENSOR_LABELS = {
  temperature: 'Suhu',
  humidity: 'Kelembapan',
  light: 'Cahaya',
  motion: 'Gerakan',
  obstacle: 'Obstacle',
}
