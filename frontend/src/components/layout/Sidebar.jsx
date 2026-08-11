import { NavLink } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAVIGATION } from '@/config/navigation'

/**
 * Sidebar — navigasi utama antar-Page (FDD Bab 8). Persisten pada
 * desktop, drawer pada tablet/mobile, menyorot Page aktif dengan
 * indikator accent. Label teknis memakai mono face sesuai design.md.
 */
export function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-control border border-border bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="font-mono text-sm font-semibold tracking-wide text-foreground">
            SIAGA
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Zone Alpha
          </p>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigasi utama">
        <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        {NAVIGATION.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-surface/60 hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-pill bg-primary"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          SIAGA v0.1 · MVP
        </p>
      </div>
    </aside>
  )
}
