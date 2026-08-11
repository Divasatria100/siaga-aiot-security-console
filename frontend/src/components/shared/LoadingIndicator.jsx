import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * LoadingIndicator — indikasi visual bahwa data sedang diambil
 * dari REST API (Loading State, FDD Bab 10).
 *
 * @param {object} props
 * @param {boolean} [props.fullScreen] Pusatkan pada area penuh
 * @param {string} [props.label] Teks opsional
 */
export function LoadingIndicator({ fullScreen = false, label = 'Memuat data…', className }) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
