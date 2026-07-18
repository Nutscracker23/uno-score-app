// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  first_name?: string | null
  last_name?: string | null
}

export interface Token {
  access_token: string
  token_type: string
}

// ─── Players ──────────────────────────────────────────────────────────────────

export interface Player {
  id: string // UUID
  name: string
}

export interface PlayerCreate {
  name: string
}

export interface PlayerUpdate {
  name: string
}

// ─── Parties (reusable player groups) ──────────────────────────────────────────

export interface Party {
  id: number
  name: string
  players: Player[]
}

export interface PartyCreate {
  name: string
  player_ids: string[]
}

export interface PartyUpdate {
  name?: string
  player_ids?: string[]
}

// ─── Games ──────────────────────────────────────────────────────────────────

export type GameStatus = 'in_progress' | 'finished'

export interface Round {
  id: string // UUID
  round_number: number
  winner_id: string // UUID
  score: number
  created_at: string
}

export interface Standing {
  player_id: string // UUID
  name: string
  score: number
  rounds_won: number
}

export interface GameRead {
  id: string // UUID
  target_score: number
  continue_after_target: boolean
  status: GameStatus
  winner_id: string | null
  created_at: string
  finished_at: string | null
}

export interface GameDetail extends GameRead {
  standings: Standing[]
  rounds: Round[]
}

export interface GameCreate {
  target_score: number
  continue_after_target: boolean
  player_ids: string[]
}

export interface GameUpdate {
  target_score?: number
  continue_after_target?: boolean
}

export interface RoundCreate {
  winner_id: string
  score: number
}

export interface RoundUpdate {
  winner_id?: string
  score?: number
}
