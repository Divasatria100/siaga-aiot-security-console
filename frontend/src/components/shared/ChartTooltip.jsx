import { formatNumber } from '@/utils/format'

/**
 * ChartTooltip — konten tooltip kustom untuk Recharts dengan theming SIAGA
 * (surface-subtle, border, label mono). Digunakan melalui properti `content`
 * dari komponen Tooltip Recharts.
 *
 * @param {object} props Props yang diteruskan Recharts ke content tooltip
 * @param {boolean} [props.active]
 * @param {Array<{ dataKey: string, name: string, value: unknown, color: string }>} [props.payload]
 * @param {string|number} [props.label] Label sumbu X pada titik aktif
 * @param {(value: unknown) => string} [props.valueFormatter] Format nilai
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => formatNumber(value),
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-control border border-border bg-surface-subtle/95 px-3 py-2 text-xs shadow-lg">
      {label != null && label !== '' && (
        <p className="mb-1.5 font-mono font-semibold text-foreground">{label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li
            key={entry.dataKey}
            className="flex items-center gap-2 font-mono text-muted-foreground"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="truncate">{entry.name}</span>
            <span className="font-semibold text-foreground">
              {valueFormatter(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
