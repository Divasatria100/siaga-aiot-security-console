import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

/** Jumlah baris skeleton saat loading (menggambarkan ukuran tabel). */
const SKELETON_ROWS = 5

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const alignClass = (align) => ALIGN_CLASS[align] ?? 'text-left'

/**
 * DataTable — tabel data generik (FDD Bab 8 & 11) dengan dukungan render
 * sel kustom, loading state (skeleton rows), dan empty state. Dipakai pada
 * Historical Data Page, Alerts Page, dan Devices Page. Murni presentational;
 * Pagination dikelola terpisah oleh komponen Pagination.
 *
 * @param {object} props
 * @param {Array<{
 *   key: string,
 *   header: import('react').ReactNode,
 *   className?: string,
 *   headerClassName?: string,
 *   align?: 'left'|'center'|'right',
 *   cell?: (row: object, index: number) => import('react').ReactNode,
 * }>} props.columns Definisi kolom
 * @param {object[]} props.data Baris data
 * @param {(row: object) => string} [props.rowKey] Fungsi kunci unik tiap baris
 * @param {boolean} [props.loading] Tampilkan skeleton rows
 * @param {import('react').ReactNode} [props.empty] Empty state kustom
 * @param {string} [props.emptyTitle] Judul empty state bawaan
 * @param {string} [props.emptyDescription] Deskripsi empty state bawaan
 * @param {(row: object) => void} [props.onRowClick] Aksi saat baris diklik
 * @param {string} [props.ariaLabel] Label aksesibilitas tabel
 * @param {string} [props.className]
 */
export function DataTable({
  columns,
  data = [],
  rowKey,
  loading = false,
  empty,
  emptyTitle = 'Data tidak tersedia',
  emptyDescription,
  onRowClick,
  ariaLabel,
  className,
}) {
  const interactive = typeof onRowClick === 'function'

  const thead = (
    <thead>
      <tr className="border-b border-border">
        {columns.map((col) => (
          <th
            key={col.key}
            scope="col"
            className={cn(
              'px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground',
              alignClass(col.align),
              col.headerClassName
            )}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  )

  if (loading) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
          {thead}
          <tbody>
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', alignClass(col.align))}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      empty ?? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className={className}
        />
      )
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
        {thead}
        <tbody>
          {data.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row) : index}
              onClick={interactive ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border transition-colors last:border-b-0',
                interactive && 'cursor-pointer hover:bg-surface/40'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', alignClass(col.align), col.className)}>
                  {col.cell ? col.cell(row, index) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
