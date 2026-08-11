import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Alerts Page (stub Phase 1) — riwayat kejadian WARNING dan DANGER.
 * Implementasi penuh pada fase berikutnya.
 */
export default function AlertsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>
          Riwayat kejadian WARNING dan DANGER beserta data sensor pemicunya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Modul akan diimplementasikan pada fase berikutnya (GET /api/v1/alerts).
        </p>
      </CardContent>
    </Card>
  )
}
