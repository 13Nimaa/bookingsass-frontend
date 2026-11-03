# Frontend progress

**Last updated:** 2026-11-03  
**Current task:** Edit Employee Service Overrides (`Phase 4`) — **Complete**  
**Prior:** Assign Services to an Employee (Phase 3) — complete

---

# Edit Employee Service Overrides (Phase 4)

| Area | Status |
|------|--------|
| Entry point | Drawer card Edit opens `EditEmployeeServiceDialog` for the selected employee-service; Remove remains unwired |
| Reference UI | Service title, salon default price/duration, current effective values, and inherited-vs-custom copy |
| Controls | Independent custom price and duration fields; empty = inherit default; per-field reset buttons |
| Patch semantics | Only intentionally changed fields are sent; explicit `null` resets; unchanged fields omitted; empty patch is a no-op |
| Validation | Price integer ≥ 0; duration positive integer when provided; field-level Zod errors |
| Transport | `PUT /api/employees/{employeeId}/services/{serviceId}` via `updateEmployeeServiceRequest` |
| Cache | Force-refreshes only the selected employee after success; failures leave cache untouched and keep the modal open |
| Duplicate submits | Store-level `updatingService` guard + disabled controls while saving |
| Feedback | Persian success toast in the drawer; inline error inside the modal on failure |

## Files

| Path | Role |
|------|------|
| `src/features/employee/components/edit-employee-service-dialog.tsx` | Edit overrides modal |
| `src/features/employee/components/employee-services-drawer.tsx` | Wires Edit action + success toast; resolves service from live cache |
| `src/features/employee/store/employee-store.ts` | `updateEmployeeService`, `updatingService` |
| `src/features/employee/types.ts` | `UpdateEmployeeServiceInput` |
| `src/features/employee/schemas/employee-service.schema.ts` | Override form schema + sparse PUT mapper |
| `src/lib/api/endpoints/employee.endpoints.ts` | `updateEmployeeServiceRequest` |
| `context/api-client-context.md` | Types + wiring notes |
| `context/PROJECT_INVENTORY.md` | PUT endpoint marked wired |

## Tests

| File | Covers |
|------|--------|
| `src/features/employee/schemas/employee-service.schema.test.ts` | Omit unchanged, independent reset/`null`, Persian digits, validation |
| `src/features/employee/store/employee-store.test.ts` | Update refresh isolation, null reset, empty patch, failure cache safety, duplicate guard |
| `src/features/employee/components/edit-employee-service-dialog.test.tsx` | Reference UI, price-only patch, independent reset, failed update stays open |

## Verify

```bash
npx tsc --noEmit
npx eslint src/features/employee src/lib/api/endpoints/employee.endpoints.ts
npx vitest run
npm run build
```

Result: TypeScript + ESLint clean; Vitest 15 files / 89 tests pass; production build succeeds.

## Remaining / out of scope

Remove Service is intentionally not implemented. No existing API contracts or backend code changed beyond adding the already-specified PUT transport. E2E against a real backend was not run (no `E2E_TEST_*` credentials in this task).

---

# Assign Services to an Employee (Phase 3)

| Area | Status |
|------|--------|
| Entry point | Both drawer Add actions open `AddEmployeeServiceDialog`; drawer shell and layout unchanged. The header action is disabled until the assigned-services list has loaded so the exclusion set is always available |
| Available services | Existing `useServiceStore.fetchServices` loads the business catalog only when the modal is open and the store is idle; StrictMode re-runs cannot double-fetch |
| Selectable list | Already-assigned service ids are excluded via the drawer's per-employee cache; each row shows title + default price + default duration |
| States | Loading skeletons; load error + retry (never shown as empty); empty business catalog; "all services already assigned"; selection validation |
| Selection | Checkbox multi-select with a selected counter; optional per-service override fields appear inline only after selection |
| Overrides | Price and duration are independent; empty fields are omitted from the request so defaults are inherited; Persian/Arabic digits accepted and normalized |
| Validation | Zod (`employeeServiceAssignmentSchema`) + `Input` errors; price integer ≥ 0; duration 5–240; at least one service required |
| Transport | One `POST /api/employees/{employeeId}/services` per selected service with `{ serviceId, priceOverride?, durationMinutesOverride? }`; no null/unnecessary overrides |
| Partial failure | Each request settles independently; mixed result lists failed service titles + messages, keeps failed rows selected for retry, and never closes as full success |
| Cache | `useEmployeeStore.assignServices` force-refreshes only the selected employee after success (and after a 409), waits for any in-flight list request first, and leaves other employees' entries untouched |
| Duplicate submits | Store-level `assigningServices` guard + disabled controls while requests are in flight |
| Feedback | Success toast in the drawer only on full success; inline mixed/error block inside the modal otherwise |

## Files

| Path | Role |
|------|------|
| `src/features/employee/components/add-employee-service-dialog.tsx` | Add Service modal (fetch, selection, overrides, validation, partial-failure UI) |
| `src/features/employee/components/employee-services-drawer.tsx` | Wires Add actions to the modal + success toast |
| `src/features/employee/store/employee-store.ts` | `assignServices`, `assigningServices`, per-employee refresh + in-flight coordination |
| `src/features/employee/types.ts` | Optional overrides on `AssignServiceInput`; `AssignServiceFailure` / `AssignServicesResult` |
| `src/features/employee/schemas/employee-service.schema.ts` | Zod form schema + `toAssignServiceInputs` |
| `src/features/employee/lib/format.ts` | Shared Persian price/duration formatting (card + modal) |
| `src/features/employee/components/employee-service-card.tsx` | Uses the shared formatter |
| `src/lib/api/endpoints/employee.endpoints.ts` | Assign transport comment (optional override contract) |
| `context/api-client-context.md` | Types + wiring notes |
| `context/PROJECT_INVENTORY.md` | Assign endpoint marked wired |

## Tests

| File | Covers |
|------|--------|
| `src/features/employee/schemas/employee-service.schema.test.ts` | Empty/independent overrides, Persian digits, price/duration bounds |
| `src/features/employee/store/employee-store.test.ts` | Defaults, independent overrides, cache isolation, partial failure, all-failure, duplicate submit guard |
| `src/features/employee/components/add-employee-service-dialog.test.tsx` | Excludes assigned services, default-only submit, price-only override, mixed failure stays open |

## Verify

```bash
npx tsc --noEmit
npx eslint src/features/employee src/lib/api/endpoints/employee.endpoints.ts
npx vitest run
npm run build
```

Result: TypeScript + ESLint clean; Vitest 14 files / 70 tests pass; production build succeeds.

## Remaining / out of scope

Edit Service and Remove Service are intentionally not implemented. No existing API contracts or backend code changed. E2E against a real backend was not run (no `E2E_TEST_*` credentials in this task).

---

# Employee Services Drawer API integration (Phase 2 — `06`)

| Area | Status |
|------|--------|
| Contract | `EmployeeServiceDto` aligned with the real `GET /api/employees/{id}/services` response: `id` (service id), `title`, `defaultPrice`, `defaultDurationMinutes`, `priceOverride`, `durationMinutesOverride`, `effectivePrice`, `effectiveDurationMinutes`, `businessId` | Done |
| Store | `servicesByEmployee` cache keyed by employee id (`items` / `status` / `error`); `loadEmployeeServices(employeeId, { force })` with per-employee in-flight dedupe and cache reuse | Done |
| Fetch trigger | Drawer effect runs only while open and only for the selected employee id — no page-load prefetch | Done |
| Stale-data safety | Every item, status and error is stored per employee id, so switching employees can never render the previous employee's list or state | Done |
| Loading | Compact shimmer skeletons; count badge hidden; empty state suppressed until a successful response | Done |
| Empty | Existing empty state only for `status === "loaded"` with zero items; Add Service actions remain visible (not wired) | Done |
| Error | Persian error block (`AuthError`) + `تلاش دوباره` retry that forces a refresh; errors never degrade to an empty list | Done |
| Mapping / formatting | Effective price/duration from effective fields; default values shown as secondary info only when the matching override is non-null; zero values formatted normally via `toLocaleString("fa-IR")` | Done |

## Files

| Path | Role |
|------|------|
| `context/feature-specs/06-employee-services-drawer-api.md` | Phase 2 spec |
| `src/features/employee/types.ts` | `EmployeeServiceDto` corrected to actual API fields (`id`, `businessId`) |
| `src/features/employee/store/employee-store.ts` | Per-employee services cache + `loadEmployeeServices` |
| `src/features/employee/components/employee-services-drawer.tsx` | Fetch effect, loading / empty / error / retry states, id-based keys |
| `src/features/employee/components/employee-dashboard.tsx` | Drawer mounted without placeholder `services={[]}` |
| `context/api-client-context.md` | Type + wiring notes |
| `context/PROJECT_INVENTORY.md` | Employee-services read path marked wired |

## Verify

```bash
npx tsc --noEmit
npx eslint src/features/employee
npm run build
```

## Next

Phase 3 (not started): Add/Edit Service modals, assign/remove requests (`assignEmployeeServiceRequest` / `removeEmployeeServiceRequest`), and cache invalidation after mutations. No backend changes were made.

---

# Employee Services Drawer UI (Phase 1 — `05`)

| Area | Status |
|------|--------|
| Type | `EmployeeServiceDto` in `features/employee/types.ts` — `defaultPrice` / `defaultDurationMinutes` / `priceOverride` / `durationMinutesOverride` / `effectivePrice` / `effectiveDurationMinutes` + `serviceId` + `title`. Override state comes from the override fields only (never inferred by comparing values) | Done |
| Card | `employee-service-card.tsx` — service name, prominent effective price/duration, per-property "custom" chip (success) with default value as secondary text, or "default" chip (neutral) when override is null; Edit + Remove actions | Done |
| Drawer | `employee-services-drawer.tsx` — Base UI Dialog as a centered modal (Viewport-centered like `dialog.tsx`, scale/fade transition, `max-w-md` near-full on mobile, rounded shell, internal max-height + single scroll region, Esc/backdrop close) | Done |
| Entry point | Employees page card footer: two-button row (`خدمات` / `برنامهٔ کاری`); خدمات opens the drawer for that employee | Done |
| Empty state | Dashed compact block with "افزودن اولین خدمت" action | Done |
| Data + modals | Intentionally not implemented (Phase 1 scope): drawer receives `services` via props (dashboard passes `[]`), Add/Edit/Remove handlers are optional prop hooks on the drawer, no API requests | Deferred |

## Files

| Path | Role |
|------|------|
| `src/features/employee/types.ts` | `EmployeeServiceDto` |
| `src/features/employee/components/employee-service-card.tsx` | Assigned-service card |
| `src/features/employee/components/employee-services-drawer.tsx` | Right-side drawer shell |
| `src/features/employee/components/employee-dashboard.tsx` | Manage-services entry point + drawer mount |
| `src/lib/api/endpoints/employee.endpoints.ts` | Comment only: list response is `EmployeeServiceDto[]` |
| `context/api-client-context.md` | Type inventory updated |
| `context/progress-tracker.md` | This report |

## Verify

```bash
npx tsc --noEmit
npm run build
```

## Next

Phase 2: wire `listEmployeeServicesRequest` through a store, build Add/Edit Service modals, and hook `onAddService` / `onEditService` / `onRemoveService` (remove → `removeEmployeeServiceRequest` + confirm).

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
