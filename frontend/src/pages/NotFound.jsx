import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * 404 — halaman tidak ditemukan (route tidak dikenal).
 */
export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Halaman yang Anda cari tidak tersedia pada SIAGA console.
      </p>
      <Button variant="outline" onClick={() => navigate('/')}>
        Kembali ke Dashboard
      </Button>
    </div>
  )
}
