import { cn } from '@/lib/utils'

/** Class kontrol filter (select/date) — satu titik kebenaran (planning §5.1). */
const CONTROL_CLASS =
  'h-9 w-full rounded-control border border-border bg-surface/40 px-3 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50'

/** Class label kontrol — mono uppercase. */
const LABEL_CLASS =
  'block font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground'

/**
 * FilterField — wrapper label + kontrol (select/date) untuk filter form.
 * Satu titik kebenaran style kontrol filter (planning-design.md §5.1);
 * menggantikan string class yang sebelumnya diduplikasi di Historical Data,
 * Alerts, dan Devices. Murni presentational — nilai dikontrol pemanggil.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.label Label kontrol
 * @param {string} props.id id kontrol sekaligus htmlFor label
 * @param {'select'|'date'} [props.type] Jenis kontrol
 * @param {Array<{ value: string, label: import('react').ReactNode }>} [props.options] Opsi select
 * @param {string} [props.value] Nilai terpilih
 * @param {(value: string) => void} [props.onChange] Callback saat berubah
 * @param {string} [props.placeholder] Teks opsi kosong (select)
 * @param {boolean} [props.loadingOptions] Menampilkan opsi "Memuat…" (select)
 * @param {boolean} [props.disabled] Nonaktifkan kontrol
 * @param {string} [props.min] Batas bawah (date)
 * @param {string} [props.max] Batas atas (date)
 * @param {string} [props.className] Class tambahan pada wrapper
 */
export function FilterField({
  label,
  id,
  type = 'select',
  options = [],
  value = '',
  onChange,
  placeholder = 'Semua',
  loadingOptions = false,
  disabled = false,
  min,
  max,
  className,
}) {
  const handleChange = (event) => onChange?.(event.target.value)

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      {type === 'date' ? (
        <input
          id={id}
          type="date"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          className={CONTROL_CLASS}
        />
      ) : (
        <select
          id={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={CONTROL_CLASS}
        >
          <option value="">
            {loadingOptions ? 'Memuat…' : placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
