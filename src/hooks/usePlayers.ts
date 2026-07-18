import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { playersApi } from '@/api/players'
import type { PlayerCreate, PlayerUpdate } from '@/types'

export const PLAYERS_KEY = ['players'] as const

export function usePlayers() {
  return useQuery({
    queryKey: PLAYERS_KEY,
    queryFn: playersApi.list,
  })
}

export function useCreatePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlayerCreate) => playersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}

export function useUpdatePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: PlayerUpdate & { id: string }) =>
      playersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}

export function useDeletePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => playersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}

export function useDetachPlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => playersApi.detach(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}
