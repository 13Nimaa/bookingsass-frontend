# Task: Implement the Services Management UI

Project: BookingSaaS frontend (Next.js App Router, React, TypeScript, Zustand, Tailwind CSS).

The backend Services CRUD endpoints are now implemented. Create the frontend Services management feature and connect it to the actual backend API.

## 1. Inspect First

Before coding, inspect:
- Existing dashboard layout, navigation, and page structure.
- Current `/dashboard/services` route, if any.
- Business and employee feature architecture.
- API client, authentication headers, error handling, and Zustand store conventions.
- The actual `ServiceController`, DTOs, routes, request payloads, and response formats from the backend API documentation available in the repository.
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