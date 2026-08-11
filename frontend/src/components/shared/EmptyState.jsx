import { cn } from '@/lib/utils'

/**
 * EmptyState — tampilan alternatif ketika data yang diminta tidak
 * tersedia (FDD Bab 8), mis. device belum memiliki record sensor.
 *
 * @param {object} props
 * @param {string} [props.title] Judul
 * @param {string} [props.description] Deskripsi
 * @param {import('react').ReactNode} [props.icon] Ikon opsional
 * @param {import('react').ReactNode} [props.action] Aksi opsional
 */
export function EmptyState({ title, description, icon, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-card border border-border bg-surface/40 text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title ?? 'Data tidak tersedia'}</h3>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
