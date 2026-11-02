# Frontend progress

**Last updated:** 2026-11-02  
**Current task:** Booking API client (specs 01–11 transport) — **Complete** (types + endpoints only; no UI)
**Prior:** Dashboard options restored on desktop + profile logout — complete

---

# Booking API client (specs 03–11 + assign)

| Area | Status |
|------|--------|
| Types | `features/booking/types.ts` — enums, DTOs, paged results, query params | Done |
| Transport | `booking.endpoints.ts` — availability, auth/guest create, list, mine, detail, status | Done |
| Employee↔service | `list/assign/removeEmployeeServiceRequest` on `employee.endpoints.ts` | Done |
| Store / pages / forms | Deferred — not in this unit | Skipped |

## Files

| Path | Role |
|------|------|
| `src/features/booking/types.ts` | Booking DTOs + enums |
| `src/lib/api/endpoints/booking.endpoints.ts` | HTTP helpers |
| `src/features/employee/types.ts` | `AssignServiceInput` |
| `src/lib/api/endpoints/employee.endpoints.ts` | Assign/list/remove services |
| `context/api-client-context.md` | Documented module |
| `context/PROJECT_INVENTORY.md` | Marked partial (no UI) |

## Verify

```bash
npx tsc --noEmit
```

## Next

Wire store + screens in suggested order: assign UI → availability → create → owner list/detail/status → `/mine`.

---

# Dashboard UI/UX refinement

| Area | Status |
|------|--------|
| Desktop sidebar | Narrower (~232px), refined header/nav/active/hover, user card + logout footer | Done |
| Desktop home | Welcome + sidebar instruction only — no duplicate nav list | Done |
| Mobile home grid | Two-column cards for five destinations; fifth card half-width; logout below | Done |
| Bottom nav | Unchanged | Done |
| Behavior / routes / APIs | Unchanged | Done |

## Files

| Path | Role |
|------|------|
| `src/components/layout/sidebar.tsx` | Desktop sidebar visual refinement |
| `src/app/(dashboard)/dashboard/page.tsx` | Desktop welcome + mobile management grid |
| `context/ui-context.md` | Dashboard layout notes updated |

## Verify

```bash
npx tsc --noEmit
```

---

# Mobile dashboard chrome

| Area | Status |
|------|--------|
| Dashboard home menu | Replaced شروع سریع / وضعیت حساب with nav links (profile, business, employees, services, customers) + mobile logout | Done (superseded by grid refinement above) |
| Glass `PageHeader` | Fixed mobile bar: back icon + centered title + `backdrop-blur`; desktop layout unchanged | Done |
| Sidebar | Hidden on mobile (`md:flex` only) — tab bar + home menu cover nav | Done |
| Breadcrumbs | Desktop-only on customers / services / employees (glass header covers mobile) | Done |

## Files

| Path | Role |
|------|------|
| `src/app/(dashboard)/dashboard/page.tsx` | Mobile/desktop dashboard home |
| `src/components/shared/page-header.tsx` | Glass mobile header + desktop header |
| `src/components/layout/sidebar.tsx` | Desktop-only chrome |

## Verify

```bash
npx tsc --noEmit
```

---

# Customers CRM (`03` + `04`)

| Area | Status |
|------|--------|
| Store | `useCustomerStore` — list / create / update / remove | Done |
| List | Search, filters, sort, pagination, soft-delete | Done |
| Create / edit | `CustomerFormDialog` + Zod schema | Done |
| Detail | `CustomerDetailDialog` via `getCustomerRequest`; edit / delete / reactivate | Done |

## Files

| Path | Role |
|------|------|
| `src/features/customer/store/customer-store.ts` | Zustand CRM store |
| `src/features/customer/schemas/customer.schema.ts` | Zod + phone/email helpers |
| `src/features/customer/components/customer-form-dialog.tsx` | Create/edit |
| `src/features/customer/components/customer-detail-dialog.tsx` | Detail drawer |
| `src/features/customer/components/customer-dashboard.tsx` | List + wiring |
| `src/app/(dashboard)/dashboard/customers/page.tsx` | Thin route |

## Verify

```bash
npx tsc --noEmit
```

---

# Shared Select dropdown

| Area | Status |
|------|--------|
| `src/components/ui/select.tsx` | Base UI Select wrappers + `SelectField` convenience API | Done |
| Schedule modal | Native `<select>` replaced with `SelectField` (time range) | Done |
| Docs | `shared-components.md` inventory + import example | Done |

## Verify

```bash
npx tsc --noEmit
```

---

# Staff page UX (`feature-specs/02-staff-page.md`)

| Area | Status |
|------|--------|
| Date-based schedule update | Jalali calendar picker converts selected dates to/from Gregorian ISO; working-hours payloads and overlap/listing/copy/undo now use `date` instead of `dayOfWeek` | Done |
| Staff page | Breadcrumb, employee-count badge, responsive 1/2-column staff cards, RTL Persian/localized-digit schedule summaries, empty/loading/error states | Done |
| Staff identity | Avatar initials, normalized phone display, current-user `شما` badge | Done |
| Staff actions | Clear schedule action, 40px delete target, named confirmation dialog | Done |
| Add-staff dialog | Autofocus, live Persian/Arabic digit normalization and `0912 345 6789` formatting, inline validation, valid-only submit/loading state | Done |
| Working-hours dialog | Jalali date picker, 30-minute 24-hour dropdowns, multiple intervals, date-scoped overlap/end-time validation, presets, copy previous date/next six days, saving indicator, and closed-date state | Done |
| Schedule removal | 40px target plus a timed undo toast (recreates the deleted interval) | Done |
| Accessibility | Existing Base UI dialog focus trap / Esc / modal semantics retained; labelled controls and visible focus styles added | Done |

## Deferred: backend-dependent lookup/invitation

The requested debounced user lookup and **send invite** flow are intentionally not implemented: the documented API inventory exposes only `POST /api/business/{id}/employees` (which links an existing user by phone), with no safe lookup or invitation endpoint/contract. The existing add-by-phone request remains functional. Confirm the backend API before adding lookup or invitation transport.

## Verify

```bash
npx tsc --noEmit
npm run build
```

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
