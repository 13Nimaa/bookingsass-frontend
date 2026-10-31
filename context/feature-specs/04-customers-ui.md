# Redesign Customers Dashboard Page – UI/UX Only

Redesign the Customers management page of BookingSaaS.

This task is strictly focused on UI/UX, visual design, layout, responsive behavior, and user interactions.

Do not work on backend integration, API implementation, database changes, or application architecture.

The goal is to create a polished, modern, premium CRM experience specifically designed for a salon management SaaS.

The result should look like a professionally designed commercial product, not a generic admin dashboard or an AI-generated template.

---

# 1. Design Direction

**Design style: Light Premium SaaS**

The page should feel:

- Minimal and elegant.
- Professional and trustworthy.
- Warm and welcoming.
- Modern but not overly decorative.
- Easy to scan and operate.
- Consistent with the existing BookingSaaS dashboard.

### Color Palette

Preserve the existing BookingSaaS visual identity:

- Main background: `#fbf8f3`
- Primary text: `#221f1c`
- Primary accent: `#a8492e`
- Primary hover: `#944028`
- Secondary muted green: `#6b7a5e`
- White surfaces: `#ffffff`
- Soft background: `#f5f0e8`
- Borders: `#e4ddd1`
- Error: `#b3423a`
- Warning: `#a8662e`

Do not introduce a purple color palette.

Use subtle shadows, restrained borders, and consistent rounded corners.

Avoid:
- Excessive gradients.
- Glassmorphism.
- Oversized icons.
- Too many decorative elements.
- Excessive card nesting.
- Strong shadows.
- Unnecessary animations.
- Generic dashboard templates.

Use the existing typography and Persian font configuration.

All layouts must be RTL.

---

# 2. Overall Page Structure

The page should have the following hierarchy:

1. Page header.
2. Customer search and filter toolbar.
3. Customer list.
4. Pagination.

Keep the page visually balanced.

Do not add unnecessary dashboard statistics, charts, or large summary cards.

### Desktop Layout

The main content should use the available dashboard width efficiently.

The page header should be separated from the search toolbar.

The search and filter area should feel like one cohesive section.

The customer list should be the main visual focus.

Avoid excessive vertical spacing between sections.

---

# 3. Page Header

Create a clean and elegant header.

### Right Side

- Title: «مشتریان»
- Short description: «مدیریت و مشاهده اطلاعات مشتریان سالن»
- Small customer/users icon.

### Left Side

A prominent primary button:

«افزودن مشتری»

Button details:

- Plus icon.
- Primary background color.
- White text.
- Medium rounded corners.
- Subtle hover transition.
- Clear active and focus states.

Show the total customer count near the page title or as a subtle secondary label.

Example:

«۴۵ مشتری»

Do not turn the count into a large statistics card.

### Responsive Behavior

On mobile:
- Keep the title and description compact.
- Place the Add Customer button in an accessible position.
- Avoid unnecessary empty space.
- Prevent header content from overflowing.

---

# 4. Search and Filter Toolbar

This section must receive special attention.

It should look like a refined CRM toolbar, not a collection of unrelated form controls.

Use a white or subtle surface with a thin border and appropriate spacing.

## A. Search Box

The search box should be the most visually prominent control in the toolbar.

Placeholder:

«جستجو بر اساس نام، شماره موبایل یا ایمیل...»

Design details:

- Search icon positioned correctly for RTL.
- Comfortable input height.
- Clear text alignment.
- Subtle border in default state.
- Primary-colored focus border.
- Soft focus ring.
- Clear button when text exists.
- Smooth focus and hover transitions.
- No unnecessary shadows.

The search field should be wide enough to accommodate the placeholder without looking cramped.

### Search Interactions

- Show a clear icon when the input is not empty.
- Provide an accessible label.
- Keep the input focused and visually stable while typing.
- Do not use distracting animations.
- On mobile, make the search input full width.

## B. Customer Status Filter

Create a compact dropdown.

Label:

«وضعیت مشتری»

Options:

- همه مشتریان
- مشتریان فعال
- مشتریان غیرفعال

Visual requirements:

- Chevron-down icon.
- Selected option clearly visible.
- Compact dimensions.
- Consistent height with other toolbar controls.
- Subtle selected and hover states.
- Clear distinction between default and active filter states.

Use a clean popover menu with comfortable item spacing.

## C. Registration Date Filter

Create a date range filter.

Label:

«تاریخ ثبت»

It should contain:

- از تاریخ
- تا تاریخ

Design requirements:

- Use the existing date-picker UI.
- Follow the Persian calendar and date formatting conventions.
- Do not introduce a visually different date-picker style.
- Display selected dates clearly.
- Use a calendar icon.
- Highlight the selected date.
- Distinguish today from other dates.
- Provide clear hover, disabled, and focus states.
- Use a properly positioned popover.
- Ensure the popover is not clipped by surrounding containers.

When a date range is selected, show a subtle visual indication that the filter is active.

Provide a clear action to remove the selected date range.

On mobile, date selection must remain easy to use without horizontal overflow.

## D. Sorting Dropdown

Create a dedicated sorting control.

Label:

«مرتب‌سازی»

Options:

1. جدیدترین مشتریان
2. قدیمی‌ترین مشتریان
3. نام: الف تا ی
4. نام: ی تا الف
5. آخرین به‌روزرسانی

Design requirements:

- Sorting icon.
- Compact dropdown.
- Selected option clearly visible.
- Appropriate spacing between options.
- Subtle selected background.
- Clear hover state.
- Consistent styling with the status dropdown.

Do not display the sorting options as separate buttons.

## E. Clear All Filters

Add a secondary action:

«پاک کردن فیلترها»

Design requirements:

- Use a reset/rotate icon.
- Prefer a subtle outlined or secondary style.
- Do not compete visually with the Add Customer button.
- Show it only when filters or search are active.
- Provide a clear hover state.

The action should visually communicate that all search and filter settings will be reset.

---

# 5. Customer List – Card-Based Layout

Do not use a traditional HTML table as the primary presentation.

Use a modern responsive card-based customer list.

The desktop version should look like a refined CRM contact list with horizontal customer rows.

Each row must be visually independent but compact.

### Desktop Customer Row Structure

Organize each customer row into these information groups:

**Primary information:**
- Customer avatar.
- Customer full name.
- Phone number.
- Email.

**Secondary information:**
- Customer status.
- Registration date.
- Last updated date.

**Actions:**
- Three-dot menu.

### Visual Hierarchy

Customer name:
- Stronger font weight.
- Main text color.
- Most prominent text in the row.

Phone number:
- Clearly readable.
- Secondary visual priority.
- Easy to scan.

Email:
- Smaller or secondary text.
- Muted color.

Dates:
- Secondary information.
- Smaller typography.
- Consistent alignment.

Status:
- Compact badge.
- Clear text and color.

Do not give all fields equal visual importance.

### Row Appearance

Each row should have:

- White background.
- Subtle border.
- Consistent rounded corners.
- Comfortable padding.
- Balanced spacing.
- Subtle hover background.
- Smooth border/background transition.
- Clear visual separation from neighboring rows.

Avoid heavy shadows.

Avoid making the rows excessively tall.

The list should comfortably display multiple customers without wasting vertical space.

---

# 6. Customer Avatar

Every customer should have a circular avatar.

If no profile image is available, use a generated initials-based fallback.

Requirements:

- Consistent dimensions.
- Proper Persian initials handling.
- Neutral, elegant background colors.
- Consistent color assignment for the same customer.
- Proper alignment with customer information.

Do not use random colors on every render.

Do not use unrelated stock profile photos.

If a customer name is unavailable, use a neutral user icon.

---

# 7. Customer Status Badge

Use compact status badges.

### Active

Text:

«فعال»

Appearance:
- Soft green background.
- Green text.
- Optional small green indicator.

### Inactive

Text:

«غیرفعال»

Appearance:
- Soft red or neutral background.
- Clearly readable text.
- Optional small status indicator.

Requirements:
- Use both text and color.
- Keep badges compact.
- Avoid highly saturated colors.
- Ensure consistent badge sizing.

---

# 8. Customer Row Actions

Use a three-dot menu instead of displaying multiple action buttons in every row.

Menu options:

- مشاهده جزئیات
- ویرایش مشتری
- حذف مشتری

### Dropdown Design

- Correct RTL alignment.
- White background.
- Subtle border and shadow.
- Comfortable item spacing.
- Appropriate icons.
- Clear hover states.
- Proper positioning.
- Must not be clipped by the customer row.

The delete action must use a destructive color.

Clicking the menu must not trigger the customer row click.

### Customer Row Interaction

The main row should have a subtle clickable hover state.

Clicking the customer information area should communicate that more details are available.

Do not make the action menu and its buttons trigger the row interaction.

---

# 9. Mobile Design – A First-Class Experience

Do not simply shrink the desktop layout.

Do not use horizontal scrolling.

At mobile breakpoints, transform customer rows into vertical cards.

### Mobile Customer Card

Top section:

- Avatar.
- Customer name.
- Status badge.
- Three-dot menu.

Middle section:

- Phone number.
- Copy phone action.
- Email if available.

Bottom section:

- Registration date.
- Optional last updated date.

### Mobile Card Design

- White background.
- Subtle border.
- Comfortable padding.
- Rounded corners.
- Clear separation between cards.
- Appropriate touch targets.
- No unnecessary visual elements.

### Mobile Information Rules

- Customer name should be prominent.
- Phone number must be easy to find.
- Long email addresses must not overflow.
- Long names must wrap or truncate gracefully.
- Dates can use smaller typography.
- Less important details should not dominate the card.

### Mobile Toolbar

The toolbar must adapt naturally:

1. Search input takes full width.
2. Status and sorting controls use compact layouts.
3. Date range control remains accessible.
4. Clear filters action must remain easy to reach.

Controls may wrap into multiple rows.

Do not compress every filter into one horizontal row.

Avoid horizontal overflow at all mobile widths.

---

# 10. Pagination Design

Create a clean pagination section below the customer list.

Display:

- Previous button.
- Page numbers when space allows.
- Current page.
- Next button.
- Total customer count or displayed range.

Example:

«نمایش ۱ تا ۲۰ از ۴۵ مشتری»

### Visual Requirements

- Current page uses the primary color.
- Other page numbers use subtle backgrounds.
- Previous and Next buttons have clear disabled states.
- Use consistent dimensions.
- Avoid oversized controls.
- Keep enough spacing for touch interaction.

### Mobile Pagination

On mobile, simplify the layout:

- Previous button.
- Current page / total pages.
- Next button.

Do not show a long sequence of page numbers on narrow screens.

---

# 11. Loading Skeletons

Create polished skeleton states that match the final customer list layout.

### Desktop

Show multiple horizontal skeleton rows with placeholders for:

- Avatar.
- Name.
- Phone.
- Email.
- Status.
- Dates.
- Action menu.

### Mobile

Show vertical skeleton cards matching the mobile card structure.

Requirements:

- Use subtle neutral colors.
- Avoid aggressive flashing animations.
- Prevent layout shifts.
- Keep skeleton dimensions close to the actual content.

Do not replace the entire page with a large spinner.

---

# 12. Empty States

Create visually distinct empty states.

### A. No Customers

Title:

«هنوز مشتری‌ای ثبت نشده است»

Description:

«با افزودن اولین مشتری، مدیریت اطلاعات مشتریان سالن را شروع کنید.»

Primary action:

«افزودن اولین مشتری»

Use a subtle, relevant icon or illustration.

### B. No Search Results

Title:

«مشتری‌ای پیدا نشد»

Description:

«مشتری‌ای با عبارت جستجوی شما مطابقت ندارد.»

Action:

«پاک کردن جستجو»

### C. No Filter Results

Title:

«موردی مطابق فیلترها پیدا نشد»

Description:

«فیلترهای انتخاب‌شده را تغییر دهید یا همه فیلترها را پاک کنید.»

Action:

«پاک کردن فیلترها»

Requirements:

- Each empty state must have a different message and appropriate action.
- Avoid oversized illustrations.
- Keep the design minimal and professional.
- Center the content within the available list area.

---

# 13. Delete Confirmation Dialog

Create a polished confirmation dialog for customer deletion.

Title:

«حذف مشتری»

Description:

«آیا از حذف این مشتری اطمینان دارید؟ این عملیات ممکن است قابل بازگشت نباشد.»

Actions:

- انصراف
- حذف مشتری

Design requirements:

- Clear destructive action.
- Primary visual focus on the confirmation.
- Appropriate spacing.
- Consistent dialog styling.
- Responsive width.
- Correct RTL layout.
- Prevent accidental clicks outside from causing deletion.

Show a loading state on the destructive button while an operation is in progress.

Do not make the dialog unnecessarily large.

---

# 14. Toast Notifications

Use the existing toast/notification design system.

Examples:

Success:
- «مشتری با موفقیت اضافه شد»
- «اطلاعات مشتری با موفقیت ویرایش شد»
- «مشتری با موفقیت حذف شد»

Error:
- «عملیات انجام نشد. لطفاً دوباره تلاش کنید.»

Requirements:

- Subtle appearance.
- Proper placement for RTL.
- Clear success/error distinction.
- Appropriate icons.
- Consistent typography.
- No oversized notifications.

---

# 15. Responsive Breakpoints

Ensure the complete page works correctly at:

- Large desktop: 1440px and above.
- Desktop: 1024px–1439px.
- Tablet: 768px–1023px.
- Mobile: 375px–767px.
- Small mobile: 320px–374px.

Pay special attention to:

- Toolbar wrapping.
- Dropdown positioning.
- Date picker positioning.
- Long customer names.
- Long email addresses.
- Pagination width.
- Dialog width.
- Sidebar/content spacing.
- RTL alignment.

No horizontal overflow should occur.

---

# 16. Motion and Micro-interactions

Use restrained transitions.

Recommended:
- 150–200ms transitions.
- Subtle hover background changes.
- Small border color transitions.
- Clear dropdown open/close behavior.
- Subtle button press feedback.
- Smooth but minimal focus states.

Avoid:
- Large card movement.
- Bouncy animations.
- Excessive scaling.
- Decorative animations.
- Long transitions.

Respect reduced-motion preferences where applicable.

---

# 17. Final Design Quality Checklist

Before considering the UI complete, verify:

- The page has a clear visual hierarchy.
- The search box is prominent and easy to use.
- Filters are compact and understandable.
- Sorting is easy to discover.
- Active filters are visually identifiable.
- Clear filters is easy to find.
- Customer rows are compact and readable.
- Customer names are the primary visual focus.
- Status badges are consistent.
- Action menus are correctly positioned.
- Desktop does not look like a traditional data table.
- Mobile uses vertical customer cards.
- No horizontal scrolling exists.
- Empty states are visually distinct.
- Skeletons match the actual layout.
- Dialogs and dropdowns work correctly in RTL.
- All colors match BookingSaaS.
- The page looks cohesive with the existing dashboard.

The final result should feel like a premium, production-quality salon CRM.

**Important:** Focus entirely on the visual design and user experience described above. Do not spend time analyzing or implementing backend connectivity, API contracts, database logic, or application architecture.