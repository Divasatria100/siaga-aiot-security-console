import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { LoadingIndicator } from '@/components/shared/LoadingIndicator'
import { NAVIGATION } from '@/config/navigation'

/**
 * AppLayout — struktur tampilan umum seluruh Page (FDD Bab 5 & 12):
 * - Desktop (lg+): Sidebar persisten.
 * - Tablet/Mobile (< lg): Sidebar sebagai drawer dengan overlay,
 *   tanpa merusak layout atau menyebabkan horizontal overflow.
 * Navbar menampilkan breadcrumb halaman aktif; area konten di-scroll
 * ulang ke atas saat berpindah route.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  const currentNav = NAVIGATION.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
  )
  const pageTitle = currentNav?.label ?? 'Not Found'

  // Scroll konten ke atas setiap berpindah halaman (tanpa reload).
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar desktop (persisten) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar tablet/mobile (drawer + overlay) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Konten utama */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen((open) => !open)}
        />
        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <Suspense fallback={<LoadingIndicator />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
