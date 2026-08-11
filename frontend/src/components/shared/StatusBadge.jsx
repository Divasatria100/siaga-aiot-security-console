import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DEVICE_STATUS,
  DEVICE_STATUS_LABEL,
  SYSTEM_STATUS,
  SYSTEM_STATUS_LABEL,
} from '@/config/constants'

const SYSTEM_STATUS_DOT = {
  [SYSTEM_STATUS.NORMAL]: 'bg-status-normal',
  [SYSTEM_STATUS.WARNING]: 'bg-status-warning',
  [SYSTEM_STATUS.DANGER]: 'bg-status-danger',
}

const SYSTEM_STATUS_VARIANT = {
  [SYSTEM_STATUS.NORMAL]: 'normal',
  [SYSTEM_STATUS.WARNING]: 'warning',
  [SYSTEM_STATUS.DANGER]: 'danger',
}

const DEVICE_STATUS_DOT = {
  [DEVICE_STATUS.ONLINE]: 'bg-status-online',
  [DEVICE_STATUS.OFFLINE]: 'bg-status-offline',
}

const DEVICE_STATUS_VARIANT = {
  [DEVICE_STATUS.ONLINE]: 'online',
  [DEVICE_STATUS.OFFLINE]: 'offline',
}

/**
 * StatusBadge — indikator visual status sistem (NORMAL/WARNING/DANGER)
 * maupun status konektivitas device (online/offline) memakai semantic
 * status colors internal frontend.
 *
 * @param {object} props
 * @param {'system'|'device'} props.kind Jenis status
 * @param {string} props.status Nilai status ('NORMAL'|'WARNING'|'DANGER'|'online'|'offline')
 */
export function StatusBadge({ kind, status, className }) {
  if (kind === 'device') {
    const label = DEVICE_STATUS_LABEL[status] ?? status
    return (
      <Badge variant={DEVICE_STATUS_VARIANT[status]} className={className}>
        <span
          className={cn('h-1.5 w-1.5 rounded-full', DEVICE_STATUS_DOT[status])}
          aria-hidden="true"
        />
        {label}
      </Badge>
    )
  }

  const label = SYSTEM_STATUS_LABEL[status] ?? status
  return (
    <Badge variant={SYSTEM_STATUS_VARIANT[status]} className={className}>
      <span
        className={cn('h-1.5 w-1.5 rounded-full', SYSTEM_STATUS_DOT[status])}
        aria-hidden="true"
      />
      {label}
    </Badge>
  )
}
