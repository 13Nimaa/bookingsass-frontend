# Development Workflow

## Approach

Build this frontend incrementally against context files. Context defines what exists, what is missing, and how to implement. Do not invent backend contracts or product behavior — check `PROJECT_INVENTORY.md` first.

## Scoping Rules

- Work on one feature unit at a time (e.g. services list, not services + bookings + CRM).
- Prefer small, verifiable increments.
- Do not combine unrelated system boundaries in one change (API client + marketing redesign, etc.).

## When To Split Work

Split if a step combines:

- New endpoint module and a full dashboard redesign
- Multiple unrelated domains (employees + bookings)
- Backend-contract guesses and UI implementation
- Test infrastructure changes and product features

If the change cannot be verified quickly (unit or focused E2E), the scope is too broad.

## Handling Missing Requirements

- Do not invent booking/services/customers APIs that are not wired or documented.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If blocked on backend, note it in `progress-tracker.md` and implement only the FE-ready slice (or a stub page) intentionally.

## Protected Foundation Components

Avoid modifying generated/foundation UI unless the task requires it:

- `src/components/ui/*` primitives
- Third-party library internals

Put product styling and behavior in feature/shared/layout components.

## Keeping Docs In Sync

Update the relevant context file when implementation changes:

| Change | Update |
| ------ | ------ |
| Product scope / flows | `project-overview.md` |
| Boundaries / invariants | `architecture-context.md` |
| HTTP client, endpoints, auth transport | `api-client-context.md` |
| Theme / layout patterns | `ui-context.md` |
| New reusable components | `shared-components.md` |
| Conventions | `code-standards.md` |
| Wired vs missing APIs | `PROJECT_INVENTORY.md` |
| Progress / open questions | `progress-tracker.md` |

Progress must reflect actual implementation state, not intent.

## Before Moving To The Next Unit

1. Current unit works within its defined scope.
2. No invariant in `architecture-context.md` was violated.
3. API usage matches `api-client-context.md`.
4. UI reused shared pieces where appropriate.
5. `progress-tracker.md` reflects completed work.
