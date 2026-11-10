# Phase 1 — Public Salon Discovery Page

Implement the public Salon Discovery page based on the approved visual reference image.

The reference image defines the intended visual direction and layout. Reproduce its overall composition, visual hierarchy, spacing, card proportions, and warm aesthetic as closely as possible while adapting it to the existing BookingSaaS components and design system.

This is a public customer-facing page, not part of the business dashboard.

## 1. Overall Visual Direction

Create a premium, warm, elegant salon discovery experience.

The design should feel:
- Modern and professional.
- Visually inviting and image-focused.
- Minimal without feeling empty.
- Premium without excessive decoration.
- Consistent with the existing BookingSaaS visual identity.


Avoid introducing a new color palette.

## 2. Public Navigation Header

Create a horizontal RTL navigation header matching the reference.



### Styling

- White or warm off-white background.
- Height approximately 76–82px on desktop.
- Subtle bottom border.
- Brand name in the primary accent color.
- Small, consistent navigation icons.
- Active link indicated by a subtle accent underline.
- Login/register action as a filled terracotta button with rounded corners.

Keep the header compact. Do not turn it into a dashboard navigation bar.

On mobile:
- Use a compact responsive navigation.
- Keep the brand visible.
- Place navigation links inside an accessible mobile menu.
- Keep login/register accessible.
- Avoid horizontal overflow.

## 3. Hero Section

Create a visually distinctive introduction section directly below the header.

### Content

Title:
«سالن‌های زیبایی»

Supporting text:
«سالن موردنظرت رو پیدا کن و نوبتت رو آنلاین رزرو کن»

### Layout and Styling

- RTL alignment.
- Large but controlled heading.
- Supporting text below the heading.
- A subtle botanical or beauty-related decorative icon near the heading.
- Warm cream background.
- Very subtle abstract decorative shapes in the background.
- Optional botanical visual detail near the left edge, inspired by the reference.

Keep decorative elements low-contrast and behind the content.

The hero must not consume too much vertical space. The salon cards should appear without excessive scrolling.

## 4. Search and Filter Toolbar

Place the search/filter toolbar below the hero.

Use one horizontal row on desktop.

### Search Input

- Occupies the largest portion of the available width.
- RTL input direction.
- Placeholder: «نام سالن یا شهر موردنظرت رو جستجو کن...»
- Search icon positioned appropriately for RTL.
- Rounded corners.
- White surface.
- Subtle warm neutral border.

### City Filter

- Dropdown with the label or default value «همه شهرها».
- Small location-related icon.
- Consistent height with the search input.

### Service Filter

- Dropdown with the default value «همه خدمات».
- Small scissors/service icon.
- Use only categories or service options supported by actual API data.

### Additional Filter Action

- A compact «فیلترها» action with a filter icon.
- Only show additional filters that are backed by existing API capabilities.
- Do not introduce decorative or non-functional filter controls.

### Responsive Behavior

Desktop:
- Search and filters in one row.
- Consistent 60–64px control heights.
- Balanced gaps.

Tablet:
- Allow controls to wrap naturally.

Mobile:
- Stack search and filters vertically.
- Full-width controls.
- Keep spacing compact.
- No horizontal scrolling.

## 5. Salon Cards Grid

This is the most important part of the page.

Use a three-column responsive grid on desktop.

### Grid

- Three cards per row on wide desktop screens.
- Two columns on tablet.
- One column on mobile.
- Consistent card dimensions and spacing.
- Approximately 24px gap between desktop cards.

### Card Structure

Each salon card should have two main sections:

**A. Cover Image**

- Full card width.
- Aspect ratio approximately 1.55:1.
- Consistent image height across all cards.
- `object-fit: cover`.
- Rounded top corners.
- Use the actual salon image returned by the API when available.
- If no image exists, use a tasteful neutral fallback consistent with the brand.

Add a small bookmark/save icon button over the image in the top-left corner.

Do not implement a fake save interaction if no save functionality exists.

**B. Card Information**

Use a clean RTL layout with the following hierarchy:

1. Salon name
2. Location
3. Short description
4. Service highlights
5. Action buttons

### Salon Name

- Strong visual emphasis.
- Approximately 20–22px desktop.
- Dark main text.
- Single or two-line title with graceful truncation.

### Location

- Location pin icon.
- Display city and a short address when available.
- Smaller muted typography.
- Keep it visually close to the salon name.

### Description

- Use a short description from the actual API response.
- Approximately 14–15px.
- Line height comfortable for Persian text.
- Clamp to two lines.
- Do not invent descriptions for salons without one.

### Service Highlights

- Display a small number of available service names or categories only if supported by the API response.
- Use small warm beige pills.
- Rounded pill shape.
- Avoid too many tags.
- If service information is unavailable, do not render fake tags.

### Action Buttons

At the bottom of each card, place two actions side by side:

**Primary action:**
«رزرو نوبت»

- Filled terracotta background.
- White text.
- Calendar icon.
- Slightly stronger visual emphasis.

**Secondary action:**
«مشاهده سالن»

- White or transparent background.
- Thin warm neutral border.
- Dark text.
- Arrow icon.

Both buttons must have consistent height and alignment.

The card should have:
- White or warm-white background.
- Subtle border.
- Rounded corners approximately 16px.
- Very light shadow only if consistent with existing components.
- No excessive gradients.
- No oversized decorative elements.

## 6. Card Interaction and Navigation

- Clicking the salon card or «مشاهده سالن» navigates to that salon's public detail route.
- «رزرو نوبت» navigates to the booking entry point for that specific salon.
- Prevent nested click handlers from triggering conflicting navigation.
- Use the actual business/salon ID or slug returned by the existing API.
- Do not invent route identifiers.
- The bookmark button must not trigger card navigation.

Do not implement the salon detail page or booking flow in this phase.

## 7. Pagination and Results Summary

At the bottom of the listing:

- Display pagination if the backend supports it.
- Use compact page buttons.
- Active page uses the primary terracotta accent.
- Inactive pages use white surfaces and subtle borders.
- Display a Persian result summary such as «نمایش ۱ تا ۹ از ۲۴ سالن» only when the API provides the necessary counts.
- Do not simulate pagination if the API does not support it.

## 8. Loading, Empty, and Error States

### Loading

- Use salon card skeletons.
- Match the final card image and content proportions.
- Keep the page header and filter toolbar stable.
- Avoid a full-page spinner.

### Empty State

For an empty salon listing:
- Use a subtle search/location illustration or icon.
- Title: «هنوز سالنی ثبت نشده است»
- Short supporting text.
- Avoid excessive artwork.

For no search/filter matches:
- Title: «سالن موردنظرت پیدا نشد»
- Provide a «پاک کردن فیلترها» action.

### Error State

- Show a clear Persian error message.
- Provide a retry action.
- Preserve the page layout.

### Image Fallback

- Handle missing or failed salon images gracefully.
- Do not show broken image icons.
- Use a neutral, branded fallback.

## 9. API and Data Integration

- Use the existing public salon/business listing endpoint.
- Reuse existing API client conventions and response types.
- Use actual backend fields.
- Do not invent endpoint URLs, DTO properties, query parameters, or response data.
- Do not use authenticated business-owner endpoints for public browsing.
- Do not replace real API data with mock data.

Only implement search, filters, and pagination when supported by the existing backend contract.

If a required public listing endpoint or response field does not exist, do not modify the backend in this phase. Report the exact missing contract.

## 10. Scope Restrictions

- Do not implement salon detail functionality.
- Do not implement booking creation.
- Do not implement favorites/bookmarks persistence.
- Do not modify backend code or database migrations.
- Do not modify business dashboard pages.
- Do not introduce fake ratings, reviews, prices, or availability.
- Do not refactor unrelated features.

## 11. Quality and Acceptance Criteria

1. The page visually follows the approved reference.
2. The warm BookingSaaS identity is preserved.
3. Desktop layout has three balanced salon cards per row.
4. Tablet and mobile layouts adapt cleanly.
5. Salon information comes from real API data.
6. Search and filters only use supported functionality.
7. Both card navigation actions use the correct salon identifier.
8. Loading, empty, error, and image fallback states are implemented.
9. Persian RTL layout and typography are polished.
10. Existing public pages and dashboard functionality remain unaffected.

Run TypeScript, ESLint, relevant tests, and production build.

Report changed files and test results. Implement only Phase 1. Do not proceed to Phase 2.