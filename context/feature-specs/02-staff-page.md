# Working hours API — frontend update

Base path: `api/business/{businessId}/employees/{employeeId}/working-hours`  
Auth: `Employee` or `BusinessOwner`

## What changed

- Working hours are **tied to a specific calendar date**, not only a weekday.
- Send/receive **Gregorian ISO** `yyyy-MM-dd` (e.g. `"2026-10-30"`).
- Convert **Jalali ↔ Gregorian on the frontend** before/after API calls.
- `dayOfWeek` is **no longer sent** on create/update; the API sets it from `date` and returns it.

## Create / Update body

```json
{
  "date": "2026-10-30",
  "startTime": "09:00:00",
  "endTime": "17:00:00"
}
```

| Field | Type | Notes |
|-------|------|--------|
| `date` | string | Gregorian ISO. Convert from Jalali before send. |
| `startTime` | string | `HH:mm:ss` (or `HH:mm`) |
| `endTime` | string | Must be after `startTime` |

Do **not** send `dayOfWeek`.

## Response item (`WorkingHourDto`)

```json
{
  "id": 1,
  "employeeId": 1,
  "date": "2026-10-30",
  "dayOfWeek": 5,
  "startTime": "09:00:00",
  "endTime": "17:00:00"
}
```

| Field | Notes |
|-------|--------|
| `date` | Gregorian ISO — convert to Jalali for UI |
| `dayOfWeek` | 0=Sunday … 6=Saturday (derived) |

Create → `201` `{ message, data }`  
Update → `200` `{ message, data }`  
Get all → `200` array of items above (ordered by `date`, then `startTime`)  
Delete → `200` `{ message }`

## Errors (unchanged meaning)

| Status | When |
|--------|------|
| `400` | `endTime` ≤ `startTime` |
| `409` | Overlap with another range **on the same date** |
| `404` | Employee / working hour not found (or no access) |
| `401` | Not authenticated |

## Frontend checklist

1. Date picker stays Jalali in UI.
2. On submit: Jalali → Gregorian ISO → put in `date`.
3. On display: `date` → Jalali.
4. Remove `dayOfWeek` from create/update payloads.
5. Overlap is per **date**, not per weekday.

### A. Weekly schedule modal
1. Replace the native <select> (day) and the native time inputs with custom, on-brand components. Day: a row of 7 day chips (Sat→Fri), or a styled select. Time: a styled dropdown of 30-minute steps in 24-hour format (09:00, 09:30, ...). No AM/PM anywhere; use the same 24h format in the form and the list.
2. Data model: each day can have multiple intervals (e.g. 09:00–13:00 and 16:00–20:00). Add a per-day on/off toggle and a "+ add interval" action. Closed days show a clear "تعطیل" state with enough contrast (>= 4.5:1).
3. Productivity: add "copy to all days", "copy previous day" and presets (09–17, 10–19).
4. Validation: end must be after start; intervals must not overlap; show Persian inline errors and disable the add button until valid.
5. Deleting an interval: 40x40px minimum hit area, with an undo toast instead of a confirm dialog. Show a saved/saving indicator.
6. Responsive: stack the form fields on mobile. Keep only one close control (the X in the corner plus a primary "بستن/ذخیره" footer button, not both meaning the same thing).
7. Accessibility: role="dialog", aria-modal, focus trap, Esc to close, labelled controls, visible focus rings.

### B. Add staff modal
1. Add an X close button (consistent with the schedule modal), autofocus the phone field, shorten the description, and keep a single helper text.
2. Phone input: dir="ltr" with text aligned to the right, inputMode="tel", normalize Persian/Arabic digits to Latin before validating, live format (0912 345 6789), validate 11 digits starting with 09, inline Persian error.
3. After a valid number is typed, look up the user (debounced) and show a result row with avatar initials + name. If not found, show a clear message and a secondary "send invite" action (only plan it; ask me before implementing the backend part).
4. Loading state on the submit button; disable it until a user is found.

### C. Staff list page
1. Each staff row: avatar, name, phone (consistent digits), and a one-line schedule summary (e.g. "شنبه تا چهارشنبه، ۰۹:۰۰–۱۷:۰۰") or a "برنامه تنظیم نشده" warning badge.
2. Make "برنامهٔ کاری" a clearer secondary button; delete icon with 40x40px target, red on hover, and a confirmation dialog naming the staff member.
3. Replace the tiny "تیم •" eyebrow with a real breadcrumb and turn "۱ کارمند" into a badge beside the title. Add an empty state and a responsive grid (1 col mobile / 2 col desktop).
4. Mark the currently logged-in user with a "شما" badge.