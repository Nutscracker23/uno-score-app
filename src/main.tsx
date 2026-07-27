import {StrictMode, Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './App'
import './i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div
      className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">Loading…</div>}>
      <App/>
    </Suspense>
  </StrictMode>,
)
