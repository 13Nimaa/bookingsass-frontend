# API Client Context

## Overview

Native `fetch` only — no axios/ky. The browser talks to the backend at `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:5135`). Endpoint modules are transport-only; Zustand stores parse responses and own UI error copy.

## Core Files

| Role | Path | Export |
| ---- | ---- | ------ |
| Base URL + public fetch | `src/lib/api/http.ts` | `BACKEND_BASE_URL`, `backendFetch` |
| Authenticated fetch | `src/lib/api/client.ts` | `apiClient` |
| Domain endpoints | `src/lib/api/endpoints/*.endpoints.ts` | `*Request` helpers |
| Token timer | `src/lib/auth/token-timer.ts` | `initTokenTimer` |

```
src/lib/api/
├── http.ts
├── client.ts
├── client.test.ts
└── endpoints/
    ├── auth.endpoints.ts
    ├── business.endpoints.ts
    ├── business.endpoints.test.ts
    ├── booking.endpoints.ts
    ├── employee.endpoints.ts
    ├── service.endpoints.ts
    ├── customer.endpoints.ts
    └── profile.endpoints.ts
```

## Signatures

```ts
backendFetch(path: string, init?: RequestInit): Promise<Response>
apiClient(path: string, options?: RequestInit): Promise<Response>
```

- `backendFetch`: sets `Content-Type: application/json` when body is set and header is unset; `credentials: "include"`.
- `apiClient`: same base URL + credentials; attaches `Authorization: Bearer <accessToken>` from `useAuthStore`; does **not** auto-set JSON Content-Type.

## Auth Transport

1. Read `accessToken` from `useAuthStore.getState()`.
2. On `401`, call `refresh()` (single-flight). On success, retry once with the new token.
3. If refresh fails and status is `unauthenticated`, redirect to `/login`.
4. Transient refresh failures (429/5xx/network) do **not** force logout.
5. Refresh: `POST /api/auth/refresh` with `{ refreshToken }` JSON body (not cookie-only).
6. Session storage key: **`bf_session`**.

Auth endpoints use `backendFetch`. Authenticated domains use `apiClient`.

## Endpoint Modules

| File | Transport | Covers |
| ---- | --------- | ------ |
| `auth.endpoints.ts` | `backendFetch` | login, register, refresh, logout |
| `business.endpoints.ts` | both | public list, public get by id, mine, create*, update, register, image, gallery |
| `profile.endpoints.ts` | `apiClient` | get, update, image up/delete |
| `employee.endpoints.ts` | `apiClient` | employees + working hours + employee↔service assign |
| `service.endpoints.ts` | both | public list (`backendFetch`); get/create/update/delete (`apiClient`) |
| `customer.endpoints.ts` | `apiClient` | CRM list (paged) / get / create / update / soft-delete |
| `booking.endpoints.ts` | both | availability + guest create (`backendFetch`); auth create / list / mine / detail / status (`apiClient`) |

Naming: `{domain}.endpoints.ts`, exports like `loginRequest`, `getMineBusiness`, `listEmployeesRequest`.

**Return rule:** return raw `Promise<Response>` unless there is a documented exception:
- `listBusinesses(query?)` → `{ data: PagedBusinesses, failed }` (public discovery)
- `getBusinessById(id)` → `{ data: BusinessDto | null, notFound, failed }` (public detail)

### Owner register vs create (landmine)

| Helper | Method | Path | Intended use |
| ------ | ------ | ---- | ------------ |
| `registerBusinessRequest` | POST | `/api/Business/register` | Owner self-upgrade (use this) |
| `createBusinessRequest` | POST | `/api/business` | Admin-only on backend — avoid for owner UI |

Owner UI paths that matter pass a custom `submit` → `registerBusinessRequest`. Do not wire new owner flows to `business-store.create` without fixing that path.

## Types / DTOs

Colocated under features — not under `src/lib/api`:

| Path | Types |
| ---- | ----- |
| `features/auth/types.ts` | `User`, `AuthResponse`, `LoginRequest`, `RegisterRequest` |
| `features/business/types.ts` | `BusinessDto`, `BusinessGalleryImageDto`, `PagedBusinesses`, `BusinessListQuery`, `MyBusinessResponse`, `BusinessInput`, image/gallery rules |
| `features/profile/types.ts` | `UserProfile`, `UpdateProfileInput`, image rules |
| `features/employee/types.ts` | `EmployeeDto`, date-based `WorkingHourDto`, inputs, `AssignServiceInput` (`serviceId` + optional independent `priceOverride` / `durationMinutesOverride`), `UpdateEmployeeServiceInput` (sparse PUT; `null` clears an override), `AssignServicesResult`, `EmployeeServiceDto` (`id`, `businessId`, default/override/effective price + duration) |
| `features/service/types.ts` | `ServiceDto`, `ServiceInput` |
| `features/customer/types.ts` | `CustomerDto`, `PagedCustomers`, list/create/update inputs |
| `features/booking/types.ts` | `BookingStatus`, `BookingDto`, availability, list/mine/detail DTOs, create inputs |
| `features/employee/types.ts` | (+ `AssignServiceInput` for employee↔service) |

Zod schemas in `features/*/schemas/` map form values → API inputs.

### Booking transport notes

- Anonymous: `getAvailabilityRequest`, `createGuestBookingRequest` → `backendFetch`.
- Authenticated: `createBookingRequest`, `listBookingsRequest`, `listMyBookingsRequest`, `getBookingRequest`, `updateBookingStatusRequest` → `apiClient`.
- Employee↔service: `listEmployeeServicesRequest`, `assignEmployeeServiceRequest`, `removeEmployeeServiceRequest` on `employee.endpoints.ts`.
- `listBookingsRequest` is wired through `useBookingStore.fetchBookings` and the owner/employee Bookings management page (`/dashboard/bookings`). Filters: `status`, `fromDate`/`toDate` (UTC ISO day bounds), `search` (customer name/phone), pagination. List items normalize missing `price` to `null` (current BE list DTO omits price snapshot).
- `listEmployeeServicesRequest` is wired to the Employee Services Drawer through `useEmployeeStore.loadEmployeeServices` (per-employee cache + loading/error state).
- `assignEmployeeServiceRequest` is wired through `useEmployeeStore.assignServices` and the Add Service modal (one POST per selected service, optional independent overrides omitted when empty). After success it force-refreshes only the selected employee's cached list.
- `updateEmployeeServiceRequest` is wired through `useEmployeeStore.updateEmployeeService` and the Edit Service modal (`PUT`; only changed override fields; explicit `null` resets). After success it force-refreshes only the selected employee's cached list.
- `removeEmployeeServiceRequest` is wired through `useEmployeeStore.removeEmployeeService` and the Drawer confirm dialog (`DELETE`). On success it filters only the selected employee's cached list (no optimistic remove; failures keep the row and the dialog open).

## Store Pattern

```
UI → Zustand store → *.endpoints.ts → backendFetch | apiClient → fetch
```

1. Set loading / clear error.
2. Call endpoint → `Response`.
3. Branch on status (`404`, `403`, `409`, `!ok`).
4. Parse JSON (sometimes unwrap `{ message, data }`).
5. Set data + optional success notice, or Persian `error`.
6. Mutations typically return `Promise<boolean>`.

| Store | Path |
| ----- | ---- |
| `useAuthStore` | `features/auth/store/auth-store.ts` |
| `useBusinessStore` | `features/business/store/business-store.ts` |
| `useProfileStore` | `features/profile/store/profile-store.ts` |
| `useEmployeeStore` | `features/employee/store/employee-store.ts` |
| `useServiceStore` | `features/service/store/service-store.ts` |
| `useCustomerStore` | `features/customer/store/customer-store.ts` |
| `useBookingStore` | `features/booking/store/booking-store.ts` |

Some flows bypass the store intentionally (e.g. register-business content calls `registerBusinessRequest` then `applySession`).

## Errors

No shared `ApiError` class. Stores keep `error: string | null` with Persian fallbacks (`FA_MESSAGES` / local helpers). UI surfaces via `AuthError` (`src/components/shared/auth-error.tsx`).

## Multipart Uploads

```ts
const form = new FormData();
form.append("file", file);
return apiClient("/api/.../image", { method: "POST", body: form });
```

Do **not** set `Content-Type` manually. Rules: jpg/png/webp, ≤5MB.

| Helper | Path |
| ------ | ---- |
| `uploadProfileImageRequest` | `POST /api/profile/image` |
| `uploadBusinessImageRequest` | `POST /api/business/image` |
| `uploadBusinessGalleryRequest` | `POST /api/business/gallery` (multipart field `files`) |
| `deleteBusinessGalleryImageRequest` | `DELETE /api/business/gallery?publicId=` |

Matching `DELETE` endpoints clear images. Gallery is separate from the single profile image; responses return `{ message, businessGallery }`. Cap: 10 images. `useBusinessStore.uploadGallery` / `deleteGalleryImage` keep `business.businessGallery` in sync.

## Adding a New Domain API

1. Add DTOs in `src/features/<domain>/types.ts`.
2. Add `src/lib/api/endpoints/<domain>.endpoints.ts` using `apiClient` or `backendFetch`.
3. Add a Zustand store that parses responses and owns Persian errors.
4. Keep components free of raw `fetch` and base URLs.
5. Update `PROJECT_INVENTORY.md` and this file.
