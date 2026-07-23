import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useGames, useDeleteGame} from '@/hooks/useGames'
import type {GameRead} from '@/types'


function GameCard({game}: { game: GameRead }) {
    const navigate = useNavigate()
    const deleteGame = useDeleteGame()
    const [confirmDelete, setConfirmDelete] = useState(false)

    const isFinished = game.status === 'finished'
    const date = new Date(game.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
            <span
                className={`inline-block h-2 w-2 rounded-full ${
                    isFinished ? 'bg-slate-500' : 'bg-green-400'
                }`}
            />
                        <span className="text-sm text-slate-400">{date}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-400">
                        Target: {game.target_score} pts
                    </p>
                </div>

                <div className="flex gap-2">
                    {!isFinished && (
                        <button
                            onClick={() => navigate(`/games/${game.id}`)}
                            className="rounded-lg bg-uno-red px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        >
                            Resume
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                        View
                    </button>
                </div>
            </div>

            {/* Delete */}
            <div className="border-t border-slate-700 pt-2">
                {confirmDelete ? (
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">Delete this game?</p>
                        <button
                            onClick={() => deleteGame.mutate(game.id, {onSuccess: () => setConfirmDelete(false)})}
                            disabled={deleteGame.isPending}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                            {deleteGame.isPending ? 'Deleting…' : 'Yes, delete'}
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-xs text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="text-xs text-slate-500 hover:text-red-400"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
}


export function HistoryPage() {
    const {data: games = [], isLoading} = useGames()
    const navigate = useNavigate()
    const [filter, setFilter] = useState<'all' | 'in_progress' | 'finished'>('all')

    const filtered = games
        .filter((g) => filter === 'all' || g.status === filter)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const inProgressCount = games.filter((g) => g.status === 'in_progress').length

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">History</h2>
                <button
                    onClick={() => navigate('/')}
                    className="rounded-lg bg-uno-red px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
                >
                    + New
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
                {([
                    {key: 'all', label: 'All'},
                    {key: 'in_progress', label: `Active${inProgressCount ? ` (${inProgressCount})` : ''}`},
                    {key: 'finished', label: 'Finished'},
                ] as const).map(({key, label}) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                            filter === key
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <p className="text-center text-slate-400">Loading…</p>
            ) : !filtered.length ? (
                <p className="text-center text-slate-400">
                    {filter === 'all' ? 'No games yet' : `No ${filter.replace('_', ' ')} games`}
                </p>
            ) : (
                <div className="space-y-2">
                    {filtered.map((game: GameRead) => (
                        <GameCard key={game.id} game={game}/>
                    ))}
                </div>
            )}
        </div>
    )
}
