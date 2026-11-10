# UI Context

## Theme

Light only. No dark mode / `next-themes`. Visual language: warm cream surfaces, terracotta accent, brown-gray ink, RTL Persian default.

All brand/surface colors are CSS custom properties in `src/app/globals.css`, mapped into Tailwind v4 via `@theme inline`. Prefer these tokens over raw `zinc-*` / hardcoded hex for product UI.

| Role | CSS Variable | Hex |
| ---- | ------------ | --- |
| Page background | `--background` | `#fbf8f3` |
| Foreground | `--foreground` | `#221f1c` |
| Primary | `--primary` | `#a8492e` |
| Primary hover | `--primary-hover` | `#944028` |
| Primary pressed | `--primary-pressed` | `#7a3521` |
| Primary soft | `--primary-soft` | `#f5ebe6` |
| Primary subtle | `--primary-subtle` | `#edd9d0` |
| Surface | `--surface` | `#ffffff` |
| Surface hover | `--surface-hover` | `#fcfaf7` |
| Surface secondary | `--surface-secondary` | `#f5f0ea` |
| Surface subtle | `--surface-subtle` | `#faf7f2` |
| Border | `--border` | `#e9e1d8` |
| Border strong | `--border-strong` | `#d9cfc4` |
| Border subtle | `--border-subtle` | `#f0e9e1` |
| Text primary | `--text-primary` | `#221f1c` |
| Text secondary | `--text-secondary` | `#6b7a5e` |
| Muted | `--muted` | `#6b635b` |
| Text disabled | `--text-disabled` | `#9c948c` |
| Success | `--success` | `#16a34a` |
| Warning | `--warning` | `#d97706` |
| Error | `--error` | `#dc2626` |
| Info | `--info` | `#2563eb` |
| Premium | `--premium` | `#6b7a5e` |

Semantic soft/border/text variants exist for success, warning, error, and info (see `globals.css`).

Tailwind color names map from `@theme` (e.g. `bg-primary`, `bg-surface`, `text-text-primary`, `border-border`).

## Typography

| Role | Font | Notes |
| ---- | ---- | ----- |
| Body | Modam + Inter | `--font-body` / `font-body` |
| Display | Modam + Fraunces | `--font-display-stack` / `font-display` |

Loaded in `src/app/layout.tsx` via `next/font/local` (Modam TTFs in `src/fonts/modam/`) + `next/font/google` (Inter, Fraunces). Root: `lang="fa"` `dir="rtl"`.

Conventions observed:

- Page titles ~28–32px bold (`PageHeader`)
- Labels: `text-sm font-bold`
- Headings: tight tracking; `text-wrap: balance` / `pretty` where used
- `.tnum` for tabular metrics
- Body copy should stay readable (muted floor ~ slate-600 / `--muted`)

## Border Radius

| Context | Typical class |
| ------- | ------------- |
| Controls / inputs | `rounded-xl` |
| Buttons / small panels | `rounded-xl` – `rounded-2xl` |
| Cards / dashboard panels | `rounded-[1.75rem]` |
| Dialogs | follow `dialog.tsx` (large rounded shell) |

Inputs often `h-12`; form buttons often `h-11`–`h-12`.

## Component Library

shadcn-style kit on **Base UI** (`@base-ui/react`) + CVA + Lucide. Config: `components.json` (style `base-rhea`).

Primitives live in `src/components/ui/`. Prefer the CLI / existing patterns over one-off primitives. Full inventory: `shared-components.md`.

## Layout Patterns

### Marketing

- Sticky `Navbar` (desktop) + `MobileTabBar` (mobile)
- Landing sections composed from `features/landing`
- Public salon discovery (`/businesses`) reuses marketing `Navbar` (with `/businesses` link + active states) + hero + card grid

### Auth

- No dashboard chrome
- Split-screen / brand panel patterns from `features/auth`

### Dashboard

- `AuthGuard` → sticky `Sidebar` (`md+` only, ~232px, right in RTL) + main content + `MobileTabBar`
- Sidebar: refined nav (active `primary-soft`, hover neutral), user card + logout in footer; role-aware — BusinessOwner gets management links; other roles get رزروها (`/dashboard/my-bookings`) / پروفایل / علاقه‌مندی‌ها (`/dashboard/favorites`)
- Main: typically `max-w-5xl`–`max-w-7xl`, padded; avoid duplicating sidebar links on desktop
- Page chrome: `PageHeader` + feature dashboard body
- Home (`/dashboard`): BusinessOwner sees live analytics (KPI cards, today bookings, weekly estimated-value chart, top services) from `GET /api/Business/dashboard`; non-owners (403) see customer home from `GET /api/customer/dashboard` (hero + search, summary stats, upcoming ≤5, recent ≤5, self-cancel) — no discount/rating/notification widgets; owners also get mobile-only management shortcuts under analytics; `MobileTabBar` unchanged
- Cards: soft border, light surfaces, generous radius (grid cards ~16px)

### Mobile

- Fixed bottom tab bar; content spacer `h-[74px]` where needed
- Fixed top glass `PageHeader` (back icon + centered title + optional end-side actions, `backdrop-blur`); content spacer `h-14` inside `PageHeader`
- Sidebar hidden; dashboard home single-column grid on narrow phones

## Icons

Lucide React. Stroke icons. Common sizes: `h-4 w-4` inline, `h-5 w-5` buttons, larger for empty states. Loading: `Loader2` + `animate-spin`.

## Motion

Framer Motion on landing, navbar, and some headers. Prefer intentional small motion over decorative noise. Reuse landing `motion.ts` patterns when animating marketing sections.

## Loading & Empty States

No shared `Skeleton` primitive yet. Reuse:

- `.skeleton-shimmer` from `globals.css`
- Inline empty/not-found JSX in feature dashboards
- Button-level `Loader2` for submits

## Language & Direction

- User-facing copy is Persian unless a screen is explicitly bilingual.
- Preserve RTL: icons, back buttons, and paddings should mirror correctly (`BackButton` already handles RTL back).

## Do / Don't

| Do | Don't |
| -- | ----- |
| Use CSS tokens / mapped Tailwind colors | Invent a second palette or dark theme |
| Compose from `components/ui` + `shared` | Duplicate buttons/inputs/dialogs |
| Keep `app/**/page.tsx` thin | Stuff dashboards into route files |
| Match existing card/radius/spacing | Introduce dense card grids in heroes |
| Put domain UI under `features/` | Grow `components/ui` with business logic |
