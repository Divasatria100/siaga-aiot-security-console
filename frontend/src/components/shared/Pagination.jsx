import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  getTotalPages,
  hasNextPage,
  hasPreviousPage,
} from '@/utils/pagination'

/**
 * Daftar nomor halaman dengan ellipsis di kiri/kanan halaman aktif.
 *
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} siblingCount
 * @returns {(number|'ellipsis-left'|'ellipsis-right')[]}
 */
function getPageItems(currentPage, totalPages, siblingCount) {
  const totalNumbers = siblingCount * 2 + 3
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 2)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const items = [1]
  if (showLeftEllipsis) items.push('ellipsis-left')
  for (let page = leftSibling; page <= rightSibling; page += 1) items.push(page)
  if (showRightEllipsis) items.push('ellipsis-right')
  items.push(totalPages)
  return items
}

/**
 * Pagination — kontrol navigasi antar-halaman (FDD Bab 8 & 10) berbasis
 * meta pagination respons backend ({ current_page, per_page, total }).
 * Murni presentational; perubahan halaman diteruskan ke pemanggil.
 *
 * @param {object} props
 * @param {import('@/types').PaginationMeta} props.meta Meta pagination
 * @param {(page: number) => void} props.onPageChange Callback saat ganti halaman
 * @param {number} [props.siblingCount] Jumlah nomor halaman di samping halaman aktif
 * @param {string} [props.className]
 */
export function Pagination({ meta, onPageChange, siblingCount = 1, className }) {
  const totalPages = getTotalPages(meta)
  if (totalPages <= 0) return null

  const currentPage = meta?.current_page ?? 1
  const total = meta?.total ?? 0
  const perPage = meta?.per_page ?? 0
  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, total)
  const pageItems = getPageItems(currentPage, totalPages, siblingCount)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="font-mono text-xs text-muted-foreground">
        Menampilkan {start}–{end} dari {total} data · Hal. {currentPage} dari{' '}
        {totalPages}
      </p>
      <nav className="flex items-center gap-1" aria-label="Paginasi">
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman sebelumnya"
          disabled={!hasPreviousPage(meta)}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        {pageItems.map((item) =>
          item === 'ellipsis-left' || item === 'ellipsis-right' ? (
            <span
              key={item}
              className="px-1 font-mono text-xs text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === currentPage ? 'primary' : 'outline'}
              size="sm"
              className="min-w-8 px-2"
              aria-current={item === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          aria-label="Halaman berikutnya"
          disabled={!hasNextPage(meta)}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  )
}
