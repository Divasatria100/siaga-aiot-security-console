import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/config/env'

/**
 * Error API ternormalisasi sesuai Error Response Standard
 * (API Specification Bab 8 & 9.2).
 */
export class ApiError extends Error {
  /**
   * @param {object} params
   * @param {number|undefined} params.status HTTP status code (undefined bila network error)
   * @param {string} params.code Machine-readable error code dari backend
   * @param {string} params.message Pesan yang dapat ditampilkan
   * @param {object} params.details Field validation errors (untuk 422)
   * @param {boolean} params.isNetworkError Indikator kegagalan jaringan
   */
  constructor({ status, code, message, details, isNetworkError = false }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.isNetworkError = isNetworkError
  }
}

/**
 * Normalisasi error Axios menjadi ApiError agar seluruh halaman
 * menggunakan kontrak error yang konsisten.
 *
 * @param {unknown} error
 * @returns {ApiError}
 */
export function normalizeError(error) {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isCancel(error)) {
    return new ApiError({
      code: 'REQUEST_CANCELLED',
      message: 'Permintaan dibatalkan',
      isNetworkError: false,
    })
  }

  if (error.response) {
    const { data, status } = error.response
    return new ApiError({
      status,
      code: data?.error?.code ?? 'HTTP_ERROR',
      message:
        data?.error?.message ??
        (status === 404 ? 'Data tidak ditemukan' : 'Terjadi kesalahan pada server'),
      details: data?.error?.details ?? {},
    })
  }

  return new ApiError({
    code: 'NETWORK_ERROR',
    message: 'Gagal terhubung ke server. Periksa koneksi dan coba lagi.',
    isNetworkError: true,
  })
}

/**
 * Axios instance tunggal untuk seluruh komunikasi REST API SIAGA.
 * Base URL default /api/v1, dioverride melalui VITE_API_BASE_URL.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Response interceptor: expose payload envelope ({ success, data, meta })
// langsung ke pemanggil, dan normalisasi error menjadi ApiError.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normalizeError(error))
)

export default apiClient
