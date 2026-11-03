# UI Context

## Theme

Light only. No dark mode / `next-themes`. Visual language: clean indigo SaaS, soft surfaces, blue-tinted ink, RTL Persian default.

All brand/surface colors are CSS custom properties in `src/app/globals.css`, mapped into Tailwind v4 via `@theme inline`. Prefer these tokens over raw `zinc-*` / hardcoded hex for product UI.

| Role | CSS Variable | Hex |
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
| Success | `--success` | `#16a34a` |
| Warning | `--warning` | `#d97706` |
| Error | `--error` | `#dc2626` |
| Info | `--info` | `#2563eb` |
| Premium | `--premium` | `#5b21b6` |

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

### Auth

- No dashboard chrome
- Split-screen / brand panel patterns from `features/auth`

### Dashboard

- `AuthGuard` → sticky `Sidebar` (`md+` only, ~232px, right in RTL) + main content + `MobileTabBar`
- Sidebar: refined nav (active `primary-soft`, hover neutral), user card + logout in footer
- Main: typically `max-w-5xl`–`max-w-7xl`, padded; avoid duplicating sidebar links on desktop
- Page chrome: `PageHeader` + feature dashboard body
- Home (`/dashboard`): desktop welcome + sidebar cue; hub management grid is 2 columns by default / through `md` (sidebar-visible tablet), 3 columns from `lg` so cards stay ~200px+; mobile keeps 2 columns + logout; `MobileTabBar` unchanged
- Cards: soft border, light surfaces, generous radius (grid cards ~16px)

### Mobile

- Fixed bottom tab bar; content spacer `h-[74px]` where needed
- Fixed top glass `PageHeader` (back icon + centered title, `backdrop-blur`); content spacer `h-14` inside `PageHeader`
- Sidebar hidden; dashboard home two-column grid replaces desktop nav shortcuts

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
