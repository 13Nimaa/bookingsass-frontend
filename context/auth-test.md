# Task: Audit and Implement Frontend Authentication Tests

You are working on the BookingSaaS frontend built with Next.js App Router, React, Zustand, and Playwright.

Your task is to inspect the existing authentication implementation, implement automated tests, execute them, and report confirmed bugs.

## Important Rules

- Inspect the actual codebase before modifying anything.
- Discover the existing test framework and conventions first.
- Do not guess file names, store behavior, routes, response shapes, or API contracts.
- Do not refactor the authentication system just to make tests pass.
- Do not modify backend code.
- Mock HTTP requests and external dependencies for isolated frontend tests.
- Do not use real credentials or production tokens.
- Keep all changes focused on frontend authentication.

## Step 1: Inspect the Implementation

Inspect:

- Auth pages and forms.
- Authentication endpoint helpers.
- Zustand auth store.
- Login, registration, logout, and refresh logic.
- Session persistence and restoration.
- `localStorage` usage.
- Protected routes and role-aware navigation.
- API client and Authorization header handling.
- 401 response handling and request retries.
- Existing unit, component, and Playwright tests.

The current project inventory reports:

- Authentication state is stored in Zustand.
- Session data is persisted in `localStorage` under `bf_session`.
- Refresh requests send the refresh token in the request body.
- Session restoration uses local storage and refresh logic rather than calling `/api/Auth/session`.
- Proactive refresh and single-flight refresh on 401 are reported as implemented.

Verify every item against the source code before writing tests. Treat these as investigation leads, not guaranteed current behavior.

## Step 2: Implement Frontend Tests

Use the testing framework already installed. If no suitable unit-test framework exists, assess Vitest with React Testing Library before adding dependencies. Use Playwright for end-to-end flows if it is already configured or if a separate E2E setup is justified.

### Login tests

- Successful login updates the authentication store.
- Access and refresh tokens are handled according to the existing contract.
- Invalid credentials display an appropriate error.
- Network failures are handled without crashing the application.
- Loading and submission states behave correctly.
- Repeated submissions are prevented where the existing UI intends this.

### Registration tests

- Successful registration follows the expected navigation flow.
- Validation errors are displayed correctly.
- Duplicate phone-number errors are handled.
- Business registration follows the intended business setup flow.
- API errors do not leave the application in a partially authenticated state.

### Session persistence tests

- Authentication state is restored after a page reload.
- Missing or malformed stored data is handled safely.
- Expired access tokens trigger the implemented refresh flow when appropriate.
- Logout clears the expected authentication state.
- A logged-out user cannot access protected dashboard routes.
- Browser reloads do not unexpectedly restore a revoked session.

### Refresh and 401 handling tests

- A successful refresh updates the stored session or tokens.
- The original failed request is retried after a successful refresh, if that is the current design.
- Failed refresh clears invalid authentication state and follows the existing login redirect or error behavior.
- Concurrent requests share a refresh operation if single-flight refresh is implemented.
- Failed refresh does not cause infinite retry loops.
- Network errors during refresh are handled safely.
- Logout during or after a refresh does not restore the previous session.
- Verify the refresh request body and headers match the actual backend contract.

### Authorization and navigation tests

- Protected pages reject unauthenticated users.
- Navigation is appropriate for the roles the frontend actually supports.
- Role information is obtained from the real source, such as profile or session data.
- Tests must not assume roles exist in the login response unless the source code confirms that.
- Users must not gain access by manipulating frontend state alone; verify that backend authorization remains the security boundary.

### UI and form tests

- Phone-number and password validation.
- Keyboard submission and basic accessibility where practical.
- Error messages are understandable.
- Authentication loading indicators and disabled states.
- Redirect behavior after login and logout.

## Step 3: Test Isolation

- Mock API responses in unit and component tests.
- Do not make unit tests depend on a running backend.
- Clear Zustand state, local storage, and mocks between tests.
- Use deterministic fake tokens and test data.
- Do not log real tokens or passwords.
- For Playwright, use a test account and test environment only.
- Keep unit tests separate from end-to-end tests.

## Step 4: Execute and Report

Run the relevant frontend tests and report:

1. Files created or modified.
2. Scenarios covered.
3. Exact commands used.
4. Passed, failed, and skipped test counts.
5. Confirmed frontend bugs and their file paths.
6. Missing coverage and potential risks.
7. Any production-code changes and their justification.

Classify failures as production bugs, incorrect expectations, missing test setup, or environment issues. Do not silently alter authentication behavior to make tests pass.

Start with an audit, then implement focused tests. Do not modify backend files or unrelated frontend features.