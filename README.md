# UnoScore

UnoScore is a public pet project and PWA for tracking Uno scores: create games, add rounds,
manage players and saved player groups, and browse completed-game history.

The interface is available in English, Russian, and Ukrainian.

## Project status

This is an educational and experimental project under active development, not a hosted,
production-ready service. The repository contains the frontend; it requires a separately
running backend.

## Features

- Authentication with session restoration through a refresh request.
- Create and finish games; add, edit, and delete rounds.
- Manage players and player groups.
- Browse completed-game history.
- Protected routes: except for `/login`, unauthenticated users are redirected to the login
  page.
- PWA manifest, automatic service-worker updates, and caching for static assets and locale
  files.

## Stack

- React 19, TypeScript, and Vite 8
- Tailwind CSS 4
- TanStack React Query, Zustand, and Axios
- React Router, i18next, and `vite-plugin-pwa`
- Dexie for client-side offline storage

## Run locally

Node.js and npm are required.

```bash
cp .env.example .env
npm ci
npm run dev
```

Vite serves the app at `http://localhost:5173`. When `VITE_API_URL` is unset, the client
uses `http://localhost:8000`; API requests use the `/api/v1` path.

## Commands

| Command                | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start Vite in development mode                           |
| `npm run build`        | Type-check with TypeScript and create a production build |
| `npm run preview`      | Serve the production build locally                       |
| `npm run lint`         | Run ESLint with no warnings allowed                      |
| `npm run format:check` | Check formatting with Prettier                           |
| `npm run format`       | Format files with Prettier                               |

No test runner or test command is configured yet.

## Public source code and environment variables

Use `.env.example` as the local configuration template. `.env` is ignored by Git and must
not contain secrets. Variables prefixed with `VITE_` are included in the browser build, so
they must never hold keys, passwords, or tokens.

A license file has not been added yet.

## Docker

The Compose service exposes Vite on port `5173` and uses the external Docker network
`uno-score`. Create it once, then start the container:

```bash
docker network create uno-score
docker compose up --build
```

`VITE_API_URL` is set to `http://localhost:8000` inside the container.

## Project structure

```text
src/
├── api/         # Axios client and API modules
├── components/  # Reusable components and layout
├── hooks/       # React Query and application hooks
├── offline/     # Dexie storage and queue synchronization
├── pages/       # Route components
├── store/       # Zustand state
└── types/       # Shared TypeScript types
```

Translations live in `public/locales/{en,ru,uk}`. The `@/` alias resolves to `src/`.

## PWA, offline behavior, and the API contract

The Vite PWA caches static assets, locales, and configured API responses. The project also
contains Dexie storage and a hook for retrying queued operations, but they are not yet wired
into `App` or the Axios client. Therefore, this README does not claim that fully functional
offline editing is available.

For safe synchronization, the backend must support idempotent mutations, refresh cookies,
and temporary-ID mapping. The full contract and error-handling rules are described in
[docs/backend-requirements.md](docs/backend-requirements.md).
