import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const TONES = {
  default: 'text-foreground',
  primary: 'text-primary',
  online: 'text-status-online',
  offline: 'text-status-offline',
  warning: 'text-status-warning',
  danger: 'text-status-danger',
}

const ICON_TONES = {
  default: 'bg-surface text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  online: 'bg-status-online/15 text-status-online',
  offline: 'bg-status-offline/15 text-status-offline',
  warning: 'bg-status-warning/15 text-status-warning',
  danger: 'bg-status-danger/15 text-status-danger',
}

/**
 * DashboardCard — ringkasan satu metrik pada Dashboard Page (FDD Bab 8):
 * label mono, nilai utama berukuran besar, satuan, dan ikon dengan tone
 * warna semantic. Murni presentational, nilai diformat oleh pemanggil.
 *
 * @param {object} props
 * @param {string} props.label Label metrik (mono, uppercase)
 * @param {string|number} props.value Nilai utama
 * @param {string} [props.unit] Satuan nilai
 * @param {import('react').ReactNode} [props.icon] Ikon opsional
 * @param {'default'|'primary'|'online'|'offline'|'warning'|'danger'} [props.tone] Tone warna
 * @param {string} [props.description] Catatan kecil di bawah nilai
 * @param {string} [props.className]
 */
export function DashboardCard({
  label,
  value,
  unit,
  icon,
  tone = 'default',
  description,
  className,
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className={cn('truncate text-3xl font-semibold tracking-tight', TONES[tone])}>
            {value}
            {unit && (
              <span className="ml-1 font-mono text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-control',
              ICON_TONES[tone]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
