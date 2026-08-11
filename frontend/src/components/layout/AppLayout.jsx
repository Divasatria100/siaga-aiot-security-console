import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { LoadingIndicator } from '@/components/shared/LoadingIndicator'
import { NAVIGATION } from '@/config/navigation'

/**
 * AppLayout — struktur tampilan umum seluruh Page (FDD Bab 5):
 * Sidebar persisten (desktop), Navbar, dan area konten utama.
 * Responsif: Sidebar disembunyikan pada layar kecil (toggle).
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  const currentNav =
    NAVIGATION.find((item) =>
      item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
    ) ?? NAVIGATION[0]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar mobile (overlay) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={currentNav.label}
          onMenuClick={() => setSidebarOpen((open) => !open)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-6">
            <Suspense fallback={<LoadingIndicator />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
