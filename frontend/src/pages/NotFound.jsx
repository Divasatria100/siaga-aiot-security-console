import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * 404 — halaman tidak ditemukan.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-sm font-semibold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Halaman yang Anda cari tidak tersedia pada SIAGA console.
      </p>
      <Button variant="outline" asChild={false}>
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  )
}
