# Phase 2 — Employee Services Drawer API Integration

Connect the existing Employee Services Drawer UI to the backend and display the actual services assigned to the selected employee.

Phase 1 is complete. The Drawer UI, employee entry point, service cards, and empty state are already implemented.

## 1. Fetch Assigned Services

Integrate:

`GET /api/employees/{employeeId}/services`

Requirements:
- Fetch services when the Drawer is opened for an employee.
- Use the selected employee's ID.
- Ensure switching between employees never displays stale data from the previously selected employee.
- Avoid unnecessary duplicate requests when following existing project data-fetching conventions.
- Do not fetch services for an employee before the Drawer is opened.

## 2. Connect API Data to Existing UI

Use the actual API response fields:

- `id`
- `title`
- `defaultPrice`
- `defaultDurationMinutes`
- `priceOverride`
- `durationMinutesOverride`
- `effectivePrice`
- `effectiveDurationMinutes`
- `businessId`

Map the API response to the existing service card UI.

Display:
- Service title.
- Effective price.
- Effective duration.
- Default price and duration as secondary information when their corresponding overrides are configured.
- A subtle indication of whether each value is inherited or customized.

Determine override status using the override fields themselves, not by comparing effective and default values.

Price and duration must be handled independently.

## 3. Loading, Empty, and Error States

Implement proper states within the existing Drawer:

**Loading**
- Show a compact skeleton or loading indicator.
- Avoid flashing the empty state before the API response arrives.

**Empty**
- Show the existing empty state only after a successful response containing zero assigned services.
- Keep the Add Service action visible, but do not implement its functionality in this phase.

**Error**
- Show a clear error message if fetching fails.
- Provide a retry action.
- Do not silently treat API errors as an empty service list.

## 4. Data Formatting

- Format prices using the existing Persian currency formatting conventions.
- Display durations in a readable format using the existing UI conventions.
- Handle zero values correctly.
- Do not hardcode default prices or durations.

## 5. Scope Restrictions

- Do not implement POST, PUT, or DELETE requests.
- Do not implement Add/Edit modals.
- Do not change backend code or API contracts.
- Do not redesign the Drawer.
- Do not modify unrelated employee management functionality.
- Reuse existing API functions and types where available.
- Do not introduce unnecessary dependencies.

## 6. Acceptance Criteria

- Opening an employee's Drawer fetches that employee's assigned services.
- Switching employees displays only the selected employee's data.
- API fields are correctly mapped to service cards.
- Default and custom price/duration states are displayed independently.
- Loading, empty, error, and retry states work correctly.
- Existing Drawer layout and responsive behavior remain intact.

At completion, report the files changed, API integration details, and any remaining issues. Do not proceed to Phase 3.
