import { apiClient } from './client'
import type { Player, PlayerCreate, PlayerUpdate } from '@/types'

export const playersApi = {
  list: async (): Promise<Player[]> => {
    const { data } = await apiClient.get<Player[]>('/players')
    return data
  },

  create: async (payload: PlayerCreate): Promise<Player> => {
    const { data } = await apiClient.post<Player>('/players', payload)
    return data
  },

  update: async (id: string, payload: PlayerUpdate): Promise<Player> => {
    const { data } = await apiClient.patch<Player>(`/players/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/players/${id}`)
  },

  detach: async (id: string): Promise<void> => {
    await apiClient.delete(`/players/${id}/detach`)
  },
}
