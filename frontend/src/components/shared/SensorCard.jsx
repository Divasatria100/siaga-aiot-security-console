import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const TONES = {
  default: 'text-foreground',
  normal: 'text-status-normal',
  warning: 'text-status-warning',
  danger: 'text-status-danger',
  muted: 'text-muted-foreground',
}

/**
 * SensorCard — satu nilai sensor beserta satuannya secara ringkas
 * (FDD Bab 8), digunakan berulang pada Monitoring Page untuk tiap jenis
 * sensor (suhu, kelembapan, cahaya, gerakan, obstacle).
 * Nilai boolean (motion/obstacle) dilewatkan sebagai string hasil format.
 *
 * Saat `onClick` disediakan, card menjadi interactive (mengikuti pola
 * DeviceStatusCard): role="button", tabIndex, Enter/Space membuka detail,
 * hover ringan, dan state aktif (`aria-expanded` + border subtle) untuk
 * drill-in tren sensor kontinu. Tanpa `onClick` card tetap statis
 * (motion/obstacle).
 *
 * @param {object} props
 * @param {string} props.label Label sensor (mono, uppercase)
 * @param {string|number} props.value Nilai sensor (sudah terformat bila perlu)
 * @param {string} [props.unit] Satuan sensor (lihat SENSOR_UNITS)
 * @param {import('react').ReactNode} [props.icon] Ikon sensor
 * @param {'default'|'normal'|'warning'|'danger'|'muted'} [props.tone] Tone warna nilai
 * @param {import('react').ReactNode} [props.footer] Slot di bawah header (mis. sparkline tren sensor)
 * @param {() => void} [props.onClick] Aksi saat card diklik (bila disediakan, card interactive)
 * @param {boolean} [props.active] State aktif (detail tren sensor terbuka)
 * @param {string} [props.className]
 */
export function SensorCard({
  label,
  value,
  unit,
  icon,
  tone = 'default',
  footer,
  onClick,
  active = false,
  className,
}) {
  const interactive = typeof onClick === 'function'

  return (
    <Card
      className={cn(
        'p-5',
        interactive &&
          'cursor-pointer transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        active && 'border-primary/60 bg-surface/60',
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-expanded={interactive ? active : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className={cn('truncate text-xl font-semibold tracking-tight', TONES[tone])}>
            {value}
            {unit && (
              <span className="ml-1 font-mono text-xs font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </p>
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </Card>
  )
}
