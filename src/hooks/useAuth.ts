import { useNavigate } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/api/client'
import { authApi } from '@/api/auth.ts'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useRefresh() {
  const { setAuth, refreshAttempted, setRefreshAttempted } = useAuthStore()

  return useQuery({
    queryKey: ['refresh'],
    enabled: !refreshAttempted,
    queryFn: async () => {
      try {
        const {
          data: { access_token },
        } = await apiClient.post(`/auth/refresh`, {}, { withCredentials: true })
        const user = await authApi.me(access_token)
        setAuth(user, access_token)
        return user
      } catch {
        return null
      } finally {
        setRefreshAttempted() // в любом случае помечаем что попытка была
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return async () => {
    try {
      await authApi.logout()
    } finally {
      logout()
      qc.clear()
      navigate('/login')
    }
  }
}
