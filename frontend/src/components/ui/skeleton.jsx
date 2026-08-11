import { cn } from '@/lib/utils'

/**
 * Base UI — Skeleton placeholder untuk loading state
 * (design.md: surface token + subtle pulse).
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-card bg-surface', className)}
      {...props}
    />
  )
}
