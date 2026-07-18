import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { partiesApi } from '@/api/parties'
import type { PartyCreate, PartyUpdate } from '@/types'

export const PARTIES_KEY = ['parties'] as const

export function useParties() {
  return useQuery({
    queryKey: PARTIES_KEY,
    queryFn: partiesApi.list,
  })
}

export function useParty(id: number) {
  return useQuery({
    queryKey: [...PARTIES_KEY, id],
    queryFn: () => partiesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateParty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PartyCreate) => partiesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTIES_KEY }),
  })
}

export function useUpdateParty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: PartyUpdate & { id: number }) =>
      partiesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTIES_KEY }),
  })
}

export function useDeleteParty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => partiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTIES_KEY }),
  })
}
