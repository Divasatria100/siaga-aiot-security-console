import { AlertCircle, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * ErrorState — tampilan alternatif ketika Request REST API gagal
 * (Error Handling, FDD Bab 10).
 *
 * @param {object} props
 * @param {import('@/lib/axios').ApiError|null} [props.error] Error ternormalisasi
 * @param {() => void} [props.onRetry] Callback retry opsional
 */
export function ErrorState({ error, onRetry, className }) {
  const isNetwork = error?.isNetworkError
  const message = error?.message ?? 'Terjadi kesalahan saat memuat data.'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-card border border-status-danger/30 bg-status-danger/10 text-status-danger">
        {isNetwork ? (
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        ) : (
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {isNetwork ? 'Tidak dapat terhubung ke server' : 'Terjadi kesalahan'}
        </h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{message}</p>
        {error?.code && (
          <p className="font-mono text-xs text-muted-foreground">
            {error.code}
            {error.status ? ` · HTTP ${error.status}` : ''}
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Coba lagi
        </Button>
      )}
    </div>
  )
}
