# Frontend test progress

**Last updated:** 2026-10-29  
**Current task:** `context/business-test.md` — **Complete** for current scope (unit + mocked E2E). Real-backend business E2E skipped (no creds).  
**Prior:** `context/auth-test.md` — complete (see § Auth summary).

---

# Business module (`context/business-test.md`)

## Audit — verified against source

| Lead | Verified behavior |
|------|-------------------|
| Business store | `src/features/business/store/business-store.ts` — `fetchMine` / `create` / `update` / image |
| Owner registration | `registerBusinessRequest` → `POST /api/Business/register` |
| Store `create` (CRUD) | `createBusinessRequest` → `POST /api/business` (not the owner-upgrade path) |
| Register UI | `/register/business` + dashboard `notFound` upgrade both pass `submit` → register endpoint |
| Public list | `listBusinesses` → `GET /api/business` via `backendFetch` |
| Mine | `GET /api/business/mine` → `{ hasBusiness, business }` |
| Image rules | JPG/PNG/WebP, ≤5MB (`BUSINESS_IMAGE_RULES`) |
| Auth gate | Dashboard + `/register/business` wrapped in `AuthGuard` |
| Roles in session | **Not present** — no frontend Customer vs BusinessOwner gating |

**Regression note:** Owner flows correctly call `/api/Business/register`. Store `create` still hits `/api/business`; only used when `BusinessForm` has no `submit` override.

## 1. Files created or modified

| File | Change |
|------|--------|
| `vitest.setup.ts` | RTL `cleanup` after each test |
| `vitest.config.ts` | `setupFiles: ./vitest.setup.ts` |
| `src/features/business/store/business-store.test.ts` | Store unit tests |
| `src/features/business/schemas/business.schema.test.ts` | Schema / `toBusinessInput` |
| `src/lib/api/endpoints/business.endpoints.test.ts` | Public list + register vs create paths |
| `src/features/business/components/register-business-content.test.tsx` | Registration UI |
| `src/features/business/components/business-form.test.tsx` | Edit populate + submit override |
| `src/features/business/components/business-image-field.test.tsx` | Type/size validation |
| `src/features/auth/components/auth-guard.test.tsx` | Unauth redirect / auth children |
| `tests/business/business.spec.ts` | Playwright business E2E |
| `context/progress-tracker.md` | This report |

## 2. Scenarios covered

### Unit / component (Vitest) — +30 new (51 total suite)
- `fetchMine` success / notFound / 404 / 401 error
- `create` bare DTO + envelope unwrap; failed create keeps prior business
- `update` success / 403 / no-business short-circuit; network keeps loaded business
- Image upload URL update + delete
- Schema required fields, max length, trim → null description
- Endpoints: public list, register vs create paths, mine/update
- Register UI: validation, register endpoint (not create), 409, network, loading disable
- Form edit populate; create uses `submit` override
- Image field type/size reject + valid jpeg
- AuthGuard unauthenticated → `/login`; authenticated renders children

### E2E (Playwright `tests/business/business.spec.ts`) — 4 run + 1 skipped
- Unauthenticated `/dashboard/business` → `/login`
- Unauthenticated `/register/business` → `/login`
- Client validation on `/register/business` (seeded session + mocked refresh)
- Mocked successful register → `/dashboard/business` with loaded business
- Live authenticated open `/dashboard/business` (**skipped** — no `E2E_TEST_*`)

## 3. Commands used

```bash
npm run test:unit
npm run test:e2e -- tests/business/business.spec.ts
```

Default Playwright / `npm run dev` port: `4000`.

## 4. Results

| Suite | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| Vitest unit (full suite, auth + business) | **51** | 0 | 0 |
| Playwright `tests/business/business.spec.ts` | **4** | 0 | **1** |
| **Business-related total** | **55** | **0** | **1** |

Skip reason: `E2E_TEST_PHONE_NUMBER` / `E2E_TEST_PASSWORD` unset.

## 5. Confirmed frontend bugs

None that failed a test assertion.

**Risks (observed, not failing suites):**
- Logout does **not** clear `useBusinessStore` — stale business can remain in memory until remount/refetch.
- No role-based UI hiding (session has no roles); sidebar shows owner links to all authenticated users. Backend must enforce.

## 6. Missing Business functionality / coverage

- No dedicated business detail route beyond dashboard mine view
- Real-backend register/update/image E2E not run
- Dashboard upgrade form (`BusinessDashboard` `submitUpgrade`) covered indirectly via shared `BusinessForm` + endpoint tests, not a separate component suite
- Public `/businesses` page is server-rendered; only `listBusinesses` helper is unit-tested

## 7. Production-code changes

**None.** Tests + Vitest setup only.

## 8. Recommended next steps

1. Set `E2E_TEST_PHONE_NUMBER` + `E2E_TEST_PASSWORD` and run live business E2E.
2. Clear or reset business store on logout / account change.
3. Optional: component test for `BusinessDashboard` upgrade + edit paths.

---

# Auth summary (`context/auth-test.md`) — previously complete

| Suite | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| Vitest auth (included in 51 above) | 21 originally | 0 | 0 |
| Playwright `tests/auth/login.spec.ts` | 5 | 0 | 3 |

No production auth changes. Roles absent from login response. Real-backend login E2E still needs `E2E_TEST_*`.
