# Architecture Context

## Stack

| Layer | Technology | Role |
| ----- | ---------- | ---- |
| Framework | Next.js 16 App Router + TypeScript | Routes, layouts, RSC where useful |
| UI | Tailwind v4 + Base UI + CVA | Design tokens and primitives |
| State | Zustand | Per-feature client stores |
| Forms | react-hook-form + Zod | Validation and submit flows |
| HTTP | Native `fetch` | Direct browser → backend (no BFF) |
| Auth | Bearer tokens in localStorage | Session restore + refresh |
| Tests | Vitest / Playwright | Unit + E2E |

## System Boundaries

| Area | Path | Responsibility |
| ---- | ---- | -------------- |
| Routes | `src/app/` | Thin pages and layouts only |
| Features | `src/features/<domain>/` | Domain UI, schemas, stores, types |
| Shared UI | `src/components/{ui,layout,shared}/` | Primitives and app chrome |
| API | `src/lib/api/` | `backendFetch`, `apiClient`, `*.endpoints.ts` |
| Auth helpers | `src/lib/auth/` | Token refresh timer |
| Providers | `src/providers/` | Session bootstrap |

## Request Model

- The browser calls the backend directly (`NEXT_PUBLIC_BACKEND_URL`).
- There is no Next.js API proxy for domain CRUD.
- Unauthenticated calls use `backendFetch`.
- Authenticated calls use `apiClient` (Bearer + 401 refresh retry).
- Endpoint modules return raw `Response` (stores/pages parse JSON).
- See `api-client-context.md` for full details.

## Feature Module Shape

Each domain under `src/features/<domain>/` typically has:

```
components/   # screens, forms, dialogs
schemas/      # Zod + mappers to API inputs
store/        # Zustand store
types.ts      # DTOs and status unions
```

App Router pages import a feature dashboard/content component and stay thin.

## Auth Model

- Session key: `bf_session` → `{ user, accessToken, refreshToken, expiresAt }`.
- `SessionInitializer` restores session and starts the token timer on app load.
- `AuthGuard` redirects unauthenticated users to `/login`.
- Login/register responses do not reliably include roles; role-aware nav is incomplete.
- Frontend role checks are UX only — backend enforces authorization.

## Layout Boundaries

| Segment | Layout | Chrome |
| ------- | ------ | ------ |
| Marketing (`/`, `/businesses`) | Root | `Navbar` and/or `MobileTabBar` |
| Auth (`(auth)`) | Passthrough | Auth brand panels only |
| Dashboard (`(dashboard)`) | `AuthGuard` + shell | `Sidebar` + `MobileTabBar` |

## Invariants

1. Do not add a Next.js BFF for features that already call the backend directly.
2. Domain HTTP lives in `src/lib/api/endpoints/*.endpoints.ts` — not inside components.
3. Stores own loading/error/Persian messages; endpoints stay transport-only.
4. Pages stay thin — business logic and UI composition live in features.
5. Shared primitives live in `src/components/ui`; domain UI stays in features.
6. Prefer design tokens from `globals.css` over raw color utilities for brand/surfaces.
7. RTL (`lang="fa"`, `dir="rtl"`) is the default; do not break mirroring.
8. Do not invent booking/services/customers behavior without contracts in `PROJECT_INVENTORY.md`.
