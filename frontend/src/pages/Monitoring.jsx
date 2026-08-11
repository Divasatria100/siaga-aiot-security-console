import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Monitoring Page (stub Phase 1) — data sensor dan status terkini satu device.
 * Implementasi penuh pada fase berikutnya.
 */
export default function MonitoringPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring</CardTitle>
        <CardDescription>
          Data sensor (suhu, kelembapan, gerakan, cahaya, obstacle) dan status sistem terkini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Modul akan diimplementasikan pada fase berikutnya (GET /api/v1/sensor-data/latest).
        </p>
      </CardContent>
    </Card>
  )
}
