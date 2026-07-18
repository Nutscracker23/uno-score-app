import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  refreshAttempted: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setRefreshAttempted: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  refreshAttempted: false,

  setAuth: (user: User, token: string) => set({ user, token, isAuthenticated: true }),

  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setRefreshAttempted: () => set({ refreshAttempted: true }),
}))
