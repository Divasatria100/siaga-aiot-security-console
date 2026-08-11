import { useNavigate, useParams } from 'react-router-dom'
import { MonitoringView } from '@/pages/Monitoring/MonitoringView'

/**
 * Monitoring Detail Page (route /monitoring/:deviceId) — device aktif
 * ditentukan dari URL. Navigasi ini mempertahankan interaksi Dashboard
 * (DeviceStatusCard → Monitoring device terkait) dan memungkinkan
 * berpindah device melalui selector.
 */
export default function MonitoringDetailPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()

  const handleSelectDevice = (nextDeviceId) => {
    navigate(`/monitoring/${encodeURIComponent(nextDeviceId)}`)
  }

  return (
    <MonitoringView deviceId={deviceId ?? null} onSelectDevice={handleSelectDevice} />
  )
}
