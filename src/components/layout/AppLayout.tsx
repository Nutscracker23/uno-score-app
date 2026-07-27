import {Link, Outlet, useLocation} from 'react-router'
import {useLogout} from '@/hooks/useAuth'
import {useAuthStore} from '@/store/authStore'
import {useTranslation} from "react-i18next";

export function AppLayout() {
  const {user} = useAuthStore()
  const logout = useLogout()
  const {pathname} = useLocation()
  const {t: tNav} = useTranslation('common', {keyPrefix: 'nav'})

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        pathname === to ? 'text-white' : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-uno-red">
            🃏 Uno
          </Link>
          <nav className="flex items-center gap-4">
            {navLink('/', tNav('game'))}
            {navLink('/history', tNav('history'))}
            {navLink('/parties', tNav('parties'))}
            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-white"
            >
              {user?.first_name ?? user?.email ?? 'Exit'}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Outlet/>
      </main>
    </div>
  )
}
