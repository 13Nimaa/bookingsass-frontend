# Phase 1 — Bookings Management Page (Detailed UI Implementation)

Implement the Bookings Management page with a polished, production-quality UI. Focus on the visual design and user experience of the booking list, while integrating it with the existing backend API.

The result should feel like a premium, modern salon management SaaS dashboard, consistent with the existing BookingSaaS visual identity.

## 1. Page Layout and Visual Hierarchy

Create a dedicated Bookings page inside the existing dashboard layout.

### Page Header

At the top of the content area:

- Right-aligned page title: «مدیریت رزروها»
- Short supporting description: «مشاهده و مدیریت رزروهای سالن»
- A subtle calendar icon next to the title.
- Keep the header compact and avoid oversized typography.
- Use a clear separation between the header and the filter section.

Do not add unnecessary summary cards or dashboard statistics to this page.

## 2. Filter and Search Section

Place the filters directly below the page header.

Use a responsive filter layout with consistent heights, spacing, borders, and corner radii.

### Search

- A search input with a search icon.
- Persian placeholder: «جستجو در مشتری، سرویس یا کارمند...»
- Use the search functionality only if supported by the existing backend API.
- Avoid an oversized input.

### Status Filter

- A compact dropdown.
- Default option: «همه وضعیت‌ها»
- Display available statuses using the existing backend status values and existing frontend mappings.
- Do not invent new booking statuses.

### Date Filter

- A date or date-range picker consistent with the existing date picker components.
- Persian-friendly presentation.
- Clearly display the selected date or range.
- Only send date parameters supported by the existing endpoint.

### Filter Actions

- Add a subtle clear-filters action when filters are active.
- Keep the filter section visually lightweight.
- On desktop, arrange filters in one horizontal row where space allows.
- On smaller screens, stack them cleanly without horizontal overflow.

## 3. Booking List — Desktop

Use individual horizontal booking cards instead of a traditional dense data table.

Each booking should appear as a compact, clearly structured card.

### Card Structure

Use RTL layout with these logical sections:

**A. Customer**
- Customer avatar or a neutral fallback avatar.
- Customer full name.
- Phone number as secondary information, only if returned by the API.

**B. Service**
- Service title.
- Small, subtle service icon.
- Avoid unnecessary decorative elements.

**C. Employee**
- Employee avatar or fallback avatar.
- Employee full name.

**D. Date and Time**
- Booking date with a calendar icon.
- Start and end time with a clock icon.
- Keep date and time visually grouped.

**E. Price**
- Display the stored booking price snapshot.
- Format it using Persian number formatting and the appropriate currency label.
- Do not calculate the price from the current service price.
- Handle null prices for historical bookings gracefully; do not display a misleading zero.

**F. Status**
- A compact status badge.
- Use soft background colors and readable text.
- Status colors should be visually distinct without becoming too saturated.
- Reuse existing status-to-label mappings.

**G. Actions**
- A small three-dot action trigger at the appropriate edge of the card.
- Do not implement booking actions in this phase.
- Do not display fake or non-functional menu options.

### Card Styling

- Warm off-white or white surface.
- Subtle neutral border.
- Rounded corners consistent with existing dashboard components.
- Avoid heavy shadows.
- Use consistent internal padding.
- Use subtle vertical separators only where they improve scanning.
- Keep all information vertically aligned.
- Use consistent icon sizes and muted icon colors.
- Customer name and service title should receive the strongest text emphasis.
- Secondary information should use smaller, muted typography.

### Spacing

- Keep card height compact.
- Use consistent spacing between cards.
- Avoid oversized avatars, icons, or status badges.
- Ensure that long customer, employee, and service names truncate gracefully without breaking the layout.

## 4. Booking List — Mobile

Do not simply shrink the desktop card.

Create a mobile-specific card layout:

- Customer name and status on the top row.
- Service and employee information below.
- Date and time grouped together.
- Price clearly visible near the bottom.
- Actions accessible without consuming excessive space.
- Use a clean vertical hierarchy.
- Avoid horizontal scrolling.
- Keep touch targets comfortably usable.
- Preserve readable spacing without making each card excessively tall.

## 5. Status Visual Design

Use the existing backend statuses and existing frontend status mappings.

Use subtle semantic styling:

- Pending: soft amber background.
- Confirmed: soft green background.
- Cancelled or rejected: soft red background.
- Completed: soft neutral or muted green background.
- Expired: muted neutral styling.

These are visual suggestions only. Do not add unsupported statuses or change backend status semantics.

Use Persian status labels.

## 6. Pagination and List Footer

If the existing API supports pagination:

- Display pagination below the list.
- Show the current page and available navigation controls.
- Display a compact result summary.
- Disable unavailable navigation actions.

If pagination is not supported, do not simulate server pagination.

## 7. Loading, Empty, and Error States

### Loading
- Use skeleton booking cards that match the final card dimensions.
- Avoid a full-page loading spinner.
- Keep the page header and filters stable during loading.

### Empty
- Display a centered but compact empty state.
- Use a subtle calendar/booking illustration or icon.
- Title: «رزروی یافت نشد»
- Supporting text should explain that no bookings match the current filters.
- If filters are active, provide a clear-filters action.
- Do not use excessive illustrations or large empty-state artwork.

### Error
- Show a clear Persian error message.
- Provide a retry action.
- Keep the page layout stable.

## 8. Design System Constraints

Follow the existing BookingSaaS design system:

- Background: `#fbf8f3`
- Main text: `#221f1c`
- Primary accent: `#a8492e`
- Darker accent: `#944028`
- Secondary muted green: `#6b7a5e`

Use existing typography, border, radius, spacing, and component conventions.

Important:
- Do not introduce a new purple/navy color scheme.
- Do not create a second visual identity.
- Do not add unnecessary gradients.
- Do not use excessive shadows.
- Avoid the generic AI-generated dashboard look.
- Keep the result elegant, warm, minimal, and functional.
- Use existing UI components where appropriate rather than creating duplicate components.

## 9. Functional Integration

- Connect the page to the existing booking list API.
- Use existing DTOs, API helpers, and status mappings.
- Display the booking price snapshot.
- Use only filters supported by the existing API.
- Do not invent endpoint URLs, query parameters, response fields, or status values.
- Keep loading, error, and empty states connected to actual request state.
- Preserve the existing dashboard navigation and layout.

## 10. Scope Restrictions

- Do not implement booking details.
- Do not implement confirmation, rejection, cancellation, or any status mutation.
- Do not modify backend code or database migrations.
- Do not change booking creation or availability functionality.
- Do not add dashboard statistics.
- Do not refactor unrelated components.

## Acceptance Criteria

1. The page has a clear and polished visual hierarchy.
2. Desktop booking cards are compact and easy to scan.
3. Mobile cards have a deliberately designed vertical layout.
4. Customer, service, employee, date, time, price, and status are clearly distinguishable.
5. Price comes from the booking snapshot.
6. Filters use only supported backend functionality.
7. Loading, empty, and error states look consistent with the final design.
8. The design follows the existing warm BookingSaaS visual identity.
9. No unrelated dashboard pages or functionality are changed.

Implement only this phase. Run TypeScript, ESLint, relevant tests, and production build. Report changed files and results. Do not proceed to the next phase.