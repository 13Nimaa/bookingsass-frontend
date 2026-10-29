You are a senior frontend engineer and UI/UX designer. The project is "BookFlow", a salon CRM/booking dashboard built with Next.js, TypeScript and Tailwind CSS. The UI is Persian (RTL, Vazirmatn-style font). Improve the Services management page (/dashboard/services) and its "Add service" modal.

Work step by step. Before each change, briefly explain what you will change and why, and which files are affected. Do NOT introduce new libraries or abstractions unless I approve them first. Keep the code simple. Tell me when a good git commit point is reached.

### A. "Add/Edit service" modal
1. Price field: format live with thousands separators (e.g. ۴۰,۰۰۰), store the raw number in form state, show "تومان" as an inline suffix inside the input, and remove the redundant helper text.
2. Use one digit system consistently (Persian digits for display), with tabular numbers. Use inputMode="numeric" on numeric inputs.
3. Duration field: add quick-select chips (15, 30, 45, 60, 90 min) plus the numeric input. Validate min/max (e.g. 5–240) with an inline Persian error message.
4. Add a placeholder to the title field (e.g. "مثلاً: کوتاهی مو"), autofocus it, close on Esc and on overlay click (confirm if dirty), and add a close (X) button at the top start corner.
5. RTL action row: primary button "ثبت خدمت" at the start (right), "انصراف" as a ghost button next to it. Remove the "+" icon from the submit button. Add a loading state and disable while submitting.
6. Move the field icons to the start side or remove them. Add required markers and field-level validation messages.
7. Accessibility: role="dialog", aria-modal, aria-labelledby, focus trap, return focus to the trigger, visible focus rings.

### B. Services page
1. Raise the meta text (price/duration) to at least 13–14px with a darker gray (contrast ≥ 4.5:1). Make price font-weight medium/semibold.
2. Delete button: 40×40px minimum hit area, red hover state, and a confirmation dialog that names the service.
3. Replace the tiny "خدمات •" eyebrow with a real breadcrumb or remove it. Turn the "۱ خدمت" counter into a badge next to the title.
4. Bring the "افزودن خدمت" button closer to the page header (same row, aligned to the end) and make the layout a responsive grid (1 column on mobile, 2 on desktop) so the page doesn't look empty.
5. Design an empty state (illustration/icon, short Persian text, primary CTA) for when there are no services.
6. Give each service a distinct visual (colored initial or category icon) instead of the same sparkle icon.
7. Add a toast for success/error after create, edit and delete, and skeleton loaders while fetching.

### C. Sidebar
Keep the Persian/English language consistent, add a user avatar, make the logout button clearly visible, and keep the active-item indicator.

### Rules
- Respect RTL everywhere (logical properties: ms-/me-/ps-/pe-, text-start/text-end).
- Mobile-first and responsive. Respect prefers-reduced-motion.
- Keep a single design token set (colors, radius, spacing) and don't hardcode values.
- After finishing, give me a short summary of each file changed and its role, and a suggested commit message.