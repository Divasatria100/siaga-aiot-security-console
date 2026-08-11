import { useNavigate } from 'react-router-dom'
import { MonitoringView } from '@/pages/Monitoring/MonitoringView'

/**
 * Monitoring Page (route /monitoring) — tanpa device aktif dari URL.
 * Device dipilih melalui selector; navigasi ke /monitoring/:deviceId
 * agar state selalu tercermin pada URL (refresh-safe, shareable).
 */
export default function MonitoringPage() {
  const navigate = useNavigate()

  const handleSelectDevice = (deviceId) => {
    navigate(`/monitoring/${encodeURIComponent(deviceId)}`)
  }

  return <MonitoringView deviceId={null} onSelectDevice={handleSelectDevice} />
}
