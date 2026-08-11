import { cn } from '@/lib/utils'

/**
 * Base UI — Button (design.md: primary/accent untuk aksi utama,
 * radius control).
 */
const buttonVariants = {
  variant: {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary/50',
    accent:
      'bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:ring-accent/50',
    outline:
      'border border-border bg-transparent hover:bg-surface/60 focus-visible:ring-border',
    ghost: 'hover:bg-surface/60 focus-visible:ring-border',
    danger: 'bg-status-danger text-white hover:bg-status-danger/90 focus-visible:ring-status-danger/50',
  },
  size: {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-10 w-10',
  },
}

export function Button({
  className,
  variant = 'primary',
  size = 'default',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    />
  )
}
