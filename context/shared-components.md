# Shared Components

Alias: `@/*` → `src/*`. Prefer these before inventing new banners, headers, dialogs, or layout chrome.

## Where Things Live

| Kind | Location | Import |
| ---- | -------- | ------ |
| Design-system primitive | `src/components/ui/` | `@/components/ui/<name>` |
| App chrome | `src/components/layout/` | `@/components/layout/<name>` |
| Cross-feature feedback | `src/components/shared/` | `@/components/shared/<name>` |
| Domain UI | `src/features/<domain>/components/` | `@/features/<domain>/components/...` |

---

## UI Primitives — `src/components/ui/`

| File | Exports | When to use |
| ---- | ------- | ----------- |
| `button.tsx` | `Button`, `buttonVariants` | All primary actions. Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes include icon sizes. |
| `input.tsx` | `Input` | Labeled RTL fields with `error`, `hint`, start/end icons. |
| `checkbox.tsx` | `Checkbox` | Base UI checkbox. Present; little/no app usage yet — preferred when adding checkboxes. |
| `dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Modal shell. Compose feature dialogs from this. |
| `confirm-dialog.tsx` | `ConfirmDialog` | Confirm/cancel (`tone`: `danger` \| `primary`, supports `loading` + optional inline `error` for retry-in-place). |
| `password-strength.tsx` | `PasswordStrength` | Auth signup password meter (Persian labels). |
| `select.tsx` | `SelectField`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectGroup`, `SelectSeparator` | Custom dropdown (Base UI). Prefer `SelectField` for labeled single-select forms; compose parts for groups / custom item UI. Portal z-index sits above dialogs; `modal` defaults `false` on `SelectField` for nested modals. |

Stack: Base UI + CVA + `cn` package (`import { cn } from "cn"`). `components.json` expects `@/lib/utils` but that file does not exist yet — keep using the `cn` package.

---

## Layout Chrome — `src/components/layout/`

| File | Export | Role |
| ---- | ------ | ---- |
| `sidebar.tsx` | `Sidebar` | Dashboard desktop nav + logout; BusinessOwner vs customer link sets. |
| `mobile-tab-bar.tsx` | `MobileTabBar` | Fixed bottom tabs (`md:hidden`); guest vs authenticated. |
| `navbar.tsx` | `Navbar`, `NavbarLink` | Marketing sticky header. |

Related (not under `layout/`):

| File | Export | Role |
| ---- | ------ | ---- |
| `features/auth/components/auth-guard.tsx` | `AuthGuard` | Client gate; skeleton then redirect to `/login` if unauthenticated. |
| `providers/session-initializer.tsx` | `SessionInitializer` | Restores session + starts token timer (root layout). |

---

## Shared Feedback — `src/components/shared/`

| File | Export | Role |
| ---- | ------ | ---- |
| `auth-error.tsx` | `AuthError` | Focusable `role="alert"` error banner. Used beyond auth (forms/dashboards). |
| `page-header.tsx` | `PageHeader` | Dashboard header. Mobile: fixed glass bar (back icon + centered title). Desktop: eyebrow, title, description, actions, optional back. |
| `back-button.tsx` | `BackButton` | RTL-aware back (`router.back` + fallback href). Desktop PageHeader uses this. |

App Router: `src/app/error.tsx` — global error boundary with Persian copy + retry.

---

## Feature Components Worth Reusing

Still live under `features/` (domain-owned), but reused across routes:

| Component | Path | Used by |
| --------- | ---- | ------- |
| `AuthFormSplitScreen` | `features/auth/components/Login.tsx` | Login + register |
| `AuthBrandPanel` | `features/auth/components/auth-brand-panel.tsx` | Auth + register-business |
| `AuthLogo` | `features/auth/components/auth-logo.tsx` | Auth surfaces |
| `SignupIntentSelection` | `features/auth/components/signup-intent-selection.tsx` | Register intent |
| `BusinessForm` | `features/business/components/business-form.tsx` | Dashboard + register-business |
| `BusinessImageField` | `features/business/components/business-image-field.tsx` | Inside `BusinessForm` |
| `RegisterBusinessContent` | `features/business/components/register-business-content.tsx` | `/register/business` |
| `SalonDiscoveryPage` | `features/business/components/salon-discovery-page.tsx` | Public `/businesses` (uses shared `Navbar`) |
| `SalonCard` | `features/business/components/salon-card.tsx` | Public salon listing cards |
| `*Dashboard` | `features/*/components/*-dashboard.tsx` | Thin dashboard pages |

Landing components under `features/landing/` are marketing-only — do not reuse as product shell.

---

## Common Patterns (not yet extracted)

| Need | Current pattern |
| ---- | --------------- |
| Loading skeleton | `.skeleton-shimmer` in `globals.css` |
| Submit loading | `Loader2` + `animate-spin` on `Button` |
| Empty / not-found | Inline JSX in feature dashboards |
| Forms | `react-hook-form` + Zod schema + `Input` / `Button` + `AuthError` |
| Destructive confirm | `ConfirmDialog` |

Extract a shared `Skeleton` / empty-state only when a third call site needs the same shape.

---

## Stores & Helpers UI Reuses

No `src/hooks/` folder. Common imports:

```ts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { AuthError } from "@/components/shared/auth-error";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { apiClient } from "@/lib/api/client";
```

---

## Adding a New Shared Piece

1. **Primitive?** → `src/components/ui/` via Base UI / shadcn pattern; `"use client"` when interactive.
2. **Chrome / feedback reused by 2+ features?** → `layout/` or `shared/`.
3. **Domain-only?** → stay in `features/<domain>/components/`.
4. Reuse `AuthError`, `PageHeader`, `ConfirmDialog`, `Dialog` before inventing new shells.
5. Persian copy + RTL layout by default.
6. Do not put fetch/store logic inside `components/ui`.
