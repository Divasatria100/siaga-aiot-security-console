import { NavLink } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAVIGATION } from '@/config/navigation'

/**
 * Sidebar — navigasi utama antar-Page (FDD Bab 8). Persisten pada
 * seluruh Page, menyorot Page aktif, responsif via toggle (mobile).
 */
export function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold tracking-wide">SIAGA</p>
          <p className="font-mono text-[10px] text-muted-foreground">ZONE ALPHA</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAVIGATION.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-surface/60 hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          SIAGA v0.1 · MVP
        </p>
      </div>
    </aside>
  )
}
