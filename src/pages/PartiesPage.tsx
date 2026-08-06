import { useState } from 'react'
import { useParties, useCreateParty, useUpdateParty, useDeleteParty } from '@/hooks/useParties'
import {
  usePlayers,
  useCreatePlayer,
  useDetachPlayer,
  useUpdatePlayer,
} from '@/hooks/usePlayers'
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
  const detachPlayer = useDetachPlayer()
  const [newName, setNewName] = useState('')
  const { t } = useTranslation('parties')
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
          placeholder={t('newPlayerName')}
          className="focus:border-uno-red flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || createPlayer.isPending}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600 disabled:opacity-50"
        >
          {tActions('add')}
        </button>
      </div>
    </div>
  )
}

function CreatePartyForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const createParty = useCreateParty()
  const { t } = useTranslation('parties')

  const handleCreate = () => {
    if (!name.trim()) return
    createParty.mutate({ name: name.trim(), player_ids: playerIds }, { onSuccess: onClose })
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
      <h3 className="font-medium">{t('newParty')}</h3>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Party name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friday crew"
          className="focus:border-uno-red w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:outline-none"
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
          className="bg-uno-red flex-1 rounded-lg py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {createParty.isPending ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  )
}

function EditPartyForm({ party, onClose }: { party: Party; onClose: () => void }) {
  const [name, setName] = useState(party.name)
  const [playerIds, setPlayerIds] = useState<string[]>(party.players.map((p) => p.id))
  const updateParty = useUpdateParty()
  const { t: tActions } = useTranslation('common', { keyPrefix: 'actions' })
  const { t } = useTranslation('parties')

  const handleSave = () => {
    updateParty.mutate(
      { id: party.id, name: name.trim(), player_ids: playerIds },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="space-y-4 border-t border-slate-700 px-4 pt-3 pb-4">
      <div>
        <label className="mb-1 block text-sm text-slate-400">{t('partyName')}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus:border-uno-red w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">{t('players')}</label>
        <PlayerSelector selected={playerIds} onChange={setPlayerIds} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-600 py-1.5 text-sm text-slate-400 hover:text-white"
        >
          {tActions('cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || updateParty.isPending}
          className="bg-uno-red flex-1 rounded-lg py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {updateParty.isPending ? tActions('saving') : tActions('save')}
        </button>
      </div>
    </div>
  )
}

function PartyCard({ party }: { party: Party }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const deleteParty = useDeleteParty()
  const { t } = useTranslation('parties')
  const { t: tActions } = useTranslation('common', { keyPrefix: 'actions' })

  return (
    <div className="w-full min-w-full rounded-xl border border-slate-700 bg-slate-800 md:min-w-1/3 md:flex-1">
      <button
        onClick={() => {
          setExpanded((v) => !v)
          setEditing(false)
        }}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{party.name}</span>
        <span className="text-sm text-slate-400">
          {t('playersCount', { count: party.players.length })} {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && !editing && (
        <div className="space-y-3 border-t border-slate-700 px-4 pt-3 pb-4">
          <div className="flex flex-wrap gap-2">
            {party.players.map((p: Player) => (
              <span key={p.id} className="rounded-full bg-slate-700 px-3 py-1 text-sm">
                {p.name}
              </span>
            ))}
            {party.players.length === 0 && (
              <p className="text-sm text-slate-400">{t('noPlayers')}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-slate-400 hover:text-white"
            >
              {tActions('edit')}
            </button>
            <button
              onClick={() => deleteParty.mutate(party.id)}
              disabled={deleteParty.isPending}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {tActions('delete')}
            </button>
          </div>
        </div>
      )}

      {expanded && editing && <EditPartyForm party={party} onClose={() => setEditing(false)} />}
    </div>
  )
}

function PartyBlock() {
  const { data: parties = [], isLoading } = useParties()
  const [creating, setCreating] = useState(false)
  const { t } = useTranslation('parties')
  const { t: tActions } = useTranslation('common', { keyPrefix: 'actions' })

  return (
    <div className="flex max-w-full flex-col flex-wrap space-y-4">
      <div className="flex flex-1 items-center justify-between">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-uno-red rounded-lg px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            + {tActions('new')}
          </button>
        )}
      </div>

      {creating && <CreatePartyForm onClose={() => setCreating(false)} />}

      {isLoading ? (
        <p className="text-center text-slate-400">{t('loading')}</p>
      ) : !parties.length && !creating ? (
        <p className="text-center text-slate-400">{t('noParties')}</p>
      ) : (
        <div className="flex flex-col flex-wrap items-start gap-2 md:flex-row">
          {parties.map((party) => (
            <PartyCard key={party.id} party={party} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayersBlock() {
  const { data: players = [], isLoading } = usePlayers()
  const { t } = useTranslation('parties')
  // const { t: tActions } = useTranslation('common', { keyPrefix: 'actions' })
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex max-w-full flex-col flex-wrap space-y-4">
      <div className="flex flex-1 items-center justify-between">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        {/*{!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-uno-red rounded-lg px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            + {tActions('new')}
          </button>
        )}*/}
      </div>

      {creating && <CreatePartyForm onClose={() => setCreating(false)} />}

      {isLoading ? (
        <p className="text-center text-slate-400">{t('loading')}</p>
      ) : !players.length && !creating ? (
        <p className="text-center text-slate-400">{t('noPlayers')}</p>
      ) : (
        <div className="flex flex-col flex-wrap items-start gap-2 md:flex-row">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerCard({ player }: { player: Player }) {
  const [name, setName] = useState(player.name)
  const detachPlayer = useDetachPlayer()
  const updatePlayer = useUpdatePlayer()
  const { t: tActions } = useTranslation('common', { keyPrefix: 'actions' })
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    updatePlayer.mutate(
      { id: player.id, name: name.trim() },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (editing) {
    return (
      <div className="flex w-full min-w-full flex-wrap items-center justify-between space-y-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 md:min-w-1/3 md:flex-1 lg:min-w-1/4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="ffocus:border-uno-red w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-center font-mono text-white focus:outline-none"
        />
        <div className="flex flex-1 gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-slate-600 py-2 text-sm text-slate-400 hover:text-white"
          >
            {tActions('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={updatePlayer.isPending}
            className="bg-uno-red flex-1 rounded-lg py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {tActions('save')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 md:min-w-1/3 md:flex-1 lg:min-w-1/4">
      <div className="flex items-center gap-3">
        <p className="leading-tight font-medium">{name}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-slate-400 hover:text-white"
        >
          {tActions('edit')}
        </button>
        <button
          onClick={() => detachPlayer.mutate(player.id)}
          disabled={detachPlayer.isPending}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {tActions('delete')}
        </button>
      </div>
    </div>
  )
}

export function PartiesPage() {
  return (
    <div className="space-y-4">
      <PartyBlock />
      <PlayersBlock />
    </div>
  )
}
