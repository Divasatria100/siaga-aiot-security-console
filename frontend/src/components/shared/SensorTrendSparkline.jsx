import { useMemo } from 'react'
import EChartsReactModule from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { cn } from '@/lib/utils'

// Normalisasi interop CJS/ESM agar komponen berfungsi di SSR maupun bundler.
const ReactEChartsCore = EChartsReactModule.default ?? EChartsReactModule

// Registrasi ECharts modular sekali (tree-shaking): hanya LineChart,
// Grid (cartesian2d + sumbu) dan Canvas renderer yang dibutuhkan.
echarts.use([LineChart, GridComponent, CanvasRenderer])

const SPARKLINE_COLOR = '#f97316'
const SPARKLINE_HEIGHT = 40

function getTrendLabel(data) {
  const first = data[0]?.value
  const last = data[data.length - 1]?.value
  if (typeof first !== 'number' || typeof last !== 'number') return 'stabil'
  if (last > first) return 'naik'
  if (last < first) return 'turun'
  return 'stabil'
}

/**
 * SensorTrendSparkline — indikator arah/kecenderungan singkat nilai sensor
 * kontinu di dalam SensorCard (Monitoring). Sparkline minimal: line tanpa
 * axis/legend/tooltip/grid, non-interaktif, tinggi kecil (±40px), bersifat
 * pelengkap — bukan pengganti Historical Data.
 *
 * Dibangun dengan Apache ECharts (echarts-for-react) memakai registrasi
 * modular core + Canvas renderer saja agar bundle tetap ringan.
 *
 * Element grafik diberi `aria-hidden`; arah tren disediakan sebagai teks
 * tersembunyi (visually-hidden) agar informasi tetap terbaca non-visual.
 * Bila data kurang dari 2 titik, tidak merender apa pun (degradasi lembut).
 *
 * @param {object} props
 * @param {Array<{ recorded_at: string, value: number }>} [props.data] Deret titik tren
 * @param {string} [props.color] Warna garis sparkline
 * @param {string} [props.className]
 */
export function SensorTrendSparkline({
  data = [],
  color = SPARKLINE_COLOR,
  className,
}) {
  const option = useMemo(() => {
    const values = data.map((point) => point.value)
    const dataMin = Math.min(...values)
    const dataMax = Math.max(...values)
    const pad = dataMax === dataMin ? 1 : (dataMax - dataMin) * 0.15

    return {
      animation: false,
      grid: { top: 2, right: 0, left: 0, bottom: 2 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: data.map((point) => point.recorded_at),
      },
      yAxis: {
        type: 'value',
        show: false,
        min: dataMin - pad,
        max: dataMax + pad,
      },
      series: [
        {
          type: 'line',
          data: values,
          showSymbol: false,
          smooth: false,
          silent: true,
          lineStyle: { width: 1.5, color },
          emphasis: { disabled: true },
        },
      ],
      tooltip: { show: false },
    }
  }, [data, color])

  if (data.length < 2) return null

  return (
    <div className={cn('w-full', className)}>
      <p className="sr-only">Tren nilai {getTrendLabel(data)}</p>
      <div aria-hidden="true" className="w-full" style={{ height: SPARKLINE_HEIGHT }}>
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
  )
}
