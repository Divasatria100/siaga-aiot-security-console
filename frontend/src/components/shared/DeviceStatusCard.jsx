import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatRelativeTime } from '@/utils/format'

/**
 * DeviceStatusCard — ringkasan status satu device (FDD Bab 8): nama,
 * device_id, status konektivitas, waktu terakhir terlihat, dan status
 * sistem terkini. Dipakai pada Dashboard Page dan Devices Page.
 *
 * Catatan: pada response GET /api/v1/system/status, `devices[]` tidak
 * menyertakan field `name`, sehingga nama diturunkan dari `device_id`
 * bila tidak tersedia (tanpa mengasumsikan field yang tidak ada di API).
 *
 * @param {object} props
 * @param {import('@/types').Device|import('@/types').SystemDeviceStatus} props.device Data device
 * @param {'NORMAL'|'WARNING'|'DANGER'|null} [props.latestStatus] Status sistem terkini
 * @param {() => void} [props.onClick] Aksi saat kartu diklik (opsional)
 * @param {string} [props.className]
 */
export function DeviceStatusCard({ device, latestStatus = null, onClick, className }) {
  if (!device) return null

  const interactive = typeof onClick === 'function'
  const displayName = device.name || device.device_id

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
          <p className="truncate text-sm font-semibold">{displayName}</p>
          {device.name && (
            <p className="font-mono text-xs text-muted-foreground">{device.device_id}</p>
          )}
        </div>
        <StatusBadge kind="device" status={device.status} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        {latestStatus ? (
          <StatusBadge kind="system" status={latestStatus} />
        ) : (
          <span className="font-mono text-xs text-muted-foreground">—</span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(device.last_seen_at)}
        </span>
      </div>
    </Card>
  )
}
