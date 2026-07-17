# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Snowgoose is a Next.js 14 (App Router) application providing a unified chat interface across multiple AI providers (OpenAI, Anthropic, Google, OpenRouter, Grok). It includes subscription billing (Stripe), credit-based usage tracking, MCP tool integration, and Supabase-backed auth/storage. Designed to be deployed via Docker (Fly.io in production), not Vercel — the MCP client requires a stateful server process.

## Commands

```bash
npm run dev              # Start Next.js dev server
npm run build             # Production build (runs next-sitemap via postbuild)
npm run lint              # ESLint (next/core-web-vitals + prettier)

# Prisma (all load env from .env.local via dotenv-cli)
npm run db:generate       # Regenerate Prisma client
npm run db:studio         # Prisma Studio
npm run db:pull           # Pull schema from DB
npm run db:push           # Push schema to DB
npm run db:seed           # Run prisma/seed.ts
npm run db:test           # Test DB connection (prisma/test-connection.ts)

npm run promote-admin     # scripts/promote-to-admin.js — promote a user to admin by email
```

There is no automated test suite in this repo (no test runner configured, no `*.test.ts` files) — treat `npm run lint` and `npm run build`/`tsc` as the correctness gate, and verify chat/auth changes manually in the browser.

Local dev normally runs through Docker Compose, not directly on the host:

```bash
docker compose up --build                       # app + local Postgres, hot reload via volume mount
docker compose exec app npx prisma migrate dev   # run migrations inside the container
```

Production deploys to Fly.io using `Dockerfile`/`fly.toml`, connecting to a Supabase Postgres database. Migrations there run via `flyctl ssh console --command "npx prisma migrate deploy"`.

## Architecture

### Layering

```
UI (app/_ui, app/chat, app/(marketing)) 
  → Server Actions (app/_lib/server_actions/*.actions.ts)
    → Repositories (app/_lib/db/repositories/*.repository.ts, all extend BaseRepository)
      → Prisma Client (app/_lib/db/prisma.ts) → Postgres
```

- **Repository pattern**: every entity (persona, model, history, MCP tool, output format, user, credit, subscription plan, etc.) has its own repository under `app/_lib/db/repositories/`, extending `base.repository.ts`. `BaseRepository.handleError` re-throws the original error — logging and user-facing message formatting happens one layer up, in the Server Action's `catch` block (`console.error` the real error, throw a new generic `Error("...")` for the client boundary). Actions using `useFormState` instead return a structured `FormState` via `handleServerError` in `app/_lib/utils.ts`.
- **Server Actions** in `app/_lib/server_actions/` are the only layer allowed to talk to repositories; they also own Zod validation (schemas in `app/_lib/form-schemas.ts`) and Stripe/session concerns.
- **AI vendor integration lives outside this repo**, in the `snowgander` npm package. `app/_lib/model.ts` calls `AIVendorFactory.setVendorConfig(...)` per provider at module load (keyed by env var presence: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`, `GROK_API_KEY`), then `chat.repository.ts` uses the factory to get a vendor adapter. Adding a new provider mainly means changes in `snowgander`, not in this app — check that package's version in `package.json` when provider-level bugs come up.
- **MCP integration**: `app/_lib/mcp/manager.ts` holds a singleton `MCPManager` that lazily spins up and caches `MCPClient` instances (`app/_lib/mcp/client.ts`) per `MCPTool` DB row, tracking available tools/resources/prompts per client. MCP server binaries/configs live under `mcp_servers/`.
- **Auth**: Supabase via `app/_lib/auth.ts` and `app/_utils/supabase/middleware.ts`; `middleware.ts` at the repo root wraps every request (except static assets and the Stripe webhook route) with Axiom request logging and Supabase session refresh.
- **Billing**: Stripe checkout/session logic in `app/_lib/server_actions/stripe.actions.ts`; webhook handling in `app/api/webhooks/stripe/route.ts` updates `User` (subscription status, period usage reset) and records `CreditTransaction`/`ProcessedStripeEvent` rows (webhook events are deduped via `ProcessedStripeEvent`). Usage limits are enforced against `User.periodUsage`/`creditBalance` and `SubscriptionPlan.usageLimit` before billable actions (e.g. chat calls).
- **Streaming chat**: `app/api/chat/stream/route.ts` is a real API route (not a Server Action) because it needs to stream tokens back to the client.
- **Email**: transactional email goes through `app/api/resend/route.ts` using the `resend` SDK, triggered from Server Actions.
- **Logging**: `next-axiom` (`Logger`) is used from Server Components, Server Actions, API routes, and middleware for structured logging.

### Routing structure

- `app/(marketing)/` — public marketing pages (home, features, pricing), route group so it doesn't affect the URL path, shares its own layout.
- `app/chat/` — the authenticated application shell. `app/chat/settings/` holds admin/user settings sub-areas (models, personas, global-personas, output-formats, mcp-tools, users, history, profile, user-preferences, admin). `app/chat/subscribe/` and `app/chat/purchase/` handle Stripe subscription/credit-purchase flows with their own `success` subroutes.
- `app/_ui/` — shared components (chat UI, settings forms, marketing, onboarding tour via `react-joyride`, buy-credits).
- `app/api/` — the few things that must be real HTTP routes: chat streaming, Stripe webhook, Resend.

### Database (Prisma, `prisma/schema.prisma`)

Key models: `User` (auth via `authId` UUID linking to Supabase, tracks `periodUsage`/`totalUsage`/`creditBalance`, Stripe fields, `hasUnlimitedCredits`, `onboardingCompleted`), `Model` (per-provider model metadata: vision/image-gen/web-search/thinking flags, token costs, `paidOnly`), `Persona`, `OutputFormat`/`RenderType`, `ConversationHistory`, `MCPTool`, `UserSettings`, `SubscriptionPlan`, `CreditTransaction` (signed ledger: positive = grant, negative = deduction; `source` tags the origin, e.g. `free-trial`, `chat-deduction`), `ProcessedStripeEvent` (webhook idempotency).

When changing the schema: edit `schema.prisma`, then `docker compose exec app npx prisma migrate dev` (dev) — migrations live in `prisma/migrations/`. `prisma/seed.ts` seeds reference data (providers/models/etc.).

## Known gaps (from README)

- No test suite — be extra careful with repository/server-action changes and verify manually.
- Vision-uploaded files (Supabase Storage) are never auto-deleted.
- Loading history conversations created before a model was marked `isThinking` may be buggy.
