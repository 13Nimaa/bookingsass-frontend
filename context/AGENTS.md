<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture-context.md` — system structure, boundaries, and invariants
3. `context/api-client-context.md` — HTTP client, auth transport, endpoints, stores
4. `context/ui-context.md` — theme, typography, layout patterns, styling conventions
5. `context/shared-components.md` — reusable UI primitives, layout chrome, when to use what
6. `context/code-standards.md` — implementation rules and conventions
7. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
8. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps
9. `context/PROJECT_INVENTORY.md` — wired vs missing APIs and FE/BE gaps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, API client, UI system, shared components, scope, or standards documented in the context files, update the relevant file before continuing.
