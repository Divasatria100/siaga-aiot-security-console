import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Historical Data Page (stub Phase 1) — riwayat sensor per rentang waktu.
 * Implementasi penuh pada fase berikutnya.
 */
export default function HistoricalDataPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Data</CardTitle>
        <CardDescription>
          Riwayat data sensor dan status sistem berdasarkan rentang waktu tertentu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Modul akan diimplementasikan pada fase berikutnya (GET /api/v1/sensor-data/history).
        </p>
      </CardContent>
    </Card>
  )
}
