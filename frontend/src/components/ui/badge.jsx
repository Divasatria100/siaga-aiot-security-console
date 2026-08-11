import { cn } from '@/lib/utils'

/**
 * Base UI — Badge (design.md: radius pill).
 */
export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default:
      'border-transparent bg-surface text-foreground',
    outline: 'border-border bg-transparent text-muted-foreground',
    primary: 'border-transparent bg-primary/15 text-primary',
    accent: 'border-transparent bg-accent/15 text-accent',
    normal: 'border-transparent bg-status-normal/15 text-status-normal',
    warning: 'border-transparent bg-status-warning/15 text-status-warning',
    danger: 'border-transparent bg-status-danger/15 text-status-danger',
    online: 'border-transparent bg-status-online/15 text-status-online',
    offline: 'border-transparent bg-status-offline/15 text-status-offline',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5',
        'font-mono text-[11px] font-semibold leading-5 tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
