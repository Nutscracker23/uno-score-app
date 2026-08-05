import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {gamesApi} from '@/api/games'
import {useGameStore} from '@/store/gameStore'
import type {GameCreate, GameUpdate, RoundCreate, RoundUpdate} from '@/types'

export const GAMES_KEY = ['games'] as const

export function useGames() {
  return useQuery({
    queryKey: GAMES_KEY,
    queryFn: gamesApi.list,
  })
}

export function useGame(id: string) {
  return useQuery({
    queryKey: [...GAMES_KEY, id],
    queryFn: () => gamesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateGame() {
  const qc = useQueryClient()
  const {setActiveGame} = useGameStore()
  return useMutation({
    mutationFn: (payload: GameCreate) => gamesApi.create(payload),
    onSuccess: (game) => {
      qc.invalidateQueries({queryKey: GAMES_KEY})
      setActiveGame(game)
    },
  })
}

export function useUpdateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({id, ...payload}: GameUpdate & { id: string }) =>
      gamesApi.update(id, payload),
    onSuccess: (game) => {
      qc.invalidateQueries({queryKey: [...GAMES_KEY, game.id]})
    },
  })
}

export function useFinishGame() {
  const qc = useQueryClient()
  const {setActiveGame} = useGameStore()
  return useMutation({
    mutationFn: (id: string) => gamesApi.finish(id),
    onSuccess: (game) => {
      qc.invalidateQueries({queryKey: GAMES_KEY})
      qc.setQueryData([...GAMES_KEY, game.id], game)
      setActiveGame(null)
    },
  })
}

export function useDeleteGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gamesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({queryKey: GAMES_KEY}),
  })
}

export function useAddRound(gameId: string) {
  const qc = useQueryClient()
  const {updateActiveGame} = useGameStore()
  return useMutation({
    mutationFn: (payload: RoundCreate) => gamesApi.addRound(gameId, payload),
    onSuccess: (game) => {
      qc.setQueryData([...GAMES_KEY, gameId], game)
      updateActiveGame(game)
    },
  })
}

export function useUpdateRound(gameId: string) {
  const qc = useQueryClient()
  const {updateActiveGame} = useGameStore()
  return useMutation({
    mutationFn: ({roundId, ...payload}: RoundUpdate & { roundId: string }) =>
      gamesApi.updateRound(gameId, roundId, payload),
    onSuccess: (game) => {
      qc.setQueryData([...GAMES_KEY, gameId], game)
      updateActiveGame(game)
    },
  })
}

export function useDeleteRound(gameId: string) {
  const qc = useQueryClient()
  const {updateActiveGame} = useGameStore()
  return useMutation({
    mutationFn: (roundId: string) => gamesApi.deleteRound(gameId, roundId),
    onSuccess: (game) => {
      qc.setQueryData([...GAMES_KEY, gameId], game)
      updateActiveGame(game)
    },
  })
}
