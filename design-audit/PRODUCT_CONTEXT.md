# Product Context — UI/UX Audit Reference

Source of truth for design audits of this product. Prefer the **shipped implementation** and accepted context docs over taste or external patterns.

**Governing sources used for this document**

- `src/app/globals.css` (tokens)
- `context/ui-context.md`, `context/shared-components.md`, `context/project-overview.md`, `context/architecture-context.md`
- Dashboard chrome: `src/components/layout/sidebar.tsx`, `mobile-tab-bar.tsx`, `src/components/shared/page-header.tsx`
- Primitives: `src/components/ui/{button,input,dialog}.tsx`
- Owner surfaces under `src/features/*/components/*-dashboard.tsx` and `src/app/(dashboard)/`

Do not invent tokens, palettes, or redesign directions during audits. If a decision is not evidenced below, mark it **unknown**.

---

## 1. Product purpose and primary user needs

### Purpose

Persian (RTL) salon / booking management SaaS CRM. Business owners register, manage salon profile, employees, services, and customers; customers discover businesses and book services. This repo is the Next.js App Router frontend talking to an external .NET backend.

Product metadata currently uses the title **BarberCRM** (`src/app/layout.tsx`). Sidebar branding shows **BookFlow**. Context docs refer to **BookingSaaS**. **Canonical customer-facing product name for audits: unknown** — cite the string as rendered on the audited surface.

### Primary users

- Salon owners (BusinessOwner) managing day-to-day operations
- Salon staff / employees (role-aware UX is incomplete; backend enforces authorization)
- Secondary: public visitors browsing businesses and (when complete) booking

Users may have limited technical experience. Interfaces should stay clear, calm, and easy to understand — professional and premium without complexity theater.

### Main product areas (intended vs shipped)

| Area | Intended role | Current implementation evidence |
| ---- | ------------- | -------------------------------- |
| Dashboard | Hub to reach management modules | `/dashboard` — menu grid + chrome |
| Customers | Manage salon customers | `/dashboard/customers` + feature dashboard |
| Services | Catalog of services, price, duration | `/dashboard/services` + feature dashboard |
| Employees | Staff + working hours | `/dashboard/employees` + feature dashboard |
| Bookings | Appointments / نوبت‌ها | API/types exist (`features/booking`, booking endpoints); **no owner bookings dashboard route or sidebar item yet** |
| Settings | Account / product settings | **No settings route or nav item found** |
| Profile / Business | Account + salon profile | `/dashboard/profile`, `/dashboard/business` (present in sidebar; often grouped under dashboard ops) |

Audits of Bookings or Settings should treat missing UI as **out of scope / not yet designed**, not as defects against a finished screen.

### Core owner needs (from product goals + existing copy)

1. Sign in / register with phone + password; restore session reliably.
2. Register or update salon business profile (and imagery).
3. Manage employees and related working-hours flows.
4. Manage services and customers once available.
5. Navigate the owner shell comfortably on desktop and mobile (RTL).
6. Reach bookings management when that surface ships.

---

## 2. Existing visual identity and design direction

| Decision | Evidence |
| -------- | -------- |
| Light mode only | No dark theme / `next-themes`; project scope excludes dark mode |
| Clean indigo SaaS | Primary indigo (`#4f46e5`) on soft cool-gray page background |
| Soft surfaces | White / near-white cards on `#f5f6f8` page canvas |
| Blue-tinted ink | Text scale uses indigo-navy inks (`#1e1b4b`, `#3730a3`), not pure black |
| Premium calm CRM | Soft borders, generous radius, restrained shadow; primary-soft for active/selected |
| Persian RTL default | `lang="fa"` `dir="rtl"` on root; Persian UI copy by default |
| Marketing vs product | Landing/marketing can use richer motion; dashboard is quieter and operational |

**Not the direction:** warm cream + terracotta editorial looks, purple-glow glassmorphism for product chrome, dense newspaper layouts, or dark dashboards.

---

## 3. Existing typography, colors, spacing, borders, radii, and component conventions

### Typography

| Role | Stack | Token / class |
| ---- | ----- | ------------- |
| Body | Modam (Persian) + Inter (Latin) + system | `--font-body` / `font-body` / `font-sans` |
| Display | Modam + Fraunces | `--font-display-stack` / `font-display` |

Observed conventions:

- Desktop page titles (~`PageHeader`): ~28–32px bold, tight tracking, `text-balance`
- Mobile glass header title: ~17px extrabold, centered
- Labels: `text-sm font-bold`
- Body / descriptions: often `text-sm`–`15px`, medium weight, muted slate (~`slate-600` / `--muted`)
- Headings: slight negative tracking (`-0.01em` on `h1–h3`); avoid aggressive `tracking-tighter` on Persian (joins break)
- Metrics: `.tnum` for tabular lining numerals
- Phone / LTR snippets: explicit `dir="ltr"` where needed

### Color tokens (`:root` in `globals.css`)

| Role | CSS variable | Hex |
| ---- | ------------ | --- |
| Page background | `--background` | `#f5f6f8` |
| Foreground | `--foreground` | `#1e1b4b` |
| Primary | `--primary` | `#4f46e5` |
| Primary hover | `--primary-hover` | `#4338ca` |
| Primary pressed | `--primary-pressed` | `#3730a3` |
| Primary soft | `--primary-soft` | `#eef2ff` |
| Primary subtle | `--primary-subtle` | `#e0e7ff` |
| Surface | `--surface` | `#ffffff` |
| Surface hover | `--surface-hover` | `#fcfcfd` |
| Surface secondary | `--surface-secondary` | `#f3f4f6` |
| Surface subtle | `--surface-subtle` | `#fafafa` |
| Border | `--border` | `#dfe2e7` |
| Border strong | `--border-strong` | `#cbd0d8` |
| Border subtle | `--border-subtle` | `#eceef2` |
| Text primary | `--text-primary` | `#1E1B4B` |
| Text secondary | `--text-secondary` | `#3730a3` |
| Muted | `--muted` | `#475569` |
| Text disabled | `--text-disabled` | `#94a3b8` |
| Success | `--success` | `#16a34a` (+ soft/border/text variants) |
| Warning | `--warning` | `#d97706` (+ variants) |
| Error | `--error` | `#dc2626` (+ variants) |
| Info | `--info` | `#2563eb` (+ variants) |
| Premium | `--premium` | `#5b21b6` (+ soft/border) |

Prefer mapped Tailwind token classes (`bg-primary`, `bg-surface`, `text-text-primary`, `border-border`, …) over inventing hex. Some screens still hardcode neutrals (e.g. `#4B5563`, `#6B7280`, `#221F1C`, `#E4E7EC`) — treat **token values as the system contract**; hardcoded near-matches are implementation drift to note in audits only when they harm clarity or break an explicit contract.

### Spacing and density

No formal spacing scale document beyond Tailwind usage. Observed product patterns:

- Dashboard main padding often `px-4` → `sm:px-8/10`, vertical `py-8`–`py-10` or `pt-5`/`pt-9`
- Content max widths commonly `max-w-5xl` (home) to `max-w-7xl` (module pages)
- Card internal padding often `p-4`–`p-6` / `sm:p-5`
- Nav item height ~`h-11`; form inputs `h-12`; many form CTAs `h-11`–`h-12`
- Mobile bottom spacer `h-[74px]`; mobile top header spacer `h-14`

**Canonical 4/8 spacing token set: unknown** (use observed Tailwind spacing on the audited surface).

### Borders and radii

| Context | Typical treatment |
| ------- | ----------------- |
| Page / panel borders | `border-border` (soft); hover/emphasis `border-border-strong`; dividers `border-border-subtle` |
| Inputs | `rounded-xl`, `border-border`, surface fill |
| Buttons (primitive default) | `rounded-2xl` |
| Cards / list panels | often `rounded-2xl` + soft border + white surface |
| Dialogs | `rounded-[1.75rem]` large shell, soft border, deep indigo-tinted shadow |
| Sidebar nav pills | ~`rounded-[11px]`; user card ~`rounded-[14px]` |
| Icon wells | often `rounded-xl` or `rounded-[12px]` on `primary-soft` |

Shadows are restrained (light card lift / dialog depth using indigo-navy alpha), not multi-layer neon glow.

### Component conventions

| Need | Use |
| ---- | --- |
| Primary actions | `Button` from `@/components/ui/button` (variants: default, outline, secondary, ghost, destructive, link) |
| Text fields | `Input` (RTL, label, error, hint, icons); height 12, `rounded-xl` |
| Selects | `SelectField` / select primitives |
| Modals | `Dialog*` |
| Destructive / confirm | `ConfirmDialog` (`tone`: danger \| primary) |
| Page chrome title | `PageHeader` |
| Inline errors | `AuthError` (used beyond auth) |
| Icons | Lucide; common `h-4 w-4` / `h-5 w-5` / size 18–20 in nav |
| Loading on submit | `Loader2` + `animate-spin` |
| Skeleton | `.skeleton-shimmer` (no shared Skeleton primitive yet) |
| Empty states | Inline dashed-border centered panels in feature dashboards |

Stack: Base UI + CVA + Tailwind v4. Prefer existing primitives over one-offs.

**Note:** Default `Button` sizes in the primitive are relatively compact (`h-8` default). Several product forms override to taller control heights (`h-10`–`h-12`). Audits should compare like with like on the audited screen rather than assuming one height everywhere.

---

## 4. Existing navigation and layout patterns

### Global direction and language

- Root: Persian RTL
- User-facing copy: Persian unless a screen is explicitly bilingual
- Back affordances: RTL-aware (`BackButton` / mobile `ArrowRight` as back)

### Marketing

- Sticky `Navbar` (desktop) + `MobileTabBar` (mobile)
- Landing sections under `features/landing` — marketing only; do not treat as product-shell patterns

### Auth

- No dashboard chrome
- Split-screen / brand panel patterns (`AuthFormSplitScreen`, `AuthBrandPanel`)

### Dashboard shell

```
AuthGuard
└─ flex column (mobile) / row (md+)
   ├─ Sidebar (md+, sticky, ~232px, border-e, right side in RTL)
   ├─ Main content (flex-1, min-w-0)
   └─ MobileTabBar (fixed bottom, md:hidden)
```

**Desktop sidebar nav (current):** Profile, Business, Employees, Services, Customers — plus brand link, user card, logout. Active: `bg-primary-soft` + primary text. Inactive: medium gray text, hover `surface-secondary`.

**Mobile tab bar (authenticated):** Home, Businesses, Dashboard, Profile. Guest: Home, Businesses, Login. Fixed surface glass bar; active label primary + soft pill behind icon.

**Page header**

- Mobile: fixed glass top bar (back + centered title); description/actions below
- Desktop: optional back, primary eyebrow + dot, large title, description, actions
- Dashboard home: `hideBack`

**Dashboard home**

- Desktop: `PageHeader` + management grid
- Mobile: glass title + local welcome copy + two-column management grid + logout button (sidebar hidden)

Do not duplicate full sidebar link lists into desktop main content beyond intentional hub grids.

---

## 5. Important UX principles relevant to this product

1. **Clarity over density** — Owners and staff may not be power users; prioritize obvious next actions, plain Persian labels, and calm empty states.
2. **RTL integrity** — Mirroring for icons, back, padding, and start/end placement is non-negotiable.
3. **Token fidelity** — Brand/surface/text colors should come from the established CSS variables; do not introduce a second palette.
4. **Compose, don’t fork** — Prefer `components/ui` + `shared` + layout chrome; domain UI stays in `features/`.
5. **One job per screen region** — Header explains the page; body performs the task; confirm destructive work in `ConfirmDialog`.
6. **Responsive parity of task, not identical chrome** — Desktop sidebar vs mobile tabs/grid is intentional; both must reach the same management destinations that exist.
7. **Feedback in place** — Loading (shimmer / spinner), errors (`AuthError` / inline), success banners where already used — keep users oriented without cryptic failure.
8. **Light, premium calm** — Soft surfaces, indigo accent for selection and CTAs, restrained motion (`motion-reduce` respected). Prefer intentional small motion over decorative noise on CRM screens.
9. **Don’t audit unfinished modules as broken design** — Bookings owner UI and Settings are not shipped surfaces yet.
10. **Preserve identity in recommendations** — Audit improvements should refine hierarchy, consistency, and usability within this indigo RTL system — not replace it.

---

## 6. Existing design decisions that should be preserved

Preserve these unless a later explicit product decision supersedes them:

1. **Light-only indigo SaaS identity** with soft gray page background and white surfaces.
2. **Modam-first Persian typography** (Inter/Fraunces as Latin fallbacks only).
3. **RTL-first root** (`lang="fa"` `dir="rtl"`) and Persian default copy.
4. **CSS variable color system** in `globals.css` / `@theme inline` as the palette contract.
5. **Dashboard dual chrome:** sticky sidebar (desktop) + fixed mobile tab bar; glass mobile `PageHeader`.
6. **Active navigation treatment:** `primary-soft` background + primary ink/icon (not heavy filled bars).
7. **Card language:** soft `border-border`, `bg-surface`, generous `rounded-2xl` (dialogs `rounded-[1.75rem]`).
8. **PageHeader pattern** for module titles (eyebrow optional, description, actions).
9. **Shared primitives** (`Button`, `Input`, `Dialog`, `ConfirmDialog`, `SelectField`, `AuthError`) as the interaction vocabulary.
10. **Lucide stroke icons** at modest sizes; `Loader2` for busy actions; `.skeleton-shimmer` for layout loading.
11. **Feature dashboards own domain UI**; route `page.tsx` files stay thin.
12. **Marketing landing motion and visuals stay separate** from operational CRM chrome.
13. **No dark mode** in current scope.
14. **Destructive actions go through confirm** (`ConfirmDialog`) rather than silent deletes.

### Explicit unknowns (do not guess in audits)

- Canonical public brand name (BarberCRM vs BookFlow vs BookingSaaS)
- Formal spacing / type scale beyond observed usage
- Final IA for Bookings and Settings (routes, nav placement, information architecture)
- Whether mobile tab “Dashboard” active-state scope (currently includes `/dashboard/business`) is intentional long-term
- Target information density for bookings calendars / schedules (not shipped)
- Whether hardcoded neutral hexes on some screens are intentional exceptions or drift

---

## How auditors should use this file

1. Read this document before scoring a page.
2. Trace the audited surface’s actual components and tokens.
3. Judge against **this product’s** identity and conventions — not generic SaaS trends.
4. Report only user-impacting visual/UX issues supported by evidence.
5. Under “What’s working well,” call out preserved decisions from §6 that the page already honors.
6. If evidence is missing, write **unknown** — do not invent a redesign.
