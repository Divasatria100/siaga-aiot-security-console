import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Navbar — informasi kontekstual bagian atas (FDD Bab 8).
 * Menampilkan breadcrumb sederhana (SIAGA / <Halaman>) dan tombol
 * toggle navigasi pada layar tablet/mobile. Tidak memuat fitur
 * autentikasi/akun karena belum tersedia pada backend.
 */
export function Navbar({ title, onMenuClick }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-5 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Buka navigasi"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="flex min-w-0 items-baseline gap-2">
        <span className="hidden shrink-0 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:inline">
          SIAGA
        </span>
        <span className="hidden shrink-0 text-muted-foreground sm:inline" aria-hidden="true">
          /
        </span>
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
    </header>
  )
}
