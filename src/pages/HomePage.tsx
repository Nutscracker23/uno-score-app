import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useParties } from '@/hooks/useParties'
import { usePlayers, useCreatePlayer } from '@/hooks/usePlayers'
import { useCreateGame } from '@/hooks/useGames'
import type { Party, Player } from '@/types'
import { useTranslation } from 'react-i18next'

function PlayerSelector({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const { data: players = [] } = usePlayers()
  const createPlayer = useCreatePlayer()
  const [newName, setNewName] = useState('')
  const { t } = useTranslation('game')
  const { t: tActions } = useTranslation('common', { keyPrefix: 'actions' })

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  const handleCreate = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const player = await createPlayer.mutateAsync({ name: trimmed })
    onChange([...selected, player.id])
    setNewName('')
  }

  return (
    <div className="space-y-3">
      {/* Saved players */}
      {players.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-slate-400">{t('savedPlayers')}</p>
          <div className="flex flex-wrap gap-2">
            {players.map((p: Player) => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selected.includes(p.id)
                    ? 'bg-uno-red text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add new player */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder={t('newPlayerName')}
          className="focus:border-uno-red flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || createPlayer.isPending}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-50"
        >
          {tActions('add')}
        </button>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-slate-400">{t('inGame', { count: selected.length })}</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const player = players.find((p) => p.id === id)
              return (
                <span
                  key={id}
                  className="bg-uno-red/20 text-uno-red flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                >
                  {player?.name ?? id}
                  <button
                    onClick={() => onChange(selected.filter((x) => x !== id))}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PartyQuickSelect({
  parties,
  onSelect,
}: {
  parties: Party[]
  onSelect: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('game')

  if (!parties.length) return null

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="text-uno-red text-sm hover:underline">
        {open ? t('hideParties') : `⚡ ${t('quickSelectParty')}`}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {parties.map((party) => (
            <button
              key={party.id}
              onClick={() => {
                onSelect(party.players.map((p) => p.id))
                setOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-left hover:border-slate-400"
            >
              <span className="font-medium">{party.name}</span>
              <span className="text-xs text-slate-400">
                {party.players.map((p) => p.name).join(', ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: parties = [] } = useParties()
  const createGame = useCreateGame()
  const { t } = useTranslation('game')

  const [targetScore, setTargetScore] = useState(1000)
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [continueAfterTarget, setContinueAfterTarget] = useState(false)

  const handleStart = () => {
    if (playerIds.length < 2) return
    createGame.mutate(
      {
        target_score: targetScore,
        continue_after_target: continueAfterTarget,
        player_ids: playerIds,
      },
      { onSuccess: (game) => navigate(`/games/${game.id}`) },
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('newGame')}</h2>

      {/* Target score */}
      <div>
        <label className="mb-1 block text-sm text-slate-400">{t('targetScore')}</label>
        <input
          type="number"
          inputMode="numeric"
          min={100}
          step={100}
          value={targetScore}
          onChange={(e) => setTargetScore(Number(e.target.value))}
          className="focus:border-uno-red w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-800 px-3 py-2">
        <span className="text-sm text-slate-300">{t('continueAfterTarget')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={continueAfterTarget}
          onClick={() => setContinueAfterTarget((v) => !v)}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
            continueAfterTarget ? 'bg-uno-red' : 'bg-slate-600'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              continueAfterTarget ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Party quick select */}
      <PartyQuickSelect parties={parties} onSelect={setPlayerIds} />

      {/* Player selector */}
      <div>
        <label className="mb-2 block text-sm text-slate-400">{t('players')}</label>
        <PlayerSelector selected={playerIds} onChange={setPlayerIds} />
      </div>

      <button
        onClick={handleStart}
        disabled={playerIds.length < 2 || createGame.isPending}
        className="bg-uno-red w-full rounded-lg py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {createGame.isPending
          ? t('startingGame')
          : `${t('startGame')} · ${t('playersCount', { count: playerIds.length })}`}
      </button>
    </div>
  )
}
