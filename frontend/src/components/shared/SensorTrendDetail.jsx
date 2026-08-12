import { useMemo } from 'react'
import EChartsReactModule from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatSensorValue, formatTime } from '@/utils/format'
import { cn } from '@/lib/utils'

// Normalisasi interop CJS/ESM agar komponen berfungsi di SSR maupun bundler.
const ReactEChartsCore = EChartsReactModule.default ?? EChartsReactModule

// Registrasi ECharts modular sekali (tree-shaking): LineChart + Grid
// (cartesian2d + sumbu) + Tooltip + Canvas renderer saja yang dibutuhkan.
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

/** Tinggi area chart detail (px) — cukup untuk membaca tren 1 jam. */
const DETAIL_CHART_HEIGHT = 240

/** Style label sumbu ECharts — konsisten dengan AXIS_TICK di Chart (Recharts). */
const AXIS_LABEL = {
  color: '#a1a1aa',
  fontSize: 11,
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
}

/** Warna gridline & sumbu — konsisten dengan token surface/border. */
const GRID_STROKE = '#1f1f1f'
const AXIS_STROKE = '#2a2a2a'

/**
 * Urutkan titik tren menaik berdasarkan waktu. Endpoint history backend
 * mengembalikan DESC (terbaru dulu); untuk sumbu waktu yang benar-benar
 * kronologis, detail chart perlu urutan ASC.
 *
 * @param {Array<{ recorded_at: string, value: number }>} series
 * @returns {Array<{ recorded_at: string, value: number }>}
 */
function sortChronological(series) {
  return series
    .slice()
    .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
}

/**
 * Hitung statistik ringkas (Current/Min/Avg/Max) dari nilai numerik titik
 * tren. Seluruhnya berasal dari data aktual — tidak ada nilai fiktif.
 * Mengembalikan null bila titik valid kurang dari 2.
 *
 * @param {Array<{ recorded_at: string, value: number }>} series Diurutkan kronologis
 */
function computeStats(series) {
  const values = series.map((point) => point.value)
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  // Current = record terbaru yang tersedia (elemen terakhir setelah sort ASC).
  return { current: values[values.length - 1], min, max, avg }
}

/**
 * StatItem — satu entri Current/Min/Avg/Max pada detail tren sensor.
 * Label mono uppercase, nilai mono — selaras pola metric pada aplikasi.
 */
function StatItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-control border border-border/60 bg-surface/40 px-3 py-2">
      <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono text-base font-semibold tracking-tight text-foreground">
        {value}
      </dd>
    </div>
  )
}

/**
 * SensorTrendDetail — drill-in tren singkat (1 jam terakhir) satu sensor
 * kontinu pada Monitoring, muncul ketika SensorCard yang bersangkutan
 * dipilih. Data berasal dari `useRecentSensorTrend` (tidak ada request
 * tambahan); chart ECharts minimal (line single-series, sumbu waktu+nilai,
 * tooltip), tanpa gradient/dekorasi — bukan duplikasi Historical Data.
 *
 * Statistik Current/Min/Avg/Max disajikan sebagai teks (informasi utama,
 * tetap terbaca non-visual); chart adalah pelengkap visual. Bila titik
 * valid < 2, tidak merender chart kosong — diganti pesan graceful.
 *
 * @param {object} props
 * @param {string} props.label Label sensor (SENSOR_LABELS)
 * @param {string} props.color Warna garis tren (SENSOR_TREND_COLORS)
 * @param {string} [props.unit] Satuan sensor (SENSOR_UNITS)
 * @param {Array<{ recorded_at: string, value: number }>} [props.series] Titik tren
 * @param {string} [props.className]
 */
export function SensorTrendDetail({
  label,
  color,
  unit = '',
  series = [],
  className,
}) {
  const points = useMemo(
    () =>
      sortChronological(series.filter((point) => typeof point.value === 'number')),
    [series]
  )
  const stats = useMemo(() => computeStats(points), [points])

  const option = useMemo(() => {
    const values = points.map((point) => point.value)
    const dataMin = Math.min(...values)
    const dataMax = Math.max(...values)
    const pad = dataMax === dataMin ? 1 : (dataMax - dataMin) * 0.15

    return {
      animation: false,
      grid: { top: 20, right: 16, left: 8, bottom: 8 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: points.map((point) => point.recorded_at),
        axisLine: { lineStyle: { color: AXIS_STROKE } },
        axisTick: { show: false },
        axisLabel: { ...AXIS_LABEL, formatter: (value) => formatTime(value) },
      },
      yAxis: {
        type: 'value',
        min: dataMin - pad,
        max: dataMax + pad,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...AXIS_LABEL },
        splitLine: { lineStyle: { color: GRID_STROKE } },
      },
      series: [
        {
          type: 'line',
          data: values,
          showSymbol: false,
          smooth: false,
          lineStyle: { width: 2, color },
          emphasis: { disabled: true },
        },
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a1a',
        borderColor: AXIS_STROKE,
        textStyle: {
          color: '#ffffff',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        },
        formatter: (params) => {
          const point = params?.[0]
          if (!point) return ''
          const recordedAt = points[point.dataIndex]?.recorded_at ?? ''
          return `${formatTime(recordedAt)} · ${formatSensorValue(point.data, unit)}`
        },
      },
    }
  }, [points, color, unit])

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>{label} Trend</CardTitle>
        <CardDescription>
          Tren {label.toLowerCase()} pada 1 jam terakhir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats ? (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatItem label="Current" value={formatSensorValue(stats.current, unit)} />
              <StatItem label="Min" value={formatSensorValue(stats.min, unit)} />
              <StatItem label="Avg" value={formatSensorValue(stats.avg, unit)} />
              <StatItem label="Max" value={formatSensorValue(stats.max, unit)} />
            </dl>
            <div
              role="img"
              aria-label={`Grafik tren ${label.toLowerCase()} 1 jam terakhir`}
            >
              <div className="w-full" style={{ height: DETAIL_CHART_HEIGHT }}>
                <ReactEChartsCore
                  echarts={echarts}
                  option={option}
                  notMerge
                  lazyUpdate
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="py-8 text-center font-mono text-xs text-muted-foreground">
            Data tren belum tersedia untuk 1 jam terakhir.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
