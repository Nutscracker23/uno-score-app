import {useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import type {Round, Standing} from '@/types'
import {useAddRound, useDeleteRound, useFinishGame, useGame, useUpdateGame, useUpdateRound} from '@/hooks/useGames'
import {useTranslation} from "react-i18next";


function StandingsTable({
                          standings,
                          targetScore,
                          continueAfterTarget,
                        }: {
  standings: Standing[]
  targetScore: number,
  continueAfterTarget: boolean,
}) {
  const sorted = [...standings].sort((a, b) => b.score - a.score)
  const {t} = useTranslation('game');

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-800">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-slate-400">#</th>
          <th className="px-4 py-2 text-left font-medium text-slate-400">{t('player')}</th>
          <th className="px-4 py-2 text-right font-medium text-slate-400">{t('score')}</th>
          <th className="px-4 py-2 text-right font-medium text-slate-400">{t('wins')}</th>
        </tr>
        </thead>
        <tbody>
        {sorted.map((s, i) => {
          const isLeading = i === 0
          const nearTarget = s.score >= targetScore * 0.8
          return (
            <tr key={s.player_id} className="border-t border-slate-700">
              <td className="px-4 py-2 text-slate-400">{i + 1}</td>
              <td className="px-4 py-2 font-medium">
                {isLeading && <span className="mr-1">🏆</span>}
                {s.name}
              </td>
              <td className={`px-4 py-2 text-right font-mono font-semibold ${nearTarget ? 'text-yellow-400' : ''}`}>
                {s.score}
                {!continueAfterTarget ? <span className="ml-1 text-xs text-slate-500">/ {targetScore}</span> : ''}
              </td>
              <td className="px-4 py-2 text-right text-slate-400">{s.rounds_won}</td>
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  )
}


function AddRoundForm({
                        gameId,
                        standings,
                      }: {
  gameId: string
  standings: Standing[]
}) {
  const [winnerId, setWinnerId] = useState('')
  const [score, setScore] = useState('')
  const addRound = useAddRound(gameId)
  const {t} = useTranslation('game')
  const {t: tActions} = useTranslation('actions')

  const handleSubmit = () => {
    if (!winnerId || !score) return
    addRound.mutate(
      {winner_id: winnerId, score: Number(score)},
      {
        onSuccess: () => {
          setWinnerId('')
          setScore('')
        },
      },
    )
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-3">
      <h3 className="font-medium">{t('addRound')}</h3>

      <div>
        <label className="mb-2 block text-sm text-slate-400">{t('winner')}</label>
        <div className="flex flex-wrap gap-2">
          {standings.map((s) => (
            <button
              key={s.player_id}
              onClick={() => setWinnerId(s.player_id)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                winnerId === s.player_id
                  ? 'bg-uno-red text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">{t('scoreCollected')}</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-center font-mono text-white placeholder-slate-400 focus:border-uno-red focus:outline-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!winnerId || !score || addRound.isPending}
        className="w-full rounded-lg bg-uno-red py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {addRound.isPending ? tActions('saving') : t('addRound')}
      </button>
    </div>
  )
}


function RoundRow({
                    round,
                    gameId,
                    standings,
                  }: {
  round: Round
  gameId: string
  standings: Standing[]
}) {
  const [editing, setEditing] = useState(false)
  const [winnerId, setWinnerId] = useState(round.winner_id)
  const [score, setScore] = useState(String(round.score))
  const updateRound = useUpdateRound(gameId)
  const deleteRound = useDeleteRound(gameId)

  const winnerName = standings.find((s) => s.player_id === round.winner_id)?.name ?? '?'

  const handleSave = () => {
    updateRound.mutate(
      {roundId: round.id, winner_id: winnerId, score: Number(score)},
      {onSuccess: () => setEditing(false)},
    )
  }

  const {t: tActions} = useTranslation('common', {keyPrefix: 'actions'})

  if (editing) {
    return (
      <div className="border-t border-slate-700 px-4 py-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {standings.map((s) => (
            <button
              key={s.player_id}
              onClick={() => setWinnerId(s.player_id)}
              className={`rounded-full px-3 py-1 text-sm ${
                winnerId === s.player_id
                  ? 'bg-uno-red text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="numeric"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-center font-mono text-white focus:border-uno-red focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-slate-600 py-1.5 text-sm text-slate-400 hover:text-white"
          >
            {tActions('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={updateRound.isPending}
            className="flex-1 rounded-lg bg-uno-red py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {tActions('save')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <tr className="border-t border-slate-700">
      <td className="px-4 py-2 text-slate-400">{round.round_number}</td>
      <td className="px-4 py-2 font-medium">{winnerName}</td>
      <td className="px-4 py-2 text-right font-mono">{round.score}</td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={() => setEditing(true)}
          className="mr-2 text-xs text-slate-400 hover:text-white"
        >
          {tActions('editShort')}
        </button>
        <button
          onClick={() => deleteRound.mutate(round.id)}
          disabled={deleteRound.isPending}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {tActions('deleteShort')}
        </button>
      </td>
    </tr>
  )
}


function RoundsHistory({
                         rounds,
                         gameId,
                         standings,
                       }: {
  rounds: Round[]
  gameId: string
  standings: Standing[]
}) {
  const {t} = useTranslation('game')

  if (!rounds.length) return null

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-800">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-slate-400">{t('round')}</th>
          <th className="px-4 py-2 text-left font-medium text-slate-400">{t('winner')}</th>
          <th className="px-4 py-2 text-right font-medium text-slate-400">{t('score')}</th>
          <th className="px-4 py-2 text-right font-medium text-slate-400"></th>
        </tr>
        </thead>
        <tbody>
        {[...rounds]
          .sort((a, b) => b.round_number - a.round_number)
          .map((round) => (
            <RoundRow
              key={round.id}
              round={round}
              gameId={gameId}
              standings={standings}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}


function WinnerBanner({standings, winnerId}: { standings: Standing[]; winnerId: string }) {
  const {t} = useTranslation('game')

  const winner = standings.find((s) => s.player_id === winnerId)

  if (!winner) return null


  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
      <p className="text-2xl">🎉</p>
      <p className="mt-1 text-lg font-bold text-yellow-400">{t('game_winner', {name: winner.name})}</p>
      {/*<p className="text-sm text-slate-400">{winner.score} points · {winner.rounds_won} rounds won</p>*/}
      <p className="text-sm text-slate-400">{t('pointsWon', {score: winner.score, rounds: winner.rounds_won})}</p>
    </div>
  )
}


export function GameDetailPage() {
  const {id} = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {data: game, isLoading} = useGame(id!)
  const finishGame = useFinishGame()
  const updateGame = useUpdateGame()
  const {t} = useTranslation('game')
  const {t: tActions} = useTranslation('common', {keyPrefix: 'actions'})

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">{tActions('loading')}</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center">
        <p className="text-slate-400">Game not found</p>
        <button onClick={() => navigate('/')} className="mt-2 text-sm text-uno-red hover:underline">
          Go home
        </button>
      </div>
    )
  }

  const isFinished = game.status === 'finished'
  const leader = [...game.standings].sort((a, b) => b.score - a.score)[0]
  const targetReached = leader && leader.score >= game.target_score && !game.continue_after_target

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {isFinished ? t('finishedGame') : t('roundsHistory', {count: game.rounds.length + 1})}
          </h2>
          <p className="text-sm text-slate-400">
            {t('target')}: {game.target_score} pts · {t('playersCount', {count: game.standings.length})}
          </p>
        </div>

        {!isFinished && (
          <div className="flex gap-2">
            {targetReached && (
              <button
                onClick={() => updateGame.mutate({id: game.id, continue_after_target: true})}
                disabled={updateGame.isPending}
                className="rounded-lg border border-yellow-500/50 px-3 py-1.5 text-sm text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50"
              >
                {t('continue')}
              </button>
            )}
            <button
              onClick={() => finishGame.mutate(game.id, {onSuccess: () => navigate('/history')})}
              disabled={finishGame.isPending}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:border-slate-400 hover:text-white disabled:opacity-50"
            >
              {t('finish')}
            </button>
          </div>
        )}
      </div>

      {/* Winner banner */}
      {isFinished && game.winner_id && (
        <WinnerBanner standings={game.standings} winnerId={game.winner_id}/>
      )}

      {/* Add round */}
      {!isFinished && (
        <AddRoundForm gameId={game.id} standings={game.standings}/>
      )}

      {/* Standings */}
      <StandingsTable standings={game.standings} targetScore={game.target_score}
                      continueAfterTarget={game.continue_after_target}/>

      {/* Rounds history */}
      <RoundsHistory rounds={game.rounds} gameId={game.id} standings={game.standings}/>
    </div>
  )
}
