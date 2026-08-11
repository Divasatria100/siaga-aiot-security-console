import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime, formatSensorValue } from '@/utils/format'
import { SENSOR_LABELS, SENSOR_UNITS } from '@/config/constants'

/** Urutan field sensor untuk ringkasan alert (FDD Bab 8). */
const SENSOR_FIELDS = ['temperature', 'humidity', 'light', 'motion', 'obstacle']

/**
 * Format satu nilai sensor pemicu alert untuk tampilan ringkas.
 * Nilai boolean (motion/obstacle) ditampilkan sebagai Ada/Tidak.
 */
function formatSensorField(value, key) {
  if (key === 'motion' || key === 'obstacle') {
    return value ? 'Ada' : 'Tidak'
  }
  return formatSensorValue(value, SENSOR_UNITS[key])
}

/**
 * AlertCard — ringkasan satu kejadian alert (FDD Bab 8): status
 * (WARNING/DANGER), waktu kejadian, device terkait, dan ringkasan data
 * sensor pemicu bila tersedia (detail). Murni presentational.
 *
 * @param {object} props
 * @param {import('@/types').Alert} props.alert Data alert
 * @param {() => void} [props.onClick] Aksi saat kartu diklik (opsional)
 * @param {string} [props.className]
 */
export function AlertCard({ alert, onClick, className }) {
  if (!alert) return null

  const interactive = typeof onClick === 'function'
  const sensorData = alert.sensor_data

  return (
    <Card
      className={cn('p-5', interactive && 'cursor-pointer transition-colors hover:bg-surface/60', className)}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Alert · {alert.device_id}
          </p>
          <p className="text-sm font-medium">{formatDateTime(alert.triggered_at)}</p>
        </div>
        <StatusBadge kind="system" status={alert.status} />
      </div>

      {sensorData && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border pt-3 sm:grid-cols-3">
          {SENSOR_FIELDS.map((key) => (
            <div key={key} className="flex items-baseline justify-between gap-2">
              <dt className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {SENSOR_LABELS[key]}
              </dt>
              <dd className="font-mono text-xs text-foreground">
                {formatSensorField(sensorData[key], key)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  )
}
