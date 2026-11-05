# Phase 2 — Public Salon Details & Online Booking

Implement the public salon detail page based on the approved visual reference.

This page opens when a visitor selects a salon from the Salon Discovery page. Its purpose is to present the salon's information and allow visitors to book an appointment.

The implementation must preserve the existing BookingSaaS design system and current project styling.

## 1. Overall Page Layout

Create a polished RTL salon profile page.

Desktop layout:
- Main content occupies approximately 72% of the available width.
- A booking panel occupies approximately 28%.
- Use a two-column layout with a consistent gap.
- The booking panel should remain sticky while scrolling, within reasonable viewport limits.
- Keep the main content visually organized into distinct sections.

Mobile layout:
- Use a single-column layout.
- Display salon information before the booking section.
- Make the booking entry point easy to access.
- Use a compact sticky bottom booking CTA if appropriate.
- Prevent horizontal overflow.

## 2. Salon Header and Image Gallery

At the top of the page, create a salon introduction section.

### Image Gallery
- Display the main salon cover image prominently.
- Include smaller supporting images beside or below the main image.
- Maintain consistent image ratios and clean alignment.
- Use actual salon images returned by the API.
- Support missing images with the existing image fallback behavior.
- If multiple images are available, allow users to navigate between them.
- Do not fabricate gallery images or salon media.

### Salon Information
Display:
- Salon name.
- City and address.
- Salon description.
- Available service/category highlights, if returned by the API.

Keep the salon name prominent, with location and description as secondary information.

Do not add fake ratings, reviews, opening status, or availability indicators.

## 3. Salon Navigation Tabs

Add a compact section navigation below the salon introduction.

Tabs:
- «اطلاعات سالن»
- «خدمات»
- «پرسنل»
- «ساعات کاری»
- «نظرات کاربران» only if a real reviews feature and API exist.

Tabs should:
- Scroll to their corresponding sections or navigate appropriately.
- Have a clear active state.
- Preserve RTL alignment.
- Remain visually subtle.
- Avoid introducing unsupported sections.

## 4. Salon Information Section

Display the salon's description and available business information.

- Use readable Persian typography.
- Avoid excessively wide text lines.
- Use comfortable line height.
- Keep the section visually lightweight.
- Display only fields actually provided by the backend.

## 5. Services Section

Display the salon's available services in a clear card/list layout.

Each service item should show, when available:
- Service name.
- Short description.
- Effective price for the selected employee, if an employee is selected.
- Default salon price when no employee-specific selection applies.
- Duration.
- A clear selection action.

Important pricing behavior:
- Use the existing EmployeeService effective pricing rules.
- Do not calculate employee prices from the salon default when an override exists.
- Do not invent prices or durations.
- Do not confuse current service prices with historical Booking price snapshots.

Selecting a service must update the booking flow's selected service state.

## 6. Employees Section

Display the salon's available employees.

Each employee card should include:
- Profile image or existing fallback avatar.
- Employee name.
- Relevant information if available.
- Services offered, if supported by existing API data.

Selecting an employee should update the booking selection and available time slots.

Do not show employees who cannot provide the selected service if the existing API can determine service assignments.

## 7. Working Hours Section

Display the salon's working hours using the existing business working-hours data.

- Show weekdays in Persian.
- Clearly distinguish working and closed days.
- Format times consistently.
- Do not invent working hours.
- Handle missing or unavailable data gracefully.

## 8. Booking Panel — Main Interaction

Create a prominent booking panel on the desktop right side.

The panel should have a clear title:

«رزرو نوبت»

Supporting text:

«برای رزرو نوبت، ابتدا خدمات موردنظر را انتخاب کنید.»

### Booking Steps

Implement the booking flow in this order:

**Step 1 — Select Service**
- Show available services.
- Allow selecting a service.
- Display its applicable price and duration.

**Step 2 — Select Employee**
- Show eligible employees for the selected service.
- Support any employee option only if the existing availability API supports it.
- Changing the service must reset dependent employee and time selections when necessary.

**Step 3 — Select Date**
- Use the existing date picker conventions.
- Prevent selecting past dates.
- Respect salon timezone and existing backend availability rules.

**Step 4 — Select Time**
- Fetch available slots using the existing availability API.
- Use the actual selected business, service, employee, and date.
- Display available slots as compact selectable buttons.
- Show loading, empty, and error states.
- Do not generate availability on the client.
- Refresh available slots when service, employee, or date changes.

### Booking Summary

Before submission, show:
- Selected service.
- Selected employee.
- Selected date.
- Selected time.
- Effective price.
- Duration.

Keep the summary compact and easy to review.

### Submit Action

Primary button:

«ثبت رزرو نوبت»

- Enable only when all required selections are complete.
- Prevent duplicate submissions.
- Use the existing authenticated or guest booking API according to the visitor's authentication state.
- Follow the exact existing request DTOs and validation rules.
- Calculate no booking times or prices on the client.
- Use server-returned booking data for confirmation.

After success:
- Show a clear booking confirmation state.
- Display the returned booking information.
- Do not claim success before the API confirms it.

If booking fails:
- Keep the user's selections.
- Show a useful Persian error message.
- Allow retry.

## 9. Guest and Authenticated Booking

Support both existing booking paths:

- Authenticated booking: existing `POST /api/bookings`.
- Guest booking: existing `POST /api/bookings/guest`.

Use the existing authentication state and actual backend request contracts.

For guest booking:
- Collect only the information required by the existing guest booking DTO.
- Validate it before submission.
- Do not automatically link a guest to an existing customer based only on matching phone numbers.

Do not invent additional registration or authentication requirements.

## 10. Backend Integration

Use the existing backend functionality and API contracts:

- Public salon/business information endpoints.
- Existing services and employee endpoints.
- Existing employee-service assignments and effective pricing.
- Existing working-hours data.
- Availability endpoint:
  `GET /api/bookings/availability?businessId&serviceId&employeeId&date`
- Authenticated booking creation:
  `POST /api/bookings`
- Guest booking creation:
  `POST /api/bookings/guest`

Use the exact existing DTOs, optional parameters, and validation behavior.

Do not invent response fields, endpoint URLs, or request properties.

If a required public data endpoint does not exist, report the exact missing contract rather than fabricating an implementation or changing the backend.

## 11. UI States

Implement appropriate states for:
- Initial page loading.
- Salon not found.
- Failed salon data request.
- Services loading and empty state.
- Employees loading and empty state.
- Availability loading.
- No available time slots.
- Booking submission.
- Booking success.
- Booking failure.

Use the existing component and notification conventions.

## 12. Design Constraints

- Preserve the exact existing project color tokens, typography, and component design system.
- Do not change global CSS variables or theme configuration.
- Do not introduce a new color palette.
- Do not recolor existing shared components.
- Do not redesign the public header.
- Focus on composition, spacing, alignment, information hierarchy, and responsive behavior.
- Match the approved reference's layout while respecting existing project styles.

## 13. Scope Restrictions

- Do not modify backend code or database migrations.
- Do not implement reviews or ratings unless already supported.
- Do not implement favorites.
- Do not add unrelated features.
- Do not change the Salon Discovery listing page.
- Do not refactor unrelated dashboard functionality.

## Acceptance Criteria

1. Clicking a salon opens its correct detail page.
2. Salon information and images come from real API data.
3. Services display correct effective pricing and duration.
4. Employee selection respects service assignments.
5. Available time slots come from the backend availability API.
6. Both authenticated and guest booking flows use existing contracts.
7. Booking success and failure states work correctly.
8. The booking panel is usable on desktop and mobile.
9. Existing design tokens and visual identity remain unchanged.
10. Existing Salon Discovery and dashboard functionality remain unaffected.

Implement only this phase. Run TypeScript, ESLint, relevant tests, and production build. Report changed files, implemented functionality, and test results. Do not proceed to unrelated work.