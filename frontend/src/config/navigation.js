import { Activity, AlertTriangle, LayoutDashboard, History, Server } from 'lucide-react'

/**
 * Navigasi utama React Dashboard sesuai Navigation Design (FDD Bab 6).
 */
export const NAVIGATION = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/monitoring',
    label: 'Monitoring',
    icon: Activity,
  },
  {
    to: '/history',
    label: 'Historical Data',
    icon: History,
  },
  {
    to: '/alerts',
    label: 'Alerts',
    icon: AlertTriangle,
  },
  {
    to: '/devices',
    label: 'Devices',
    icon: Server,
  },
]
