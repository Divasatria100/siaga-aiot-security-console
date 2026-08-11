import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Dashboard Page (stub Phase 1) — ringkasan kondisi sistem.
 * Implementasi penuh pada fase berikutnya.
 */
export default function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          Ringkasan kondisi sistem: jumlah device online/offline dan status sistem terkini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Modul akan diimplementasikan pada fase berikutnya (GET /api/v1/system/status).
        </p>
      </CardContent>
    </Card>
  )
}
