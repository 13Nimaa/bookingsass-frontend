# BookingSaaS Frontend

## Overview

BookingSaaS is a Persian (RTL) booking platform frontend. Business owners register, manage a business profile, employees, and (soon) services and appointments. Customers discover businesses and book services. This repo is the Next.js App Router client that talks directly to the .NET backend.

## Goals

1. Let users register and sign in with phone + password.
2. Let owners self-register a business and manage profile, image, and employees.
3. Let anyone browse public businesses.
4. Provide an owner dashboard shell for upcoming services, customers, and bookings.
5. Ship a public booking flow once the backend booking APIs exist.

## Core User Flow (current)

1. User lands on marketing home (`/`).
2. User registers or logs in.
3. User optionally upgrades to BusinessOwner via `/register/business`.
4. Owner opens `/dashboard` and manages profile, business, and employees.
5. Anyone browses `/businesses` (public list).

## Features

### Authentication

- Phone + password register and login.
- Access + refresh tokens in `localStorage` (`bf_session`).
- Proactive refresh timer and 401 retry via `apiClient`.
- `AuthGuard` protects dashboard and business-registration routes.

### Profile

- Get/update profile and profile image upload/delete.

### Business

- Public business list.
- Owner “mine” business, update, and image upload/delete.
- Self-service business registration that upgrades the user to BusinessOwner.

### Employees

- Owner add/list/remove employees by phone.
- Working hours create/list/delete (update helper exists; UI incomplete).

### Landing

- Marketing-only pages with mock appointment visuals. Not wired to booking APIs.

## Scope

### In Scope

- Auth, profile, business, employees
- Owner dashboard shell (RTL)
- Public business list
- Services, customers, and bookings modules when backend contracts exist
- Vitest unit tests and Playwright E2E for critical flows

### Out Of Scope (for now)

- Next.js BFF / proxy layer
- Admin panel
- Payments, notifications, reviews, SaaS billing
- Dark mode
- Native mobile apps

## Success Criteria

1. Authenticated users can restore a session and reach the dashboard.
2. Owners can register a business and manage profile + employees.
3. Public users can list businesses.
4. API calls use the shared client patterns in `api-client-context.md`.
5. UI uses design tokens and shared components documented in `ui-context.md` and `shared-components.md`.

## Stack Snapshot

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + CSS variables |
| UI primitives | Base UI + CVA (shadcn-style `components/ui`) |
| State | Zustand |
| Forms | react-hook-form + Zod |
| Icons | Lucide |
| Motion | Framer Motion |
| Tests | Vitest + Testing Library + Playwright |
| Backend | External API at `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:5135`) |
