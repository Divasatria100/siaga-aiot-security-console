/**
 * @typedef {import('@/types').PaginationMeta} PaginationMeta
 */

/**
 * Total halaman dihitung deterministik dari meta pagination.
 * Backend hanya mengirim current_page/per_page/total
 * (tidak ada total_pages/next_page/previous_page).
 *
 * @param {PaginationMeta|null|undefined} meta
 * @returns {number} Total halaman (0 bila tidak dapat dihitung)
 */
export function getTotalPages(meta) {
  if (
    !meta ||
    !Number.isFinite(meta.total) ||
    !Number.isFinite(meta.per_page) ||
    meta.per_page <= 0
  ) {
    return 0
  }
  return Math.ceil(meta.total / meta.per_page)
}

/**
 * Indikasi apakah terdapat halaman berikutnya.
 *
 * @param {PaginationMeta|null|undefined} meta
 * @returns {boolean}
 */
export function hasNextPage(meta) {
  const totalPages = getTotalPages(meta)
  return totalPages > 0 && (meta?.current_page ?? 1) < totalPages
}

/**
 * Indikasi apakah terdapat halaman sebelumnya.
 *
 * @param {PaginationMeta|null|undefined} meta
 * @returns {boolean}
 */
export function hasPreviousPage(meta) {
  return (meta?.current_page ?? 1) > 1
}
