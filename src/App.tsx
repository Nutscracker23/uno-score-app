import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { PartiesPage } from '@/pages/PartiesPage'
import { useRefresh } from '@/hooks/useAuth.ts'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
})

function AppBootstrap({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const { isPending } = useRefresh()
  if (!isLoginPage && isPending)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">Loading…</p>
      </div>
    )
  return <>{children}</>
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppBootstrap>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/games/:id" element={<GameDetailPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/parties" element={<PartiesPage />} />
              </Route>
            </Route>
          </Routes>
        </AppBootstrap>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
