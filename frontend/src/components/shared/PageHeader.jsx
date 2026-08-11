import { cn } from '@/lib/utils'

/**
 * PageHeader — kepala halaman konsisten untuk seluruh Page: label mono
 * (metadata, design.md label-md), judul, deskripsi, dan area aksi kanan.
 * Murni presentational; aksi disediakan oleh Page pemanggil.
 *
 * @param {object} props
 * @param {string} props.title Judul halaman
 * @param {string} [props.description] Deskripsi singkat halaman
 * @param {import('react').ReactNode} [props.meta] Label mono opsional di atas judul
 * @param {import('react').ReactNode} [props.actions] Aksi di sisi kanan (Button, dsb.)
 * @param {string} [props.className]
 */
export function PageHeader({ title, description, meta, actions, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {meta && (
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {meta}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
