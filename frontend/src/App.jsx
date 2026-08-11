import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const MonitoringPage = lazy(() => import('@/pages/Monitoring'))
const MonitoringDetailPage = lazy(() => import('@/pages/MonitoringDetail'))
const HistoricalDataPage = lazy(() => import('@/pages/HistoricalData'))
const AlertsPage = lazy(() => import('@/pages/Alerts'))
const DevicesPage = lazy(() => import('@/pages/Devices'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

/**
 * Routing React Dashboard sesuai Navigation Design (FDD Bab 6).
 * Halaman di-lazy-load; Suspense fallback berada pada AppLayout.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'monitoring', element: <MonitoringPage /> },
      { path: 'monitoring/:deviceId', element: <MonitoringDetailPage /> },
      { path: 'history', element: <HistoricalDataPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'devices', element: <DevicesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
