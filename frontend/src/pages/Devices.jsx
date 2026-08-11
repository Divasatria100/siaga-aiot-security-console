import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Devices Page (stub Phase 1) — daftar dan detail perangkat.
 * Implementasi penuh pada fase berikutnya.
 */
export default function DevicesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>
          Daftar perangkat terdaftar beserta status konektivitas dan detail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Modul akan diimplementasikan pada fase berikutnya (GET /api/v1/devices).
        </p>
      </CardContent>
    </Card>
  )
}
