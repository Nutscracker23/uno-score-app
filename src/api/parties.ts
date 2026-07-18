import { apiClient } from './client'
import type { Party, PartyCreate, PartyUpdate } from '@/types'

export const partiesApi = {
  list: async (): Promise<Party[]> => {
    const { data } = await apiClient.get<Party[]>('/parties')
    return data
  },

  get: async (id: number): Promise<Party> => {
    const { data } = await apiClient.get<Party>(`/parties/${id}`)
    return data
  },

  create: async (payload: PartyCreate): Promise<Party> => {
    const { data } = await apiClient.post<Party>('/parties', payload)
    return data
  },

  update: async (id: number, payload: PartyUpdate): Promise<Party> => {
    const { data } = await apiClient.patch<Party>(`/parties/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/parties/${id}`)
  },
}
