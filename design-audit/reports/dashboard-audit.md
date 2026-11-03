# UI/UX Design Audit — Dashboard

## Page Information

| Field | Value |
| ----- | ----- |
| Page | `/dashboard` (owner hub) |
| Product | Persian RTL salon CRM (sidebar brand: BookFlow; document title: BarberCRM) |
| Audited as | Salon owner managing day-to-day salon operations |
| Viewports | Desktop 1440×900 · Tablet 768×1024 · Mobile 390×844 |
| Evidence | Live app at `http://localhost:4000/dashboard` + screenshots below |
| Skills applied | `design-audit/PRODUCT_CONTEXT.md`, `improve-ui`, `design-review` (rubric), Impeccable `detect` |
| Impeccable detect | Clean (`[]`) on dashboard page + shell chrome sources |
| App code changed | None |

### Screenshot index

| Viewport | File |
| -------- | ---- |
| Desktop 1440×900 | `design-audit/screenshots/dashboard/desktop-1440x900.png` |
| Tablet 768×1024 | `design-audit/screenshots/dashboard/tablet-768x1024.png` |
| Mobile 390×844 | `design-audit/screenshots/dashboard/mobile-390x844.png` |

### Overall Design Score: **6.5 / 10**

Usable hub with a calm indigo RTL identity, but the screen reads as an underfilled launcher: large empty regions, an unbalanced five-card grid, a crushed tablet layout, and duplicated titles/destinations that dilute attention. Structure is sound; craft and operational dashboard clarity need focused work (design-review band ≈ **3/4 — solid, with specific tweaks**).

---

## Dimension scores

| Dimension | Score | Brief rationale |
| --------- | ----- | --------------- |
| Visual Hierarchy | **6 / 10** | Title is clear, but five equal-weight cards + mirrored sidebar give no primary path; mobile stacks two “داشبورد” titles. |
| Layout & Composition | **5.5 / 10** | RTL shell is correct; incomplete 3+2 / 2+2+1 grids and ~half-viewport empty space on desktop/tablet hurt balance. |
| Typography | **7.5 / 10** | Modam hierarchy works on desktop (32px title); mobile body title ink drifts warm (`#221F1C`) vs system indigo ink. |
| Spacing | **6.5 / 10** | Card/sidebar padding feels intentional; vertical rhythm collapses into a large unused lower canvas. |
| Component Quality | **7.5 / 10** | Soft white cards, Lucide icons, sidebar user card, and mobile tab active state match product language. |
| Information Density | **5 / 10** | Appropriately simple for non-technical owners, but as a “Dashboard” it carries almost no operational information—only a second nav. |
| Responsive Visual Quality | **5 / 10** | Mobile hub is usable; tablet keeps a 232px sidebar and squeezes cards to ~141px wide—clearly not designed for that width. |

---

## 1. Critical UX Problems

*No critical findings.* The hub remains usable: destinations are labeled in Persian, tappable/clickable, and reachable from sidebar (desktop/tablet) or cards + tab bar (mobile). Nothing observed blocks completing the primary task of opening a management module.

---

## 2. Visual Design Improvements

### UI-001: Tablet layout crushes hub cards beside a full sidebar

| Field | Detail |
| ----- | ------ |
| Severity | **High** |
| Viewport | Tablet 768×1024 |
| Exact location | Main hub grid left of the 232px sticky sidebar |
| Current behavior | At 768px (`md` breakpoint) the desktop sidebar remains visible (~232px). Main content width ≈ 536px. Hub uses a 3-column card grid; measured card width ≈ **141px** at 128px height. Persian descriptions sit in a very narrow column. |
| Why it is a problem | Salon owners on iPad-class widths get neither a comfortable desktop composition nor the mobile two-column hub. Text and icons compete inside undersized cards; the layout feels like a scaled-down desktop, not a designed tablet experience. |
| Recommended improvement | Introduce an intermediate breakpoint: hide or collapse the sidebar before 3-column cards become this narrow, **or** force the hub to 2 columns while the sidebar is present so cards stay ≥ ~200px content width. |
| Expected UX impact | Tablet users can read module names and descriptions without strain and perceive the product as intentionally responsive. |
| Screenshot reference | `design-audit/screenshots/dashboard/tablet-768x1024.png` |

---

### UI-002: Mobile shows “داشبورد” twice in the first viewport

| Field | Detail |
| ----- | ------ |
| Severity | **High** |
| Viewport | Mobile 390×844 |
| Exact location | Fixed glass `PageHeader` H1 (≈17px, top ~15px) **and** in-body H2 (≈20px, top ~76px), both reading «داشبورد» |
| Current behavior | Live metrics confirm two visible titles with different ink: glass H1 `rgb(30, 27, 75)` vs body H2 `rgb(34, 31, 28)`. Supporting sentence appears only under the second title. |
| Why it is a problem | Duplicate page names waste hierarchy and look unfinished. Attention lands on the word “داشبورد” twice before any module card. Conflicts with PRODUCT_CONTEXT “one job per screen region” and Nielsen #8 (aesthetic and minimalist design). |
| Recommended improvement | Keep the glass-bar title; remove the redundant in-body H2 (retain only the short supporting sentence under the glass spacer), **or** hide the glass title when a local welcome block is shown—not both. |
| Expected UX impact | Faster orientation; first viewport reads as one calm header + actions. |
| Screenshot reference | `design-audit/screenshots/dashboard/mobile-390x844.png` |

---

### UI-003: Five-card grid leaves a permanent empty slot

| Field | Detail |
| ----- | ------ |
| Severity | **Medium** |
| Viewport | Desktop, Tablet, Mobile |
| Exact location | Hub `nav[aria-label="منوی داشبورد"]` grid |
| Current behavior | Desktop/tablet: 3-column row then 2 cards (empty third cell). Mobile: 2-column rows then a single «مشتریان» card with an open cell beside it. Measured on desktop: bottom-row cards at `left` 772 and 452 only. |
| Why it is a problem | The missing cell is visually loud. Composition feels accidental rather than premium. Equal card chrome draws the eye to the hole as much as to the modules. |
| Recommended improvement | Recompose without inventing a sixth product area: e.g. 2×3 with one full-width CTA row, a 2-column desktop grid, or a vertical list of rows. When Bookings ships later, it can occupy a planned slot—do not fake a placeholder tile now. |
| Expected UX impact | The hub feels deliberate and balanced; residual empty canvas reads as calm, not unfinished. |
| Screenshot reference | `desktop-1440x900.png`, `tablet-768x1024.png`, `mobile-390x844.png` |

---

### UI-004: Large unused lower canvas on desktop and tablet

| Field | Detail |
| ----- | ------ |
| Severity | **Medium** |
| Viewport | Desktop 1440×900; Tablet 768×1024 |
| Exact location | Main column below the hub grid |
| Current behavior | Desktop: cards end ≈416px from top; **~484px** of viewport height below remains empty. Tablet: **~608px** empty below cards. |
| Why it is a problem | For a screen named Dashboard, half the viewport with no content weakens premium density and makes the product feel early/incomplete—even though a sparse hub can be intentional. Spatial balance fails the “visually balanced” bar for an owner home. |
| Recommended improvement | Without inventing metrics widgets: tighten top spacing, allow the grid to sit with a clearer bottom anchor (footer hint, short “what’s next” copy, or a single secondary panel using existing card language). Prefer filling with real owner value when available; until then, reduce the perception of abandoned space via composition—not decorative filler. |
| Expected UX impact | First impression shifts from “empty shell” to “focused home.” |
| Screenshot reference | `desktop-1440x900.png`, `tablet-768x1024.png` |

---

### UI-005: Sidebar has no active item on the Dashboard home

| Field | Detail |
| ----- | ------ |
| Severity | **Medium** |
| Viewport | Desktop, Tablet |
| Exact location | `nav[aria-label="ناوبری داشبورد"]` |
| Current behavior | On `/dashboard`, all five sidebar links render inactive (transparent background, gray `rgb(75, 85, 99)`); none have `aria-current`. Active `primary-soft` treatment exists in the system but is unused here. |
| Why it is a problem | Owners lose “you are here” in the persistent nav. Mobile tab bar correctly marks «داشبورد» as `aria-current="page"` with primary color—desktop/tablet do not. Breaks PRODUCT_CONTEXT active-nav convention for this route. |
| Recommended improvement | Add a Dashboard/home item to the sidebar with active state on `/dashboard`, **or** apply a distinct non-link active indicator for the hub state consistent with `primary-soft`. |
| Expected UX impact | Clearer orientation when moving between modules and back to the hub. |
| Screenshot reference | `desktop-1440x900.png`, `tablet-768x1024.png` |

---

### UI-006: Desktop hub cards mirror the sidebar with equal visual weight

| Field | Detail |
| ----- | ------ |
| Severity | **Medium** |
| Viewport | Desktop 1440×900 (also visible on tablet) |
| Exact location | Sidebar links vs main hub cards |
| Current behavior | Same five destinations (Profile, Business, Employees, Services, Customers) appear as sidebar text links and again as large equal cards. No card is emphasized; no card adds status beyond a short description. |
| Why it is a problem | PRODUCT_CONTEXT allows a hub grid, but as rendered the grid does not earn its space: it restates the sidebar at larger size. Two equal navigation systems compete (Nielsen #8). A non-technical owner must decide which chrome to trust. |
| Recommended improvement | Differentiate the surfaces: keep sidebar as persistent IA; make the main hub task-oriented (ordered by likely next step, optional status line per card using existing muted/primary-soft language)—or simplify desktop home to a short welcome + rely on sidebar if the grid adds no new information. |
| Expected UX impact | Less decision friction; main canvas feels purposeful rather than redundant. |
| Screenshot reference | `desktop-1440x900.png` |

---

## 3. Minor Polish

### UI-007: Profile appears twice in mobile chrome + hub

| Field | Detail |
| ----- | ------ |
| Severity | **Low** |
| Viewport | Mobile 390×844 |
| Exact location | Bottom tab «پروفایل» and first hub card «پروفایل» |
| Current behavior | Active tab bar includes Profile; hub grid also leads with Profile. |
| Why it is a problem | Mild redundancy—acceptable for novices, but the first card duplicates a primary tab one thumb-reach away. |
| Recommended improvement | Reorder hub cards to start with Business/Services/Employees (operational modules) and omit Profile from the grid on mobile, or keep Profile only in the tab bar. |
| Expected UX impact | Hub highlights salon work; account access stays in the tab. |
| Screenshot reference | `mobile-390x844.png` |

---

### UI-008: Mobile body title uses off-token warm ink

| Field | Detail |
| ----- | ------ |
| Severity | **Low** |
| Viewport | Mobile 390×844 |
| Exact location | In-body H2 «داشبورد» |
| Current behavior | Computed color `rgb(34, 31, 28)` (`#221F1C`) vs glass title / system `--text-primary` `rgb(30, 27, 75)`. |
| Why it is a problem | Small but visible warmth vs the blue-tinted ink scale documented in PRODUCT_CONTEXT; reads as drift rather than intentional hierarchy. |
| Recommended improvement | Use `text-text-primary` / `#1e1b4b` (or remove the H2 per UI-002). |
| Expected UX impact | Tighter visual system consistency. |
| Screenshot reference | `mobile-390x844.png` (metrics corroborate) |

---

### UI-009: “داشبورد” naming vs launcher-only content

| Field | Detail |
| ----- | ------ |
| Severity | **Medium** (copy / expectation; not a missing Bookings feature finding) |
| Viewport | All |
| Exact location | Page title + subtitle |
| Current behavior | Title promises a dashboard; body only offers module navigation. Subtitle correctly says to pick a section—honest, but subordinate to the stronger title. |
| Why it is a problem | Persian SaaS owners commonly expect today’s overview under «داشبورد». The mismatch is conceptual (Nielsen #2), not a demand to invent KPIs in this audit. |
| Recommended improvement | Either (a) retitle/re-eyebrow the page toward «میز کار» / management menu language that matches content, or (b) when real summary data exists, add a thin status strip above the hub using existing tokens—without fabricating bookings UI now. |
| Expected UX impact | Title and content agree; trust improves for first-time owners. |
| Screenshot reference | All three screenshots |

---

## Overall design assessment

The Dashboard is a **clear, calm, RTL-correct launcher** inside a coherent indigo SaaS shell. Sidebar, soft cards, Lucide icons, and mobile tab active states show real design system discipline. Impeccable static detect reported no anti-pattern hits on the audited sources.

What holds the score down is **composition and role clarity**: an incomplete five-tile grid, large empty lower regions, a painful tablet squeeze, mobile double-title, and desktop navigation said twice. It is production-*plausible* as an early hub, not yet production-*confident* as an owner home.

---

## What's already working well

Preserve these (aligned with `PRODUCT_CONTEXT.md` §6):

1. **Light indigo SaaS identity** — `#f5f6f8` page canvas, white surfaces, primary `#4f46e5` accents.
2. **RTL shell** — sidebar on the inline-end, Persian copy, mirrored structure.
3. **Desktop sidebar pattern** — brand, icon+label nav, user card, logout.
4. **Mobile dual chrome** — glass top bar + bottom tab bar with correct Dashboard active state (`primary` + soft pill).
5. **Hub card language** — `rounded-2xl` (~16px), soft border, `primary-soft` icon wells, short Persian descriptions.
6. **Typography stack** — Modam-first; desktop title ~32px bold reads premium and clear.
7. **Low cognitive entry cost** — non-technical owners can see where to go without charts or jargon.
8. **Motion restraint** — operational calm vs marketing landing (no decorative noise on this screen).

---

## Top 5 recommended improvements (priority order)

1. **Fix tablet composition** (UI-001) — collapse sidebar earlier or switch hub to 2 columns so cards remain readable.
2. **Remove mobile duplicate title** (UI-002) — one «داشبورد» in the first viewport.
3. **Rebalance the five-module grid** (UI-003) — intentional layout without a fake sixth tile.
4. **Mark Dashboard as current in desktop/tablet nav** (UI-005) — restore “you are here.”
5. **Differentiate or slim the desktop hub vs sidebar** (UI-006 + UI-004) — make the main canvas earn its space; reduce empty lower half and redundant equal-weight nav.

---

## Method notes

- Inspected authenticated live UI (not source-only).
- Viewport metrics taken via CDP `Emulation.setDeviceMetricsOverride` + DOM geometry.
- `improve-ui` proof discipline: findings limited to observable UI/UX with screenshots/metrics; Bookings/Settings absence not scored as visual defects.
- `design-review` rubric used for band scoring; citations above lean on Nielsen #2, #8 and PRODUCT_CONTEXT contracts.
- Impeccable full dual-subagent critique snapshot was not persisted; detector scan was run and returned clean; visual critique synthesized into this Senior PD report format as requested.
