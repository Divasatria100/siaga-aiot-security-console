import { ResponsiveContainer, LineChart, Line } from 'recharts'
import { cn } from '@/lib/utils'

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
  if (data.length < 2) return null

  return (
    <div className={cn('w-full', className)}>
      <p className="sr-only">Tren nilai {getTrendLabel(data)}</p>
      <div aria-hidden="true" className="w-full" style={{ height: SPARKLINE_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}