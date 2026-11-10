# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated domains in one component or store.
- Respect boundaries in `architecture-context.md`.
- Prefer reusing shared UI from `shared-components.md`.

## TypeScript

- Strict mode throughout.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at parse boundaries (store/schema layer).
- Colocate DTOs in `features/<domain>/types.ts`.

## Next.js

- Read `node_modules/next/dist/docs/` before using unfamiliar APIs (Next 16 differs from older docs).
- Keep `app/**/page.tsx` thin — compose feature components.
- Add `"use client"` only when hooks, events, or browser APIs are required.
- Do not introduce a BFF for CRUD that already uses `apiClient` / `backendFetch`.

## Styling

- Prefer CSS variables / `@theme` tokens from `globals.css`.
- Match existing radius, spacing, and card patterns in dashboard UI.
- Keep RTL correct; user-facing strings are Persian by default.
- Light theme only — do not add dark-mode scaffolding unless asked.

## API & State

- Endpoints: transport only (`*.endpoints.ts`).
- Stores: loading, parse, Persian errors, success notices.
- Authenticated calls go through `apiClient`; public/auth bootstrap through `backendFetch`.
- Never hardcode the backend host — use `BACKEND_BASE_URL`.
- Multipart uploads: `FormData` + do not set `Content-Type`.
- Owner business creation must use register endpoint, not Admin `POST /api/business`.

## Forms

- Zod schema in `features/*/schemas/`.
- `react-hook-form` + `zodResolver`.
- Map form values to API inputs via helpers (`toBusinessInput`, etc.).
- Show API failures with `AuthError`.

## File Organization

| Path | Contains |
| ---- | -------- |
| `src/app/` | Routes and layouts only |
| `src/features/` | Domain UI, schemas, stores, types |
| `src/components/ui/` | Design-system primitives |
| `src/components/layout/` | Shell chrome |
| `src/components/shared/` | Cross-feature feedback |
| `src/lib/api/` | HTTP client and endpoints |
| `src/lib/auth/` | Token timer / auth utilities |
| `src/providers/` | App-wide providers |

Name files after responsibility, not after a library.

<!-- ## Testing

- Unit/component: Vitest + Testing Library under colocated `*.test.ts(x)`.
- E2E: Playwright under `tests/`.
- Mock API in unit tests; do not use production credentials.
- Prefer accessible queries and observable behavior. -->

## Protected Foundation

Do not casually rewrite `src/components/ui/*` foundation primitives. Extend via composition in features/shared unless the task explicitly requires a primitive change.
