import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useParties} from '@/hooks/useParties'
import {usePlayers, useCreatePlayer} from '@/hooks/usePlayers'
import {useCreateGame} from '@/hooks/useGames'
import type {Party, Player} from '@/types'

// ─── Player Selector ──────────────────────────────────────────────────────────

function PlayerSelector({
                            selected,
                            onChange,
                        }: {
    selected: string[]
    onChange: (ids: string[]) => void
}) {
    const {data: players = []} = usePlayers()
    const createPlayer = useCreatePlayer()
    const [newName, setNewName] = useState('')

    const toggle = (id: string) =>
        onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

    const handleCreate = async () => {
        const trimmed = newName.trim()
        if (!trimmed) return
        const player = await createPlayer.mutateAsync({name: trimmed})
        onChange([...selected, player.id])
        setNewName('')
    }

    return (
        <div className="space-y-3">
            {/* Saved players */}
            {players.length > 0 && (
                <div>
                    <p className="mb-2 text-xs text-slate-400">Saved players</p>
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
                    placeholder="New player name"
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-uno-red focus:outline-none"
                />
                <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || createPlayer.isPending}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-50"
                >
                    Add
                </button>
            </div>

            {/* Selected */}
            {selected.length > 0 && (
                <div>
                    <p className="mb-2 text-xs text-slate-400">In game ({selected.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {selected.map((id) => {
                            const player = players.find((p) => p.id === id)
                            return (
                                <span
                                    key={id}
                                    className="flex items-center gap-1 rounded-full bg-uno-red/20 px-3 py-1 text-sm text-uno-red"
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

// ─── Party Quick Select ───────────────────────────────────────────────────────

function PartyQuickSelect({
                              parties,
                              onSelect,
                          }: {
    parties: Party[]
    onSelect: (ids: string[]) => void
}) {
    const [open, setOpen] = useState(false)

    if (!parties.length) return null

    return (
        <div>
            <button
                onClick={() => setOpen((v) => !v)}
                className="text-sm text-uno-red hover:underline"
            >
                {open ? 'Hide parties' : '⚡ Quick select from party'}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
    const navigate = useNavigate()
    const {data: parties = []} = useParties()
    const createGame = useCreateGame()

    const [targetScore, setTargetScore] = useState(1000)
    const [playerIds, setPlayerIds] = useState<string[]>([])
    const [continueAfterTarget, setContinueAfterTarget] = useState(false)

    const handleStart = () => {
        if (playerIds.length < 2) return
        createGame.mutate(
            {target_score: targetScore, continue_after_target: continueAfterTarget, player_ids: playerIds},
            {onSuccess: (game) => navigate(`/games/${game.id}`)},
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">New game</h2>

            {/* Target score */}
            <div>
                <label className="mb-1 block text-sm text-slate-400">Target score</label>
                <input
                    type="number"
                    min={100}
                    step={100}
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-uno-red focus:outline-none"
                />
            </div>
            <div
                className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-800 px-3 py-2">
                <span className="text-sm text-slate-300">Continue after target</span>
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
            <PartyQuickSelect parties={parties} onSelect={setPlayerIds}/>

            {/* Player selector */}
            <div>
                <label className="mb-2 block text-sm text-slate-400">Players</label>
                <PlayerSelector selected={playerIds} onChange={setPlayerIds}/>
            </div>

            <button
                onClick={handleStart}
                disabled={playerIds.length < 2 || createGame.isPending}
                className="w-full rounded-lg bg-uno-red py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
                {createGame.isPending ? 'Starting…' : `Start game · ${playerIds.length} players`}
            </button>
        </div>
    )
}
