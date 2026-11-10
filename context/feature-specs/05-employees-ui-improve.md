# Phase 1 — Employee Service Management Drawer UI

Implement the UI for managing services assigned to an employee through a right-side Drawer accessible from the existing Employees page.

## 1. Entry Point

On the existing Employees page, add a "Manage Services" action for each employee.

Clicking this action must open a Drawer for the selected employee.

Do not create a new page or top-level dashboard navigation item.

## 2. Drawer Header

Display:
- Employee name.
- Employee profile image, if available.
- A clear title such as "Employee Services".
- Close button.

Keep the header compact and consistent with the existing dashboard design.

## 3. Assigned Services Section

Below the header, display:
- Section title.
- Number of assigned services.
- Primary "Add Service" button.

Display assigned services as individual cards, not a table.

Each card must show:

- Service name.
- Effective price.
- Effective duration.
- Default price when a custom price exists.
- Default duration when a custom duration exists.
- Edit action.
- Remove action.

## 4. Default and Custom Values

Use the existing EmployeeService response fields:

- `defaultPrice`
- `defaultDurationMinutes`
- `priceOverride`
- `durationMinutesOverride`
- `effectivePrice`
- `effectiveDurationMinutes`

Display effective values prominently.

For each property independently:

- If its override is null, indicate that the default service value is being used.
- If its override has a value, indicate that a custom employee-specific value is configured and show the default value as secondary information.

Do not infer override state by comparing effective and default values.

## 5. Empty State

When no services are assigned:
- Show a compact empty state.
- Explain that this employee has no assigned services.
- Provide an "Add First Service" action.

## 6. Drawer Behavior

- Open from the right on desktop.
- Use an appropriate full-width or near-full-width presentation on mobile.
- Keep the employee list in the background.
- Support closing through the close button and existing Drawer conventions.
- Prevent awkward nested scrolling.
- Ensure service cards remain readable on narrow screens.

## 7. Scope

This phase implements the Drawer UI foundation only.

Do not implement:
- API requests.
- Add Service modal functionality.
- Edit Service modal functionality.
- Delete requests.
- Backend changes.
- New dashboard pages or navigation.

Keep existing employee management behavior intact.

Do not redesign unrelated sections or introduce unnecessary dependencies.

## Acceptance Criteria

- Each employee has a Manage Services entry point.
- Clicking it opens the correct employee's Drawer.
- Drawer header identifies the selected employee.
- Assigned services are presented as responsive cards.
- Default and custom price/duration states are distinguishable.
- Empty state is implemented.
- Existing employee management UI remains intact.