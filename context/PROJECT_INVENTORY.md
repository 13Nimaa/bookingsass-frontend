# BookingSaaS Frontend — Project Inventory

> Snapshot of what already exists in this Next.js frontend, mapped against  
> `E:\BookingSaas-backend\context\PROJECT_INVENTORY.md`.  
> Use this to see which backend APIs are wired, which UI is missing, and what both sides still need.

**Stack:** Next.js (App Router) · React · Zustand · Tailwind · Playwright  
**API style:** Browser → backend directly (`NEXT_PUBLIC_BACKEND_URL`, default `http://localhost:5135`). No Next.js BFF.  
**Auth transport:** Access + refresh tokens in `localStorage` (`bf_session`) + `Authorization: Bearer`; refresh sent as **JSON body** (not cookie-only).

---

## 1. Feature modules that exist

| Feature folder | Pages / UI | API module | Store |
|----------------|------------|------------|-------|
| `features/auth` | `/login`, `/register`, `/register/business` | `auth.endpoints.ts` | `auth-store` |
| `features/profile` | `/dashboard/profile` | `profile.endpoints.ts` | `profile-store` |
| `features/business` | `/dashboard/business`, `/businesses` (public list) | `business.endpoints.ts` | `business-store` |
| `features/employee` | `/dashboard/employees` | `employee.endpoints.ts` | `employee-store` |
| `features/service` | `/dashboard/services` | `service.endpoints.ts` | `service-store` |
| `features/landing` | `/` (marketing only, mock data) | — | — |

**Missing feature modules (no folder, no endpoints, no pages):**
- `customers` — `/dashboard/customers` list wired (create/edit forms deferred)
- `bookings` / appointments — landing mockups only
- Public business detail + booking flow
- Admin UI
- Employee self-service dashboard (beyond owner managing employees)

---

## 2. Routes that exist

| Route | Auth | Backend used |
|-------|------|--------------|
| `/` | Public | None (landing mocks) |
| `/login` | Public | `POST /api/auth/login` |
| `/register` | Public | `POST /api/auth/register` |
| `/register/business` | Auth | `POST /api/Business/register` |
| `/businesses` | Public | `GET /api/business` |
| `/dashboard` | Auth | None (static quick links) |
| `/dashboard/profile` | Auth | Profile CRUD + image |
| `/dashboard/business` | Auth | Mine / update / image / register |
| `/dashboard/employees` | Auth | Employees + working hours |
| `/dashboard/services` | Auth | Services CRUD for owned business |

**Nav links without pages:** none currently (customers list exists).

---

## 3. Endpoint coverage vs backend

Legend: **Wired** = FE calls it · **Partial** = endpoint helper or UI incomplete · **Missing FE** = BE has it, FE does not · **Missing BE** = needed for product, BE not ready · **Broken mismatch** = FE calls wrong/unusable contract

### 3.1 Auth — `api/Auth`

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| POST | `/register` | **Wired** | `auth.endpoints` + store |
| POST | `/login` | **Wired** | |
| POST | `/refresh` | **Wired** | FE sends `{ refreshToken }` in body (BE also supports cookie) |
| POST | `/logout` | **Wired** | FE sends refresh in body |
| GET | `/session` | **Missing FE** | FE restores via localStorage + refresh instead |

### 3.2 Profile — `api/Profile`

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| GET | `/` | **Wired** | |
| PUT | `/` | **Wired** | |
| POST | `/image` | **Wired** | multipart `file` |
| DELETE | `/image` | **Wired** | |

### 3.3 Business — `api/Business`

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| GET | `/` | **Wired** | Public `/businesses` page |
| GET | `/mine` | **Wired** | |
| GET | `/{id}` | **Missing FE** | No business detail / booking page |
| PUT | `/{id}` | **Wired** | Owner update |
| POST | `/image` | **Wired** | |
| DELETE | `/image` | **Wired** | |
| POST | `/register` | **Wired** | Register-business flow + dashboard empty-state |
| POST | `/` | **Broken mismatch** | `business-store.create` → Admin-only BE endpoint. Owner create should use `/register` (UI paths that matter already do; store `create` is a landmine) |
| DELETE | `/{id}` | **Missing FE** | Admin-only on BE; no Admin UI |

### 3.4 Employees — `api/business/{id}/employees`

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| GET | `/` | **Wired** | Owner dashboard |
| POST | `/` | **Wired** | Add by phone |
| DELETE | `/{employeeId}` | **Wired** | |

### 3.5 Working hours

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| GET | `/` | **Wired** | Per-employee schedule dialog |
| POST | `/` | **Wired** | |
| PUT | `/{id}` | **Partial** | `updateWorkingHourRequest` exists; **store/UI never call it** (only create + delete) |
| DELETE | `/{id}` | **Wired** | |

### 3.6 Services — `api/business/{id}/services`

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| GET | `/` | **Wired** | Public list via `backendFetch`; owner dashboard |
| GET | `/{serviceId}` | **Wired** | Endpoint helper; UI edits from list row |
| POST | `/` | **Wired** | Create dialog |
| PUT | `/{serviceId}` | **Wired** | Edit dialog |
| DELETE | `/{serviceId}` | **Wired** | Confirm dialog |

Still missing product-wise: employee↔service assign; public catalog on business detail page.

### 3.7 Customers (CRM) — `api/business/{id}/customers`

| Method | Path | Frontend | Notes |
|--------|------|----------|-------|
| GET | `/` (paged) | **Wired** | List page |
| GET | `/{customerId}` | **Wired** | Detail dialog |
| POST | `/` | **Wired** | Create dialog |
| PUT | `/{customerId}` | **Wired** | Edit dialog + reactivate |
| DELETE | `/{customerId}` | **Wired** | Soft-delete (list + detail) |

Types: `src/features/customer/types.ts`. Transport: `customer.endpoints.ts`. Store: `customer-store.ts`. Full list CRM UI live.

BE caveat: CRM may still be **Admin-gated** on BE — owner FE would get `Forbid` until BE is fixed.

### 3.8 Bookings

| Capability | Backend | Frontend |
|------------|---------|----------|
| Create user booking | Service only, **no controller** | **Missing** |
| Create guest booking | Service only | **Missing** |
| List mine / business calendar | Missing BE | **Missing** |
| Status patch | Missing BE | **Missing** |
| Availability / slots | Missing BE | **Missing** |

Landing/dashboard mockups show appointments; **zero real booking API usage**.

---

## 4. What the frontend HAS (checklist)

| Feature | Status |
|---------|--------|
| Phone + password register/login | Done |
| Token refresh (body) + proactive timer + 401 retry | Done |
| Logout | Done |
| Session restore from localStorage | Done (not `/session`) |
| Profile get/update + image upload/delete | Done |
| Public business list | Done |
| My business + update + image | Done |
| Self-service business register → BusinessOwner | Done |
| Employee add/list/remove | Done |
| Date-based working hours create/list/delete | Done (Jalali picker converts to/from Gregorian ISO) |
| Working hours update (edit slot) | Endpoint only — UI missing |
| Services management UI | Done (`/dashboard/services`) |
| CRM customers API (types + endpoints) | Done |
| CRM customers UI | Done (list + create/edit/detail + soft-delete/reactivate) |
| Business detail page | **Not started** |
| Public / customer booking flow | **Not started** |
| Owner booking calendar | **Not started** |
| Employee self portal | **Not started** |
| Admin panel | **Not started** |
| Role-aware nav (hide owner-only items for Customer) | **Not started** |

---

## 5. What you still NEED to implement (priority)

### P0 — Unblock the core product (booking)

**Blocked on backend first** (from BE inventory P0), then FE:

1. **BE:** Wire `IBookingService` + `BookingController` + `BookingDto` + availability API.
2. **FE:** `features/bookings` + endpoint module:
   - Create booking (auth)
   - Guest booking
   - My bookings
   - Owner/employee calendar + status actions
3. **FE:** Public business detail `/businesses/[id]`:
   - `GET /api/business/{id}`
   - List services (public)
   - Pick employee / slot / book
4. **BE+FE:** Public-safe employee list + working hours (or availability only) for booking UI.

### P1 — Finish owner dashboard (BE mostly ready)

5. ~~**Services module**~~ — Done (list/create/edit/delete on `/dashboard/services`). Still open: employee↔service assign + public catalog on business detail.
6. **Customers module** (`/dashboard/customers`):
   - Types + endpoints done; still need store + UI
   - **Depends on BE fix:** allow `BusinessOwner` (not only Admin)
7. **Working hours edit:** use existing `updateWorkingHourRequest` in store + schedule dialog
8. **Remove or fix** `business-store.create` → should call `registerBusinessRequest`, not Admin `POST /api/business`
9. **Role-aware sidebar:** hide Services/Employees/Customers for pure `Customer`; show booking history instead

### P2 — Polish & consistency

10. Optional: call `GET /api/auth/session` after restore (roles without profile fetch)
11. `GET /api/business/{id}` detail page even before booking (description, image, city)
12. City filter/search on `/businesses` (BE index exists; filter may need query param)
13. Employee self view of own schedule (reuse working-hours APIs with `employeeId` from profile)
14. Align refresh strategy with BE cookie (today FE correctly uses body tokens)

### P3 — Later (both sides missing)

15. Payments, notifications, reviews, SaaS billing, analytics, password reset / OTP SMS

---

## 6. Cross-cutting mismatches / bugs

| Issue | Detail |
|-------|--------|
| Customers CRM BE role | Owners may still get Forbid until BE allows BusinessOwner |
| `createBusinessRequest` | Hits Admin-only `POST /api/business`; owner flows use `/register` but store still exposes `create` |
| WH update unused | Endpoint helper present; store only create/delete |
| No roles in auth user | `AuthResponse.user` has no roles; roles only on Profile — nav cannot gate by role until profile/session loaded |
| Bookings marketing vs reality | Landing shows appointment UI; product has no booking surface |
| CRM role bug on BE | Even after FE customers page, owners need BE role fix |
| Employee↔service assign | Not in owner services UI yet (needs BE contract if not ready) |
| Token in localStorage | Documented XSS tradeoff; matches current SPA setup |

---

## 7. Suggested FE implementation order

```
1. Fix landmines (create→register, WH update UI, customers dead nav)
2. ~~Services feature~~ — done
3. Customers feature — after BE allows BusinessOwner
4. Business detail page (GET by id + services list)
5. Wait/ship BE booking + availability
6. Booking flow (public + mine + owner calendar)
7. Role-based nav + employee portal polish
```

---

## 8. File map (API surface)

```
src/lib/api/
  http.ts                 — BACKEND_BASE_URL + backendFetch
  client.ts               — Bearer + single-flight refresh on 401
  endpoints/
    auth.endpoints.ts     — login, register, refresh, logout
    profile.endpoints.ts  — get, update, image up/del
    business.endpoints.ts — list, mine, create*, update, register, image
    employee.endpoints.ts — employees CRUD-ish + working hours
    service.endpoints.ts  — public list + owner CRUD
    customer.endpoints.ts
    (missing) booking.endpoints.ts
```

---

## 9. Coverage matrix (quick)

| Domain | BE status | FE status | Gap owner |
|--------|-----------|-----------|-----------|
| Auth | Done | Done | Optional `/session` |
| Profile | Done | Done | — |
| Business list/mine/register/update/image | Done | Done | Detail page FE; Admin delete FE |
| Employees | Done | Done | Public list for booking (BE+FE) |
| Working hours | Done | Mostly | FE update UI; public read (BE) |
| Services | CRUD ready (per feature-spec) | Owner dashboard Done | Assign + public detail catalog |
| Customers CRM | Partial (Admin bug) | **None** | BE role fix + FE P1 |
| Bookings | **Not wired** | **None** | BE P0 then FE P0 |
| Availability | Missing | Missing | BE then FE |
| Payments / notifs / reviews | Missing | Missing | Later |

---

*Generated from frontend codebase inspection against backend `PROJECT_INVENTORY.md`. Update as features land.*
