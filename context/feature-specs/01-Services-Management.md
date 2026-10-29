# Task: Implement the Services Management UI

Project: BookingSaaS frontend (Next.js App Router, React, TypeScript, Zustand, Tailwind CSS).

The backend Services CRUD endpoints are now implemented. Create the frontend Services management feature and connect it to the actual backend API.
## 0. Backend Docs
Services API (frontend)
Base path: /api/business/{businessId}/services
Auth header (except list): Authorization: Bearer <accessToken>
JSON property names are camelCase.

Roles

Public: list only
BusinessOwner: manage services for a business they own
Admin: manage services for any business
Shared types
Service


{
  "id": 1,
  "title": "Haircut",
  "price": 250000,
  "durationMinutes": 30,
  "businessId": 5
}
Create / Update body


{
  "title": "Haircut",
  "price": 250000,
  "durationMinutes": 30
}
1. List services (public)
GET /api/business/{businessId}/services

Auth: none
Success 200: Service[]

GET /api/business/5/services
Use this for booking/public business pages.

2. Get one service (owner / admin)
GET /api/business/{businessId}/services/{serviceId}

Auth: Bearer + role BusinessOwner or Admin
Success 200: Service
Errors: 401, 403 (not owner and not admin), 404 (business or service missing / service not in that business)

GET /api/business/5/services/12
Authorization: Bearer ...
3. Create service
POST /api/business/{businessId}/services

Auth: Bearer + BusinessOwner or Admin
Body: create payload above
Success 201: Service (+ Location header)
Errors: 401, 403, 404 (business not found)

POST /api/business/5/services
Authorization: Bearer ...
Content-Type: application/json
{
  "title": "Haircut",
  "price": 250000,
  "durationMinutes": 30
}
4. Update service
PUT /api/business/{businessId}/services/{serviceId}

Auth: Bearer + BusinessOwner or Admin
Body: full update (same fields as create)
Success 200: Service
Errors: 401, 403, 404

PUT /api/business/5/services/12
Authorization: Bearer ...
Content-Type: application/json
{
  "title": "Haircut + Beard",
  "price": 350000,
  "durationMinutes": 45
}
5. Delete service
DELETE /api/business/{businessId}/services/{serviceId}

Auth: Bearer + BusinessOwner or Admin
Success 200:

{ "message": "خدمت با موفقیت حذف شد." }
Errors: 401, 403, 404
Note: delete may fail if the service is still referenced by appointments/bookings (FK restrict).
Frontend notes
Use case	Endpoint
Public catalog / booking UI
GET .../services
Owner dashboard detail
GET .../services/{id}
Owner create form
POST .../services
Owner edit form
PUT .../services/{id}
Owner remove
DELETE .../services/{id}
Put businessId in the URL, not the body.
Owner must use the business they own (from GET /api/Business/mine or equivalent).
Non-owners with BusinessOwner get 403.
Employee/Customer cannot call create/update/delete/get-by-id.
## 1. Inspect First

Before coding, inspect:
- Existing dashboard layout, navigation, and page structure.
- Current `/dashboard/services` route, if any.
- Business and employee feature architecture.
- API client, authentication headers, error handling, and Zustand store conventions.

- Existing shared UI components and form patterns.

Do not guess API contracts. Use the actual backend implementation as the source of truth.

## 2. Services Page

Implement `/dashboard/services` with:

- A list of services belonging to the authenticated user's business.
- Service name, price, duration, and other relevant fields supported by the actual DTO.
- A clear empty state when no services exist.
- Loading and error states.
- A primary action to add a service.
- Edit and delete actions for each service.
- A responsive layout consistent with the existing dashboard.

Follow the existing Light Premium SaaS visual language. Reuse current design tokens and UI components. Do not redesign the dashboard or introduce a new design system.

## 3. Create and Edit

Implement a reusable create/edit form using the existing project conventions.

- Validate required fields and numeric values.
- Submit the exact request payload expected by the backend.
- Display backend validation errors in Persian.
- Show loading state during submission and prevent accidental duplicate submissions.
- Close the form and update the list only after a successful response.
- Preserve existing form values when an update fails.
- Reuse the same form for creation and editing where appropriate.

## 4. Delete

- Ask for confirmation before deletion.
- Call the actual delete endpoint.
- Update the list after successful deletion.
- Display a useful error message if deletion fails.
- Prevent repeated delete requests while an operation is pending.

## 5. Architecture

- Follow the existing feature-based structure.
- Keep API calls in the appropriate existing API/service layer.
- Use Zustand only where it fits the current architecture.
- Reuse the existing authenticated API client and session handling.
- Do not add a BFF or introduce another API client.
- Do not duplicate endpoint definitions.
- Do not modify backend code, authentication behavior, or unrelated features.
- Do not add tests as part of this task.

## 6. Completion Criteria

The feature is complete when:
- `/dashboard/services` works.
- Existing services load from the backend.
- Create, edit, and delete work through the real API.
- Loading, empty, success, and error states are handled.
- UI is responsive and consistent with the current dashboard.
- TypeScript and build checks pass where available.

At the end, report the files changed, API endpoints used, implemented features, and build/type-check results. Do not claim an operation works unless you have verified the implementation against the actual API contract.