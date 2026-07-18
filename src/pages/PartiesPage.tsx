import { useState } from 'react'
import { useParties, useCreateParty, useUpdateParty, useDeleteParty } from '@/hooks/useParties'
import {usePlayers, useCreatePlayer, useDetachPlayer} from '@/hooks/usePlayers'
import type { Party, Player } from '@/types'

// ─── Player Selector ──────────────────────────────────────────────────────────

function PlayerSelector({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const { data: players = [] } = usePlayers()
  const createPlayer = useCreatePlayer()
  const detachPlayer = useDetachPlayer()
  const [newName, setNewName] = useState('')

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
    <div className="space-y-2">
      {/* Existing players */}
      {players.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                selected.includes(p.id)
                  ? 'bg-uno-red text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {p.name}
              {!selected.includes(p.id) && (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    detachPlayer.mutate(p.id)
                  }}
                  className="ml-1 text-slate-400 hover:text-red-400"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Create new player inline */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="New player name"
          className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-uno-red focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || createPlayer.isPending}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Create Form ──────────────────────────────────────────────────────────────

function CreatePartyForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const createParty = useCreateParty()

  const handleCreate = () => {
    if (!name.trim()) return
    createParty.mutate(
      { name: name.trim(), player_ids: playerIds },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-4">
      <h3 className="font-medium">New party</h3>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Party name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friday crew"
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-uno-red focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">Players</label>
        <PlayerSelector selected={playerIds} onChange={setPlayerIds} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-600 py-2 text-sm text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || createParty.isPending}
          className="flex-1 rounded-lg bg-uno-red py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {createParty.isPending ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  )
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

function EditPartyForm({ party, onClose }: { party: Party; onClose: () => void }) {
  const [name, setName] = useState(party.name)
  const [playerIds, setPlayerIds] = useState<string[]>(party.players.map((p) => p.id))
  const updateParty = useUpdateParty()

  const handleSave = () => {
    updateParty.mutate(
      { id: party.id, name: name.trim(), player_ids: playerIds },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="space-y-4 border-t border-slate-700 px-4 pb-4 pt-3">
      <div>
        <label className="mb-1 block text-sm text-slate-400">Party name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-uno-red focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">Players</label>
        <PlayerSelector selected={playerIds} onChange={setPlayerIds} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-600 py-1.5 text-sm text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || updateParty.isPending}
          className="flex-1 rounded-lg bg-uno-red py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {updateParty.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Party Card ───────────────────────────────────────────────────────────────

function PartyCard({ party }: { party: Party }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const deleteParty = useDeleteParty()

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800">
      <button
        onClick={() => { setExpanded((v) => !v); setEditing(false) }}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{party.name}</span>
        <span className="text-sm text-slate-400">
          {party.players.length} players {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && !editing && (
        <div className="border-t border-slate-700 px-4 pb-4 pt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {party.players.map((p: Player) => (
              <span key={p.id} className="rounded-full bg-slate-700 px-3 py-1 text-sm">
                {p.name}
              </span>
            ))}
            {party.players.length === 0 && (
              <p className="text-sm text-slate-400">No players yet</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => deleteParty.mutate(party.id)}
              disabled={deleteParty.isPending}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {expanded && editing && (
        <EditPartyForm party={party} onClose={() => setEditing(false)} />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PartiesPage() {
  const { data: parties = [], isLoading } = useParties()
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Parties</h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-uno-red px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            + New
          </button>
        )}
      </div>

      {creating && <CreatePartyForm onClose={() => setCreating(false)} />}

      {isLoading ? (
        <p className="text-center text-slate-400">Loading…</p>
      ) : !parties.length && !creating ? (
        <p className="text-center text-slate-400">No parties yet</p>
      ) : (
        <div className="space-y-2">
          {parties.map((party) => (
            <PartyCard key={party.id} party={party} />
          ))}
        </div>
      )}
    </div>
  )
}
