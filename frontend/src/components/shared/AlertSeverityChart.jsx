import { ALERT_STATUS, SYSTEM_STATUS_LABEL } from '@/config/constants'
import { formatNumber } from '@/utils/format'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Chart } from '@/components/shared/Chart'

/** Warna fill per status alert (design tokens status). */
const STATUS_FILL = {
  [ALERT_STATUS.DANGER]: '#ef4444',
  [ALERT_STATUS.WARNING]: '#f59e0b',
}

/**
 * Aggregate Alert Chart — ringkasan jumlah alert per status severity
 * (DANGER / WARNING) untuk SELURUH dataset pada filter aktif.
 *
 * Dataset dihitung di luar pagination tabel (via useAlertOverview) sehingga
 * chart merepresentasikan keseluruhan hasil filter, bukan halaman aktif.
 * Murni presentational dan bersifat secondary terhadap alert list.
 *
 * @param {object} props
 * @param {{ WARNING: number, DANGER: number }|null} [props.counts] Jumlah alert per status (null = belum dimuat)
 * @param {number} [props.total] Total seluruh alert pada filter aktif
 * @param {boolean} [props.truncated] Data agregat terpotong (batas sampel)
 * @param {boolean} [props.loading] Status pemuatan dataset agregat
 * @param {import('@/lib/axios').ApiError|null} [props.error] Error dataset agregat
 * @param {() => void} [props.onRetry] Pemicu muat ulang dataset agregat
 */
export function AlertSeverityChart({
  counts = null,
  total = 0,
  truncated = false,
  loading = false,
  error = null,
  onRetry,
}) {
  const hasCounts = counts !== null

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Ringkasan Alert</CardTitle>
          <CardDescription>
            Jumlah kejadian per status pada filter aktif
          </CardDescription>
        </div>
        {hasCounts && total > 0 && (
          <span className="font-mono text-2xl font-semibold text-foreground">
            {formatNumber(total)}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {loading && !hasCounts && (
          <Skeleton className="h-40 w-full" data-testid="alert-overview-skeleton" />
        )}

        {!loading && error && !hasCounts && (
          <div
            className="flex h-40 flex-col items-start justify-center gap-3 rounded-card border border-border/60 p-4"
            data-testid="alert-overview-error"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-status-danger">
              Gagal memuat ringkasan
            </p>
            <p className="text-sm text-muted-foreground">
              Data agregat tidak dapat dimuat, namun daftar alert tetap tersedia.
            </p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Muat ulang
              </Button>
            )}
          </div>
        )}

        {hasCounts && total === 0 && (
          <p
            className="flex h-24 items-center justify-center text-sm text-muted-foreground"
            data-testid="alert-overview-empty"
          >
            Belum ada data alert untuk filter ini.
          </p>
        )}

        {hasCounts && total > 0 && (
          <div data-testid="alert-overview-chart">
            <Chart
              type="bar"
              data={[
                {
                  status: ALERT_STATUS.DANGER,
                  count: counts.DANGER,
                  fill: STATUS_FILL[ALERT_STATUS.DANGER],
                },
                {
                  status: ALERT_STATUS.WARNING,
                  count: counts.WARNING,
                  fill: STATUS_FILL[ALERT_STATUS.WARNING],
                },
              ]}
              xKey="status"
              series={[{ key: 'count', name: 'Jumlah', cellDataKey: 'fill' }]}
              height={160}
              showLegend={false}
              xTickFormatter={(value) => SYSTEM_STATUS_LABEL[value] ?? value}
              yTickFormatter={(value) => formatNumber(value)}
              valueFormatter={(value) => formatNumber(value)}
              className="mt-2"
            />
            {truncated && (
              <p className="mt-2 text-xs text-muted-foreground">
                Agregat berdasarkan data terbaru (sample), karena jumlah kejadian
                sangat banyak.
              </p>
            )}
          </div>
        )}

        {!hasCounts && !loading && !error && (
          <Skeleton className={cn('h-40 w-full')} data-testid="alert-overview-skeleton" />
        )}
      </CardContent>
    </Card>
  )
}
