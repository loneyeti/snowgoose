# Progress Tracking

## Current Status

Standalone Next.js application with Server Actions

## What Works

1. **Deployment Options**

   - Local development setup (`npm run dev`)
   - Dockerized development setup (`docker-compose.yml`)
   - Dockerized production setup (`docker-compose.prod.yml`, multi-stage `Dockerfile`)
   - Fly.io deployment configuration (`fly.toml`, secrets management)
   - Environment configuration for local, Docker, and Fly.io
   - Database migrations (local, Docker exec, Fly SSH console)

2. Server Actions

   - Direct database operations
   - Type-safe data handling
   - Error handling
   - Performance monitoring
   - CRUD operations for all entities

3. Database Integration

   - Prisma ORM setup complete
   - Database models defined
   - Repository pattern implemented
   - Base repository abstraction
   - Entity-specific repositories
   - Query optimization

4. Core Features

   - MCP tool management
   - AI vendor integration
   - Chat functionality
   - History management
   - Settings management
   - User preferences
   - Persona management
   - Output format handling
   - Corrected MCP tool interaction flow (prevents duplicate tool calls)
   - **Stripe subscription integration:**
     - Basic checkout flow (subscription page, checkout action, success page)
     - Basic checkout flow (subscription page, checkout action, success page)
     - Database schema updated with Stripe fields
     - Webhook handler for `checkout.session.completed` to update DB
     - Checkout session linked to user via `client_reference_id`
     - Middleware updated to allow webhook access
     - **Stripe Customer Portal integration:**
       - Server action (`createCustomerPortalSessionAction`) to generate portal URL
       - Client component (`ManageSubscriptionButton`) for redirection
       - Button added to profile page (`/settings/profile`) for subscribed users
     - **Usage Limit Foundation:**
       - Added `SubscriptionPlan` table to DB schema (`prisma/schema.prisma`)
       - Applied migration (`20250406230457_add_subscription_plan_table`)
       - Updated `UserRepository` to reset `periodUsage` on renewal via webhook
       - **Added Admin Active Subscriptions page (`/settings/admin/subscriptions`) for viewing active customer subscriptions and associated local plan data (read-only).**
       - **Added Admin Subscription Limits page (`/settings/admin/subscription-limits`) for managing local plan name and usage limits per Stripe Price ID.**
     - **Implemented Free Tier & Usage Limits:**
       - Modified `SubscriptionPlan` schema to make `stripePriceId` optional.
       - Seeded "Free Tier" plan (`stripePriceId = null`, `usageLimit = 0.5`).
       - Added `UserRepository.checkUsageLimit` method.
       - Integrated usage check into `createChat` server action.
     - **Marketing Site:**
       - Terms of Service page (`app/(marketing)/terms/page.tsx`) created.
       - Privacy Policy page (`app/(marketing)/privacy/page.tsx`) created.
       - Footer links added in `app/(marketing)/layout.tsx`.
     - **Google OAuth Sign-In (Pre-built Button):**
       - Added `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable.
       - Integrated Google GSI client script, nonce handling, button rendering, and Supabase `signInWithIdToken` callback into `app/login/page.tsx`.
     - **GitHub OAuth Sign-In:**
       - Added `NEXT_PUBLIC_GITHUB_CLIENT_ID` environment variable.
       - Integrated GitHub sign-in button and `signInWithGithub` handler using `supabase.auth.signInWithOAuth` into `app/login/page.tsx`.
     - **Passwordless Authentication (Magic Link):**
       - Removed password fields/logic from login page (`app/login/page.tsx`).
       - Updated login server action (`app/login/actions.ts`) to use `supabase.auth.signInWithOtp`.
       - Removed signup and password reset server actions.
       - Removed password reset page (`app/auth/reset-password/`).
     - **Explicit Subscription Status Tracking:**
       - Added `stripeSubscriptionStatus` field to `User` model.
       - Updated `UserRepository` methods to handle status.
       - Updated `UserRepository.checkUsageLimit` to enforce 'active' status.
       - Updated Stripe webhook handler to pass status.
     - **Fixed race condition in `ensureUserExists` (`app/_lib/server_actions/user.actions.ts`) by catching Prisma P2002 errors (unique constraint violation) during user creation and re-fetching the user if the error occurs.**

5. AI Integration

- **AI vendor logic moved to standalone `snowgander` npm package (v0.0.17)**
- OpenAI adapter
- Anthropic adapter
- Google AI adapter
- Vendor factory pattern
- Message standardization
- Thinking mode support

## In Progress

1. **Deployment & Operations (Fly.io)**

   - CI/CD pipeline setup for automated Fly.io deployments.
   - Implement robust monitoring and logging specific to Fly.io environment.
   - Refine container health checks in `fly.toml`.
   - Document Fly.io specific management and troubleshooting.

2. **Docker Integration (General)**

   - Ongoing container optimization (size, build times).
   - Performance profiling within Docker environments.
   - Testing Docker deployments across different environments (beyond local).

3. Performance Optimization

   - Response time improvements
   - Memory usage optimization
   - Caching implementation
   - Load testing
   - Resource monitoring

4. Testing Implementation

   - Unit test development
   - Integration testing
   - End-to-end testing
   - Performance testing
   - Security testing

5. Documentation

   - User guides
   - Developer documentation
   - Deployment guides
   - Configuration guides
   - Troubleshooting guides

6. **Subscription System**
   - Basic Stripe integration implemented
   - Subscription page with plan display
   - Checkout session creation
   - Success page confirmation
   - Basic Stripe integration implemented
   - Subscription page with plan display
   - Checkout session creation
   - Success page confirmation
   - **Database schema updated for subscription tracking (DONE)**
   - **Webhook handling for `checkout.session.completed` (DONE)**
   - **Webhook handling for `customer.subscription.updated` (DONE - handles renewals, updates)**
   - **Webhook handling for `customer.subscription.deleted` (DONE - handles cancellations)**
   - **Webhook handling for `invoice.payment_failed` (DONE - logs failures)**
   - **Stripe Customer Portal integration (DONE)**
   - **Foundation for usage limits and reset (DONE - `SubscriptionPlan` table added, `UserRepository` updated to reset usage on renewal)**
   - **Admin UI for viewing active customer subscriptions (DONE)**
   - **Implement subscription status checks (using new DB fields) (DONE)**
   - Need to add subscription management UI (beyond portal and admin page)
   - **Implement usage limit checks based on `SubscriptionPlan` table and active status (DONE)**
   - Need to create UI/Action for managing `SubscriptionPlan` table records (DONE)
   - Need to populate `SubscriptionPlan` table (PENDING)
   - ~~Need to add webhook handling for other events (updates, cancellations)~~ (Now covered)
7. **Marketing Site Development (`app/(marketing)/`)**
   - Home page content (`/`) (IN PROGRESS)
   - Features page content (`/features`) (IN PROGRESS)
   - Pricing page content (`/pricing`) (IN PROGRESS)
   - Terms of Service page (`/terms`) (DONE)
   - Privacy Policy page (`/privacy`) (DONE)
   - Shared marketing layout (`app/(marketing)/layout.tsx`) (IN PROGRESS - Footer updated)
   - Styling (`app/marketing.css`, Tailwind) (IN PROGRESS)

## Known Issues

1. Technical Debt

   - Test coverage needs improvement
   - Documentation updates required
   - Performance optimization ongoing
   - Logging system enhancement needed
   - Monitoring implementation pending

2. System Concerns
   - Load testing needed
   - Performance benchmarking
   - Security audit required
   - Resource monitoring
   - Backup procedures

## Next Development Priorities

1. Testing Implementation

   - Expand unit test coverage
   - Add integration tests
   - Implement end-to-end testing
   - Performance testing
   - Security testing

2. Documentation

   - Complete user documentation
   - Enhance developer guides
   - Update deployment guides
   - Improve configuration guides
   - Add troubleshooting guides

3. Performance Optimization
   - Query optimization
   - Server Action response times
   - Resource utilization
   - Caching implementation
   - Load testing

## Feature Status

### Server Actions

- [x] Database operations
- [x] Error handling
- [x] Type safety
- [x] Performance monitoring
- [ ] Comprehensive testing
- [ ] Complete documentation

### Database Integration

- [x] Prisma setup
- [x] Model definitions
- [x] Repository pattern
- [x] Base repository
- [x] Entity repositories
- [x] Query optimization
- [ ] Comprehensive testing

### AI Vendor Integration

- [x] Base adapter interface
- [x] OpenAI implementation
- [x] Anthropic implementation
- [x] Google AI implementation
- [x] Factory pattern
- [x] Error handling
- [ ] Caching system

### MCP Support

- [x] Server management
- [x] Communication protocol
- [x] Environment handling
- [x] Basic error recovery
- [ ] Enhanced monitoring
- [ ] Advanced logging

## Upcoming Work

1. Expand test coverage
2. Complete documentation
3. Optimize performance
4. Implement monitoring
5. Enhance logging
6. Add caching system

## Completed Milestones

1. **Docker Setup (Dev & Prod)**: Implemented `docker-compose.yml`, `docker-compose.prod.yml`, and optimized `Dockerfile`.
2. **Fly.io Deployment Configuration**: Set up `fly.toml` and established deployment process including secrets and migrations.
3. Migration to standalone Next.js app
4. Server Actions implementation
5. Database integration with Prisma
6. Repository pattern implementation
7. AI vendor adapters
8. MCP tool management
9. Authentication system
10. Error handling system (Initial)
11. Standardized Server Action error handling (Log details server-side, throw generic errors)
12. **AI Vendor Logic Refactoring**: Extracted AI adapters and factory into standalone `snowgander` npm package (v0.0.17).
13. **Basic Stripe Integration**: Implemented subscription page, checkout process, and success confirmation.
14. **Stripe DB Schema Update**: Added necessary fields to `User` model for subscription tracking and applied migration.
15. **Stripe Webhook Implementation**: Added webhook handler for `checkout.session.completed` to update user subscription data in the database.
16. **Middleware Update**: Excluded Stripe webhook path from authentication checks.
17. **Stripe Customer Portal Integration**: Added functionality for users to manage their subscriptions via the Stripe portal, accessible from the profile page.
18. **Expanded Stripe Webhook Handling**: Added handlers for `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed` to manage subscription lifecycle events in the database.
19. **Subscription Usage Limit Foundation**: Added `SubscriptionPlan` table to database schema and updated `UserRepository` to reset `periodUsage` on subscription renewal via webhook.
20. **Admin Active Subscriptions View**: Created page (`/settings/admin/subscriptions`) allowing admins to view active Stripe subscriptions and associated local `SubscriptionPlan` data (read-only).
21. **Admin Subscription Limits Management**: Created page (`/settings/admin/subscription-limits`) allowing admins to manage local `SubscriptionPlan` records (name, usageLimit) associated with Stripe Prices.
22. **Free Tier & Usage Limit Implementation**: Added a "Free Tier" plan, made `stripePriceId` optional in `SubscriptionPlan`, and integrated usage limit checks into the chat action.
23. **Terms of Service Page**: Created the Terms of Service page (`/terms`) and linked it in the marketing site footer.
24. **Privacy Policy Page**: Created the Privacy Policy page (`/privacy`) and linked it in the marketing site footer.
25. **Google OAuth Sign-In (Pre-built Button)**: Integrated Google Sign-In via the GSI client library and Supabase `signInWithIdToken` on the login page.
26. **GitHub OAuth Sign-In**: Integrated GitHub Sign-In via `supabase.auth.signInWithOAuth` on the login page and added the necessary environment variable.
27. **Passwordless Authentication Refactor**: Replaced email/password login with Supabase Magic Links (`signInWithOtp`), removing password fields, signup, and password reset functionality.
28. **Explicit Stripe Subscription Status Tracking**: Added status field to DB, updated repository methods and webhook handler, and integrated status check into usage limit logic.
29. **Stripe `cancel_at_period_end` Handling**: Added `stripeCancelAtPeriodEnd` field to `User` model, updated repository, and modified webhook handler to store this flag from `customer.subscription.updated` events.
30. **`ensureUserExists` Race Condition Fix**: Implemented error handling in `user.actions.ts` to catch Prisma P2002 errors during user creation and re-fetch the user, resolving potential race conditions.
