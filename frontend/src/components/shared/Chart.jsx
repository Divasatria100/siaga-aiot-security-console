import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  Line,
  Area,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltip } from '@/components/shared/ChartTooltip'

/**
 * Warna chart mengikuti design tokens (index.css @theme). Didefinisikan
 * sebagai konstanta agar dapat dilewatkan sebagai props SVG Recharts.
 */
const CHART_COLORS = {
  primary: '#f97316',
  accent: '#818cf8',
  normal: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
}

const PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.normal,
  CHART_COLORS.warning,
]

const AXIS_TICK = {
  fill: '#a1a1aa',
  fontSize: 11,
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
}

const GRID_STROKE = '#1f1f1f'
const AXIS_STROKE = '#2a2a2a'

/**
 * Chart — wrapper generik di atas Recharts (FDD Bab 8 & 11) untuk
 * Line/Area/Bar chart dengan theming konsisten: dark theme, grid halus,
 * axis mono, tooltip kustom. Murni presentational — data diterima via
 * props, tanpa fetching. Dipakai oleh Monitoring Page & Historical Data Page.
 *
 * @param {object} props
 * @param {'line'|'area'|'bar'} [props.type] Jenis chart
 * @param {object[]} props.data Data record untuk chart
 * @param {string} props.xKey Field untuk sumbu X
 * @param {Array<{ key: string, name: string, color?: string, fill?: string, cellDataKey?: string }>} props.series Definisi seri data. Untuk `type="bar"`, `cellDataKey` adalah field pada setiap baris data yang berisi warna fill per-bar (Cell Recharts).
 * @param {number} [props.height] Tinggi chart (px)
 * @param {(value: unknown, index: number) => string} [props.xTickFormatter]
 * @param {(value: unknown, index: number) => string} [props.yTickFormatter]
 * @param {(value: unknown) => string} [props.valueFormatter] Format nilai pada tooltip
 * @param {boolean} [props.showLegend]
 * @param {boolean} [props.showGrid]
 * @param {string} [props.className]
 */
export function Chart({
  type = 'line',
  data = [],
  xKey,
  series = [],
  height = 280,
  xTickFormatter,
  yTickFormatter,
  valueFormatter,
  showLegend = true,
  showGrid = true,
  className,
}) {
  const chartCommon = (
    <>
      {showGrid && (
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
      )}
      <XAxis
        dataKey={xKey}
        tickLine={false}
        axisLine={{ stroke: AXIS_STROKE }}
        tick={AXIS_TICK}
        tickFormatter={xTickFormatter}
        minTickGap={24}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={44}
        tick={AXIS_TICK}
        tickFormatter={yTickFormatter}
      />
      <Tooltip
        content={<ChartTooltip valueFormatter={valueFormatter} />}
        cursor={{ stroke: AXIS_STROKE }}
      />
      {showLegend && (
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
          formatter={(value) => (
            <span className="font-mono text-xs text-muted-foreground">{value}</span>
          )}
        />
      )}
    </>
  )

  const renderSeries = series.map((item, index) => {
    const color = item.color ?? PALETTE[index % PALETTE.length]
    if (type === 'bar') {
      return (
        <Bar
          key={item.key}
          dataKey={item.key}
          name={item.name}
          fill={item.fill ?? color}
          radius={[3, 3, 0, 0]}
          barSize={18}
        >
          {item.cellDataKey &&
            data.map((row, rowIndex) => (
              <Cell key={`${item.key}-${rowIndex}`} fill={row?.[item.cellDataKey]} />
            ))}
        </Bar>
      )
    }
    if (type === 'area') {
      return (
        <Area
          key={item.key}
          type="monotone"
          dataKey={item.key}
          name={item.name}
          stroke={color}
          fill={item.fill ?? color}
          fillOpacity={0.15}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      )
    }
    return (
      <Line
        key={item.key}
        type="monotone"
        dataKey={item.key}
        name={item.name}
        stroke={color}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4 }}
      />
    )
  })

  let chart
  if (type === 'bar') {
    chart = (
      <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {chartCommon}
        {renderSeries}
      </RechartsBarChart>
    )
  } else if (type === 'area') {
    chart = (
      <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {chartCommon}
        {renderSeries}
      </RechartsAreaChart>
    )
  } else {
    chart = (
      <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {chartCommon}
        {renderSeries}
      </RechartsLineChart>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  )
}
