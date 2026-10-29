# Frontend progress

**Last updated:** 2026-10-30  
**Current task:** `context/current-issues.md` — Services UX + sidebar — **Complete**  
**Prior:** Install Modam font — complete

---

# Services UX polish (`current-issues.md`)

| Area | Status |
|------|--------|
| Modal: Persian price + تومان, duration chips 5–240 | Done |
| Modal: dirty Esc/overlay confirm, X, autofocus, RTL actions | Done |
| Page: breadcrumb, count badge, 2-col grid, initials, toast | Done |
| Sidebar: avatar, clearer logout, active rail kept | Done |
| Shared: `AppToast`, `Input.requiredMark`, dialog close at `start` | Done |

---

# Typography — Modam

## Delivered

| Area | Status |
|------|--------|
| Font files | 8 weights in `src/fonts/modam/` |
| Load | `next/font/local` in `src/app/layout.tsx` (`--font-modam`) |
| Body / display stacks | Modam primary; Inter / Fraunces Latin fallbacks |
| Removed | `@fontsource-variable/estedad` |
| Docs | `context/ui-context.md` updated |

## Verify

```bash
npx tsc --noEmit
npm run build
```

---

# Services management (`01-Services-Management.md`) — previously complete

## Delivered

| Area | Status |
|------|--------|
| `/dashboard/services` | Wired to `ServiceDashboard` |
| List | `GET /api/business/{id}/services` via `backendFetch` |
| Create | `POST .../services` + form dialog |
| Edit | `PUT .../services/{id}` + same form |
| Delete | `DELETE .../services/{id}` + `ConfirmDialog` |
| Empty / loading / error / notice | Mirrored employee dashboard patterns |
| Business gate | Uses `useBusinessStore.fetchMine`; CTA to `/dashboard/business` |

## Files

| Path | Role |
|------|------|
| `src/features/service/types.ts` | `ServiceDto`, `ServiceInput` |
| `src/features/service/schemas/service.schema.ts` | Zod + `toServiceInput` |
| `src/features/service/store/service-store.ts` | Zustand CRUD |
| `src/features/service/components/service-form-dialog.tsx` | Create/edit dialog |
| `src/features/service/components/service-dashboard.tsx` | Page UI |
| `src/lib/api/endpoints/service.endpoints.ts` | Transport |
| `src/app/(dashboard)/dashboard/services/page.tsx` | Thin route |
| `context/api-client-context.md` | Documented module |
| `context/PROJECT_INVENTORY.md` | Marked wired |
| `context/progress-tracker.md` | This report |

## Not in this task

- Tests (spec forbids)
- Public business detail catalog UI
- Employee↔service assignment
- Dashboard home quick-action card for services

## Verify

```bash
npx tsc --noEmit
npm run build
```

---

# Business module (`context/business-test.md`) — previously complete

See prior section history: Vitest 51 + Playwright business 4 pass / 1 skip. No production business changes in that task.

---

# Auth summary (`context/auth-test.md`) — previously complete

Vitest auth + Playwright login suite green; real-backend E2E needs `E2E_TEST_*`.
