import { apiClient } from './client'
import type { GameRead, GameDetail, GameCreate, GameUpdate, RoundCreate, RoundUpdate } from '@/types'

export const gamesApi = {
  list: async (): Promise<GameRead[]> => {
    const { data } = await apiClient.get<GameRead[]>('/games')
    return data
  },

  get: async (id: string): Promise<GameDetail> => {
    const { data } = await apiClient.get<GameDetail>(`/games/${id}`)
    return data
  },

  create: async (payload: GameCreate): Promise<GameDetail> => {
    const { data } = await apiClient.post<GameDetail>('/games', payload)
    return data
  },

  update: async (id: string, payload: GameUpdate): Promise<GameDetail> => {
    const { data } = await apiClient.patch<GameDetail>(`/games/${id}`, payload)
    return data
  },

  finish: async (id: string): Promise<GameDetail> => {
    const { data } = await apiClient.post<GameDetail>(`/games/${id}/finish`)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/games/${id}`)
  },

  addRound: async (gameId: string, payload: RoundCreate): Promise<GameDetail> => {
    const { data } = await apiClient.post<GameDetail>(`/games/${gameId}/rounds`, payload)
    return data
  },

  updateRound: async (gameId: string, roundId: string, payload: RoundUpdate): Promise<GameDetail> => {
    const { data } = await apiClient.patch<GameDetail>(`/games/${gameId}/rounds/${roundId}`, payload)
    return data
  },

  deleteRound: async (gameId: string, roundId: string): Promise<GameDetail> => {
    const { data } = await apiClient.delete<GameDetail>(`/games/${gameId}/rounds/${roundId}`)
    return data
  },
}
