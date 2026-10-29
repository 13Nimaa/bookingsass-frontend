# Auth frontend test progress (`context/auth-test.md`)

**Last updated:** 2026-10-29  
**Status:** Complete for current scope (unit + login E2E). Real-backend E2E skipped (no creds).

## Audit (Step 1) — verified against source

| Lead | Verified behavior |
|------|-------------------|
| Zustand auth store | `src/features/auth/store/auth-store.ts` |
| Session key `bf_session` | `STORAGE_KEY = "bf_session"` |
| Refresh body `{ refreshToken }` | `src/lib/api/endpoints/auth.endpoints.ts` |
| Restore via storage + refresh (not `/session`) | `restoreSession` → `refresh()` |
| Proactive refresh | `src/lib/auth/token-timer.ts` |
| Single-flight + 401 retry | store `refreshPromise`; `src/lib/api/client.ts` |
| Roles in login response | **Not present** — `User` is `{ userId, name, phoneNumber }` only |

## 1. Files created or modified

| File | Change |
|------|--------|
| `vitest.config.ts` | Vitest + jsdom + `@/` alias |
| `package.json` | `test` / `test:unit` scripts; `@rolldown/binding-win32-x64-msvc` (Windows Vitest native binding) |
| `src/features/auth/store/auth-store.test.ts` | Store unit tests (mocked endpoints) |
| `src/lib/api/client.test.ts` | Bearer / 401 retry / redirect unit tests |
| `src/features/auth/schemas/auth.schema.test.ts` | Phone / password schema tests |
| `tests/auth/login.spec.ts` | Pre-existing Playwright login E2E (unchanged) |
| `context/progress-tracker.md` | This report |

## 2. Scenarios covered

### Unit (Vitest, mocked HTTP) — 21
- Login success → store + `bf_session`
- Invalid credentials / network login errors
- Register success / failure (no partial auth)
- Logout clears state + storage
- Restore: missing / malformed storage; refresh on restore
- Refresh fail clears session; network / 429 keep session
- Concurrent refresh single-flight
- `apiClient` bearer header, retry after refresh, login redirect on dead session
- Schema: phone normalize, login/register validation

### E2E (Playwright) — 5 run + 3 skipped
- Client validation (empty / bad phone / empty password)
- Aborted login → network error UI
- Unauthenticated `/dashboard/profile` → `/login`
- Real-backend login / invalid creds / logout+reload (**skipped** — no `E2E_TEST_*`)

## 3. Commands used

```bash
npm run test:unit
npm run test:e2e -- tests/auth/login.spec.ts
```

## 4. Results

| Suite | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| Vitest unit | **21** | 0 | 0 |
| Playwright `tests/auth/login.spec.ts` | **5** | 0 | **3** |
| **Total** | **26** | **0** | **3** |

Skip reason (all 3): `E2E_TEST_PHONE_NUMBER` / `E2E_TEST_PASSWORD` unset. `.env.local` only has `BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL`.

## 5. Confirmed frontend bugs

None found in the executed suites. All failures would have been classified; there were no failures.

**Note (not a confirmed runtime bug):** duplicate login password schemas — `Login.tsx` uses `"رمز عبور را وارد کنید."` while `auth.schema.ts` `loginSchema` uses `"رمز عبور الزامی است."`. Login page uses the local `Login.tsx` schema; shared schema is currently unused for login UI.

## 6. Missing coverage / risks

- Real-backend E2E not exercised (set `E2E_TEST_PHONE_NUMBER` + `E2E_TEST_PASSWORD`)
- No registration / business-register E2E or component tests
- No E2E for refresh/401 (covered in unit only)
- No role-based navigation tests (frontend has no roles in session)
- Token timer proactive refresh not unit-tested
- XSS-readable tokens in `localStorage` (documented tradeoff in store) — security boundary remains backend

## 7. Production-code changes

**None.** Test harness + Vitest Windows binding only. Auth behavior was not altered to make tests pass.
