# Business Owner Dashboard — Frontend Integration & UI Completion

Implement the Business Owner dashboard using the existing backend endpoint and the supplied dashboard API documentation.

Use the attached dashboard screenshot as the primary visual reference. The goal is to complete the existing dashboard UI and connect every supported widget to real backend data.

**Mandatory: Use the `apple-design-skill` by Emi Kowalski during implementation.** Apply its recommendations to visual hierarchy, spacing, component composition, interaction states, responsive behavior, and micro-interactions. Actually use the skill rather than merely mentioning it in the final report.

The result should feel like a polished, production-ready SaaS dashboard while remaining consistent with the existing BookingSaaS interface.

## 1. Non-negotiable Design Constraints

- Treat the attached screenshot as the visual target.
- Preserve the existing dashboard layout and information architecture wherever they are already implemented correctly.
- Preserve the exact existing project colors, typography, design tokens, CSS variables, and shared component styling.
- Do not introduce a new color palette.
- Do not change global theme configuration.
- Do not recolor existing shared components.
- Do not redesign unrelated dashboard pages.
- Do not replace the current visual identity with an Apple-style color scheme.
- Use Apple Design Skill to improve execution quality, not to impose a different design system.

Focus on precise spacing, alignment, proportions, typography hierarchy, component consistency, and interaction quality.

## 2. Dashboard API Integration

Use the existing endpoint:

`GET /api/Business/dashboard`

Authentication:
- Send the existing access token using the established API client/authentication mechanism.
- Only BusinessOwner users should access this dashboard.
- Do not send `businessId` in query parameters or request body.
- The backend resolves the business from the authenticated JWT.
- Use `cache: "no-store"` or the existing equivalent for fresh dashboard data.
- Reuse the project's existing API service and state-management conventions.

The endpoint returns all dashboard data in one request.

Create or update the appropriate TypeScript DTO types based on the backend contract.

Use the exact camelCase property names and numeric booking statuses documented below.

Do not create additional API calls for metrics already returned by this endpoint.

## 3. Dashboard Summary Cards

Complete the existing summary cards using these fields:

### A. Today's Bookings

API field:

`summary.todayBookingsCount`

Display:
- Total operational bookings scheduled for today.
- A clear title such as «نوبت‌های امروز».
- A suitable existing icon.
- The actual returned count.

Do not invent a comparison with yesterday or a growth percentage.

### B. Today's Estimated Revenue

API field:

`summary.todayEstimatedRevenue`

Display:
- Label: «ارزش رزروهای تکمیل‌شده امروز» or an equally clear Persian equivalent.
- Format the value using the project's existing currency formatter.
- Make it clear that this represents estimated booking value, not confirmed payments.

Important:
- This is based on completed bookings and `Booking.price` snapshots.
- It is NOT actual collected or settled revenue.
- If the value is `null`, display an appropriate unavailable state such as «—».
- Do not silently convert null into zero.

### C. Total Customers

API field:

`summary.customerCount`

Display:
- Total customers belonging to the current business.
- Use the actual returned count.
- Do not calculate customer count from booking records.

### D. Today's Capacity / Utilization

API field:

`capacity.utilizationPercent`

Display:
- A clear capacity/utilization percentage.
- Use a compact progress visualization if consistent with the screenshot.
- If `capacity` is null or `utilizationPercent` is null, display «—» or a clear unavailable state.
- Never display `0%` when the backend returns null.

Optionally display occupied and available minutes using:
- `capacity.occupiedMinutes`
- `capacity.availableMinutes`

Keep this information secondary to the percentage.

## 4. Weekly Revenue Chart

Connect the existing weekly chart to:

`weeklyRevenue`

The API always returns exactly seven entries in chronological order, Saturday through Friday.

Use the array in its returned order. Do not sort it again.

Map weekday keys to Persian labels:

- saturday → شنبه
- sunday → یکشنبه
- monday → دوشنبه
- tuesday → سه‌شنبه
- wednesday → چهارشنبه
- thursday → پنجشنبه
- friday → جمعه

Each data point contains:

- `date`
- `dayOfWeek`
- `weekdayKey`
- `estimatedRevenue`
- `completedBookingCount`

Chart requirements:

- X-axis: Persian weekday labels.
- Y-axis: `estimatedRevenue`.
- Include all seven days, including days with zero revenue.
- Format monetary values using the existing currency formatter.
- Add useful tooltips showing the weekday, estimated booking value, and completed booking count.
- Handle all-zero data without breaking the chart.
- Preserve the chart's existing visual language and proportions from the reference screenshot.
- Add an appropriate loading state.
- Add a clear empty/zero-data state.

Optional:
- Display the sum of all seven estimated revenue values.
- Highlight the highest-revenue day.

Any total or highest-day calculation must be derived from the returned seven points.

Use wording that makes clear these are estimated booking values, not confirmed payments.

Do not invent growth percentages or comparisons with previous weeks.

## 5. Today's Bookings Widget

Connect the existing today's bookings section to:

`todayBookings`

Response fields:

- `totalCount`
- `items`

The API returns at most five items, ordered by `startTime` ascending.

Each item includes:

- `id`
- `customerName`
- `serviceTitle`
- `employeeName`
- `startTime`
- `endTime`
- `status`
- `price`

Display each booking with a clean and readable information hierarchy:

1. Customer name.
2. Service title.
3. Employee name.
4. Booking start time.
5. Booking status.
6. Price, if available.

### Status Mapping

Use the numeric BookingStatus values:

| Value | Persian label |
|---|---|
| 0 | در انتظار |
| 1 | تأیید شده |
| 3 | انجام‌شده |

Do not invent additional statuses.

### Date and Time

- API timestamps are UTC ISO strings.
- Convert them to the business display timezone.
- Prefer the existing business timezone from `/Business/mine` if already available.
- The default business timezone is `Asia/Tehran`.
- Do not blindly use UTC time in the UI.
- Do not introduce a new timezone configuration system.

### Customer Names

`customerName` can be null.

Handle missing names gracefully with a neutral label such as «مشتری مهمان» without inventing a person's identity.

### View All Action

Use `todayBookings.totalCount` as the source of truth for the total number of today's bookings.

The «مشاهده همه» action should navigate to the existing bookings management page.

Do not assume that `items.length` represents the total count.

The full booking list must use the existing bookings list API/page, not the dashboard endpoint.

### Empty State

When `items` is empty:
- Show a polished empty state.
- Explain that no bookings are scheduled for today.
- Keep the dashboard layout balanced.
- Do not treat an empty list as an API error.

## 6. Top Services Widget

Connect the existing top services section to:

`topServices`

The reporting period is the current business-local calendar month.

Each item contains:

- `serviceId`
- `title`
- `bookingCount`
- `percentage`

Display:
- Service title.
- Number of completed bookings.
- Percentage contribution within the returned top-service groups.
- A visual progress bar or equivalent visualization consistent with the existing dashboard.

Requirements:
- Preserve the API's returned order.
- Do not recalculate percentages unnecessarily.
- Do not interpret percentages as shares of all services in the database.
- Do not calculate revenue from current service prices.
- Do not invent additional service metrics.

Show the reporting period using:

- `periodStart`
- `periodEnd`

Format the dates for Persian users.

### Empty State

When `items` is empty:
- Show a suitable message such as «هنوز خدمتی برای نمایش وجود ندارد».
- Do not render fake services or sample percentages.

## 7. Data Fetching and State Management

Fetch the dashboard once when the Business Owner dashboard page mounts.

Use the project's existing state-management and API conventions.

Requirements:

- Avoid unnecessary duplicate requests.
- Keep the dashboard data in one coherent state.
- Avoid independent requests for each widget.
- Support refetching when the page regains focus if consistent with existing project patterns.
- Prevent stale responses from replacing newer dashboard data.
- Keep loading, success, and error states predictable.

### Loading State

While fetching:
- Use skeletons that resemble the final dashboard layout.
- Avoid large layout shifts.
- Do not show zero values before the actual response arrives.
- Keep the page structure stable.

### Error State

Handle these API responses:

**401 Unauthorized**
- Use the existing authentication/session-expiration handling.
- Do not create a separate authentication mechanism.

**403 Forbidden**
- Show an appropriate access-denied state.
- Do not display owner dashboard data to unauthorized users.

**404 Business Not Found**
- Display a meaningful Persian state explaining that the business profile has not been created yet.
- If the project already has a business setup route, provide an appropriate navigation action.

**400 Bad Request**
- Display the backend's Persian error message when available.

**Other failures**
- Show a useful Persian error state.
- Provide a retry action.
- Do not replace failed data with mock data.

## 8. Empty Business Behavior

A business with no bookings or customers is a valid dashboard state.

The API can return:
- Zero summary values.
- Seven weekly revenue points with zero values.
- Empty today's booking items.
- Empty top services.
- Null or zero capacity utilization depending on available working hours.

Handle this as a successful response.

Do not confuse an empty business with an API failure.

## 9. Responsive Behavior

Follow the attached screenshot's visual structure while ensuring the dashboard works well on mobile and desktop.

### Desktop
- Preserve the established dashboard composition.
- Maintain consistent card dimensions and alignment.
- Avoid unnecessary empty space.
- Keep chart and list proportions balanced.
- Ensure text and numeric values remain readable.

### Mobile
- Stack dashboard sections naturally.
- Keep summary cards readable and appropriately sized.
- Prevent horizontal overflow.
- Ensure the chart remains usable.
- Make booking rows readable without forcing a wide table.
- Keep actions accessible with comfortable touch targets.
- Preserve RTL layout.

## 10. Apple Design Skill Application

Use `apple-design-skill` by Emi Kowalski as a mandatory design reference.

Apply its principles to the actual dashboard implementation:

- Clear information hierarchy.
- Consistent visual rhythm and spacing.
- Precise alignment and sizing.
- High-quality typography composition.
- Thoughtful card and section composition.
- Subtle interaction feedback.
- Clear loading, empty, and error states.
- Responsive interaction patterns.
- Restrained and purposeful micro-interactions.

Do not:
- Copy Apple's product colors.
- Introduce a new theme.
- Change existing project design tokens.
- Add unnecessary animations.
- Add decorative UI that reduces information clarity.
- Introduce dependencies just to imitate an Apple interface.

The existing BookingSaaS design system remains the source of truth for visual styling.

## 11. Strict Data Integrity Rules

The frontend must never fabricate dashboard information.

Do not display:
- Growth percentages versus yesterday.
- Growth percentages versus last month.
- Confirmed payment totals.
- Monthly revenue totals as if they came from the API.
- Fake booking records.
- Fake customer counts.
- Fake top services.
- Invented capacity percentages.

The only permitted derived values are straightforward calculations from the actual API response, such as the sum of seven weekly values or the highest-revenue day.

Do not send `businessId` to the dashboard endpoint.

Do not change backend contracts.

## 12. Scope Restrictions

- Frontend implementation only.
- Do not modify backend code.
- Do not create or apply database migrations.
- Do not change booking business logic.
- Do not modify customer or employee management functionality.
- Do not redesign the entire dashboard.
- Do not change global styles or design tokens.
- Do not add unrelated dashboard features.
- Do not replace real API data with mock data.

## 13. Acceptance Criteria

1. The Business Owner dashboard fetches real data from `GET /api/Business/dashboard`.
2. All four summary cards display the correct API values.
3. Null revenue and capacity values are handled correctly.
4. Weekly chart displays exactly seven days in API order, Saturday through Friday.
5. All monetary values are labeled as estimated booking values where appropriate.
6. Today's booking widget displays the correct records and statuses.
7. View All uses `totalCount` and navigates to the existing bookings page.
8. Top services display real monthly data and correct percentages.
9. Business timezone is respected when displaying booking times and dates.
10. Loading, error, retry, and empty states are implemented.
11. Unauthorized users cannot access the owner dashboard.
12. The attached screenshot remains the visual reference.
13. Apple Design Skill has been applied without changing the existing design system.
14. Existing dashboard navigation and other features remain functional.

At completion, report:
- Files changed.
- Dashboard widgets connected.
- API integration details.
- Any unsupported or missing data.
- Design improvements made using Apple Design Skill.
- Any remaining issues.

Do not proceed to unrelated features.