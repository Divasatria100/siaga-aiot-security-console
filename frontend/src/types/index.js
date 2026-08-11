/**
 * Struktur data domain SIAGA yang selaras dengan Response Standard
 * API Specification Bab 9 dan struktur Response pada Bab 6.
 * Didefinisikan sebagai JSDoc typedef agar tetap berlaku di kode JavaScript.
 */

/**
 * @typedef {object} Device
 * @property {string} device_id Business key unik perangkat
 * @property {string} name Nama perangkat
 * @property {'online'|'offline'} status Status konektivitas
 * @property {string|null} last_seen_at Timestamp ISO 8601 Zulu
 * @property {string} created_at Timestamp ISO 8601 Zulu
 * @property {string} updated_at Timestamp ISO 8601 Zulu
 */

/**
 * @typedef {object} SensorData
 * @property {number} id Primary key record
 * @property {string} device_id Business key perangkat
 * @property {string} recorded_at Timestamp ISO 8601 Zulu
 * @property {number} temperature Nilai suhu
 * @property {number} humidity Nilai kelembapan
 * @property {boolean} motion Status gerakan
 * @property {number} light Intensitas cahaya
 * @property {boolean} obstacle Status obstacle
 * @property {'NORMAL'|'WARNING'|'DANGER'} status Status sistem
 * @property {string} created_at Timestamp ISO 8601 Zulu
 */

/**
 * @typedef {object} Alert
 * @property {number} id Primary key alert
 * @property {string} device_id Business key perangkat
 * @property {number} sensor_data_id Referensi record sensor_data pemicu
 * @property {'WARNING'|'DANGER'} status Status alert
 * @property {string} triggered_at Timestamp ISO 8601 Zulu
 * @property {string|null} [created_at] Timestamp ISO 8601 Zulu (detail)
 * @property {{ temperature: number, humidity: number, motion: boolean, light: number, obstacle: boolean }} [sensor_data] Data sensor pemicu (detail)
 */

/**
 * @typedef {object} SystemDeviceStatus
 * @property {string} device_id Business key perangkat
 * @property {'online'|'offline'} status Status konektivitas
 * @property {'NORMAL'|'WARNING'|'DANGER'|null} latest_status Status sistem terkini
 * @property {string|null} last_seen_at Timestamp ISO 8601 Zulu
 */

/**
 * @typedef {object} SystemStatus
 * @property {number} total_devices Jumlah seluruh device
 * @property {number} online_devices Jumlah device online
 * @property {number} offline_devices Jumlah device offline
 * @property {SystemDeviceStatus[]} devices Rincian status tiap device
 */

/**
 * @typedef {object} PaginationMeta
 * @property {number} current_page Halaman aktif
 * @property {number} per_page Jumlah record per halaman
 * @property {number} total Jumlah total record
 */

/**
 * Payload POST /api/v1/devices/{device_id}/sensor-data (API Spec §6.2.1).
 */
/**
 * @typedef {object} SensorDataInput
 * @property {string} recorded_at Timestamp ISO 8601
 * @property {number} temperature Nilai suhu
 * @property {number} humidity Nilai kelembapan
 * @property {boolean} motion Status gerakan
 * @property {number} light Intensitas cahaya
 * @property {boolean} obstacle Status obstacle
 * @property {'NORMAL'|'WARNING'|'DANGER'} status Status sistem
 */

/**
 * Envelope respons berhasil sesuai API Specification Bab 9.1.
 * @template T
 * @typedef {object} ApiSuccessResponse
 * @property {true} success
 * @property {T} data
 * @property {PaginationMeta} [meta]
 * @property {string} [message]
 */

/**
 * Envelope respons gagal sesuai API Specification Bab 9.2.
 * @typedef {object} ApiErrorResponse
 * @property {false} success
 * @property {{ code: string, message: string, details: object }} error
 */

export {}
