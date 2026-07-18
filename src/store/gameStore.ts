import { create } from 'zustand'
import type { GameDetail } from '@/types'

interface GameState {
  activeGame: GameDetail | null
  setActiveGame: (game: GameDetail | null) => void
  updateActiveGame: (game: GameDetail) => void
}

export const useGameStore = create<GameState>((set) => ({
  activeGame: null,
  setActiveGame: (game) => set({ activeGame: game }),
  updateActiveGame: (game) =>
    set((state) => ({
      activeGame: state.activeGame?.id === game.id ? game : state.activeGame,
    })),
}))
