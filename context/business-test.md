# Task: Implement Frontend Business Integration Tests

You are working on the BookingSaaS frontend built with Next.js App Router, React, TypeScript, Zustand, and Tailwind CSS.

The backend authentication tests have been implemented successfully. The next task is to add automated frontend tests for the Business module and its integration with authentication.

## 1. Inspect the Existing Project

Before making changes, inspect:

- Existing test frameworks and test scripts in `package.json`.
- Current unit, component, and Playwright tests.
- Business-related pages, components, API endpoint helpers, and Zustand stores.
- Authentication store and protected-route behavior.
- Business registration, creation, listing, detail, update, and image-upload flows.
- API error handling, loading states, and navigation.
- Existing mocking utilities and test fixtures.

The reported project uses Next.js App Router and Zustand and communicates directly with the backend. Verify these details in the actual source code.

## 2. Rules

- Reuse the existing test infrastructure.
- If no suitable unit-test framework exists, assess Vitest and React Testing Library before adding dependencies.
- Do not create a second test framework unnecessarily.
- Do not modify backend files.
- Do not refactor production code just to make tests pass.
- Do not guess API routes, DTOs, permissions, or expected responses.
- Mock API calls in unit and component tests.
- Use a dedicated test environment for any end-to-end tests.
- Do not use real credentials, production tokens, or production data.
- Do not redesign the UI or modify unrelated features.
- If a test reveals a bug, document it separately before attempting a fix.

## 3. Business API and Store Tests

Inspect the existing Business API helpers and Zustand store, then test the actual implemented behavior.

Cover:

- Successful retrieval of the current user's businesses.
- Successful retrieval of public business listings, if implemented.
- Successful business registration through the intended owner-registration flow.
- Successful business updates.
- Correct handling of loading and error states.
- Handling of invalid input and backend validation errors.
- Handling of unauthorized responses and forbidden responses.
- Handling of nonexistent business IDs.
- Correct store updates after successful mutations.
- Prevention of stale or incorrect business data after failed requests.

Important: The inventory previously identified a potential mismatch where `business-store.create` calls `POST /api/business`, while the normal owner registration flow uses a separate registration endpoint. Verify the current source code and write a regression test ensuring the intended owner flow calls the correct endpoint. Do not assume the issue still exists.

## 4. Business Registration UI Tests

Test the actual business registration page and its user-visible behavior:

- Required-field validation.
- Invalid input handling.
- Successful submission.
- Loading state during submission.
- Duplicate or conflicting business data errors, if supported by the backend.
- Backend validation errors displayed appropriately.
- Successful navigation after registration.
- No unintended duplicate submission.
- Correct behavior when the user is unauthenticated.

Use accessible queries and test observable behavior rather than internal component implementation details.

## 5. Authentication and Authorization Integration

Test frontend behavior for:

- An unauthenticated user attempting to access protected business-management pages.
- An authenticated BusinessOwner accessing the intended management UI.
- A Customer not being shown owner-only actions when the frontend has reliable role information.
- Handling of expired sessions and failed refresh attempts.
- Handling of HTTP 401 and 403 responses.
- Avoiding redirect loops when authentication fails.
- Preventing stale business state from being displayed after logout or account changes.

Do not treat frontend role checks as a security boundary. The backend must independently enforce authorization.

Do not assume role information is present in the login response. Inspect how the current application obtains role information.

## 6. Business Update and Image Upload Tests

If the corresponding functionality exists, test:

- Form values are populated correctly.
- Valid changes are submitted.
- Invalid changes are rejected.
- Backend errors are displayed.
- Image upload success and failure.
- Unsupported file types and size limits, according to the actual frontend and backend rules.
- Loading and submission states.
- UI state updates after a successful save.

Do not invent features that have not been implemented. Report missing functionality separately.

## 7. End-to-End Tests

If Playwright is already configured, add focused E2E tests for the most important user journeys:

1. Log in with a test account.
2. Navigate to business management.
3. Register a business through the intended flow.
4. Verify the resulting business state or navigation.
5. Attempt to access an owner-only page while unauthenticated and verify the expected behavior.

Mock API requests where appropriate. Use a real test backend only when the environment is explicitly configured and isolated.

## 8. Run and Verify

Run the existing frontend test suite and the new tests.

- Confirm that tests are actually discovered and executed.
- Report passed, failed, and skipped counts.
- Run linting and type-checking if scripts are available.
- Run relevant Playwright tests if configured.
- Do not report success if zero tests were executed.

If dependencies must be installed, explain why and use compatible versions.

## 9. Final Report

Provide:

- Files created or modified.
- Test scenarios covered.
- Exact commands executed.
- Number of tests discovered, passed, failed, and skipped.
- Confirmed frontend bugs, with file paths and evidence.
- Missing Business functionality discovered during inspection.
- Any production-code changes and justification.
- Recommended next steps.

Start by inspecting the project and its test infrastructure, then implement the tests in small, focused changes. Do not perform an unrelated refactor.