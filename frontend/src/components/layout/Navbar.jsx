import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Navbar — informasi kontekstual bagian atas (FDD Bab 8): judul halaman
 * aktif dan tombol toggle navigasi pada layar kecil.
 */
export function Navbar({ title, onMenuClick }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-5">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Buka navigasi"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  )
}
