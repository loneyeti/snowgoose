# Active Context

## Current Focus

- **Refinement of UI/UX across the application, including mobile responsiveness.**
- **Monitoring and Logging:** Leveraging Axiom integration.
- Performance optimization of Server Actions.
- Enhanced error handling and recovery.
- Testing and documentation.
- Addressing any remaining known issues or bugs.

## Recent Changes

- Implemented Docker setup for both development (`docker-compose.yml`) and production (`docker-compose.prod.yml`).
- Optimized `Dockerfile` using multi-stage builds for smaller production images.
- Configured deployment to Fly.io using `fly.toml`.
- Updated environment variable handling for Docker and Fly.io deployment contexts.
- Completed migration to standalone Next.js application using Server Actions.
- Finalized Prisma ORM integration.
  - Enhanced error handling and recovery mechanisms.
  - Improved MCP tool management and stability.
  - Optimized database operations using the repository pattern.
  - **Refactored AI vendor logic into a standalone npm package (`snowgander` v0.0.26).**
  - **Fixed `toolUseId` handling in `chat.repository.ts` to correctly pass the string ID from `ToolUseBlock` to `ToolResultBlock` as required by `snowgander` and vendors like Anthropic.**
  - **Corrected MCP tool flow in `chat.repository.ts` to prevent sending available tools on the second API call (after receiving a tool result), resolving an issue where the AI would attempt to call the tool again instead of providing a final text response.**
  - **Enhanced Stripe Integration:** (Summary of previous detailed steps)
    - Full subscription lifecycle management (checkout, portal, webhooks for updates/cancellations).
    - Free tier and usage limit enforcement based on `SubscriptionPlan` table.
    - Admin UIs for viewing subscriptions and managing plan limits.
    - Explicit subscription status tracking (`stripeSubscriptionStatus`, `stripeCancelAtPeriodEnd`).
  - **Improved Login Flow:** (Summary of previous detailed steps)
    - Replaced password login with passwordless Magic Links (Supabase OTP).
    - Added Google and GitHub OAuth sign-in options.
    - Removed signup and password reset flows.
  - **Implemented Axiom Logging:** Integrated `next-axiom` for structured logging and monitoring.
  - **Implemented Resend Email:** Added `resend` package and API route (`app/api/resend/route.ts`) for transactional emails (e.g., magic links, potentially notifications).
  - **Added User Onboarding Tour:** Implemented `react-joyride` (`app/_ui/onboarding/ProductTour.tsx`) to guide new users.
  - **UI/UX and Mobile Responsiveness Improvements:** Made various tweaks across components (`app/_ui/`, `app/globals.css`, etc.) to enhance the user interface and ensure better usability on mobile devices.
  - **Fixed race condition in `ensureUserExists` (`app/_lib/server_actions/user.actions.ts`) by catching Prisma P2002 errors (unique constraint violation) during user creation and re-fetching the user if the error occurs.**
    - Added subscription page at `/subscriptions` that displays available plans
    - Created Stripe checkout session functionality (`app/_lib/server_actions/stripe.actions.ts`)
    - Added success page that confirms subscription (`app/success/page.tsx`)
  - **Updated `User` model in `prisma/schema.prisma` to include Stripe fields (`stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodBegin`, `stripeCurrentPeriodEnd`, `stripeSubscriptionStartDate`) and removed redundant `renewalDate`. Applied migration `20250406154342_add_stripe_subscription_fields`.**
  - **Implemented Stripe webhook handler (`app/api/webhooks/stripe/route.ts`) to listen for `checkout.session.completed` events.**
    - Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`.
    - Retrieves subscription details from the event.
    - Updates the corresponding user's Stripe fields in the database using a new repository method (`UserRepository.updateSubscriptionByAuthId`).
  - **Modified `createCheckoutSessionAction` to include the user's Supabase `authId` as `client_reference_id` in the Stripe session, linking the session to the user.**
  - **Updated `middleware.ts` to exclude the `/api/webhooks/stripe` path from authentication checks, allowing Stripe requests to reach the handler.**
  - **Added Stripe Customer Portal integration:**
    - Created `createCustomerPortalSessionAction` server action in `stripe.actions.ts` to generate portal URLs.
    - Created generic `Button` component (`app/_ui/button.tsx`).
    - Created `ManageSubscriptionButton` client component (`app/_ui/settings/profile/ManageSubscriptionButton.tsx`) to handle portal redirection.
    - Updated profile page (`app/settings/profile/page.tsx`) to conditionally display the "Manage Subscription" button for users with a `stripeCustomerId`.
  - **Expanded Stripe webhook handler (`/api/webhooks/stripe`) to process additional events:**
    - `customer.subscription.updated`: Handles renewals, plan changes, status updates. Updates DB via `UserRepository.updateSubscriptionByCustomerId`.
    - `customer.subscription.deleted`: Handles cancellations. Clears DB fields via `UserRepository.clearSubscriptionByCustomerId`.
    - `invoice.payment_failed`: Logs failed payment attempts.
  - **Added `updateSubscriptionByCustomerId` and `clearSubscriptionByCustomerId` methods to `UserRepository` to support webhook updates based on Stripe Customer ID.**
  - **Added `SubscriptionPlan` model to `prisma/schema.prisma` to store usage limits per Stripe Price ID. Applied migration `20250406230457_add_subscription_plan_table`.**
  - **Updated `UserRepository.updateSubscriptionByCustomerId` to automatically reset `periodUsage` to 0 when the `customer.subscription.updated` webhook indicates a billing period renewal.**
  - **Added Admin Active Subscriptions page (`/settings/admin/subscriptions`):**
    - Created `SubscriptionPlanRepository` (`app/_lib/db/repositories/subscription-plan.repository.ts`) for DB operations.
    - Created server action (`app/_lib/server_actions/subscription-plan.actions.ts`) to fetch combined Stripe/local data (`getAdminSubscriptionData`). (Note: `upsertSubscriptionPlanAction` exists but is currently unused by the page).
    - Created the page component (`app/settings/admin/subscriptions/page.tsx`) with admin check and read-only display of active customer subscriptions and associated local plan data.
    - Added navigation link in `app/_ui/settings/settings-nav.tsx`.
    - **Added Admin Subscription Limits page (`/settings/admin/subscription-limits`):**
      - Created server action (`getSubscriptionLimitData`) to fetch Stripe Prices and merge with local `SubscriptionPlan` data.
        - Created the page component (`app/settings/admin/subscription-limits/page.tsx`) with admin check, data fetching, and a form using `upsertSubscriptionPlanAction` to manage local plan name and usage limits per Stripe Price ID.
        - Added navigation link in `app/_ui/settings/settings-nav.tsx`.
  - **Refactored site structure: Marketing pages (Home, Features, Pricing) are now served from the root (`/`) using the `(marketing)` route group, and the main application resides under `/chat`.**
  - **Implemented Free Tier & Usage Limits:**
    - Modified `SubscriptionPlan` schema (`prisma/schema.prisma`) to make `stripePriceId` optional (`String?`) to accommodate non-Stripe plans. Applied migration `20250408140554_make_stripe_price_id_optional`.
    - Updated seed script (`prisma/seed.ts`) to create/update a "Free Tier" `SubscriptionPlan` record with `stripePriceId = null` and `usageLimit = 0.5`.
    - Added `checkUsageLimit` method to `UserRepository` (`app/_lib/db/repositories/user.repository.ts`) to verify user usage against their plan (paid or free tier).
    - Integrated `checkUsageLimit` call into the main chat server action (`app/_lib/server_actions/chat-actions.ts`) before contacting the AI vendor.
  - **Added Terms of Service page (`app/(marketing)/terms/page.tsx`) and linked it in the marketing site footer (`app/(marketing)/layout.tsx`).**
  - **Added Privacy Policy page (`app/(marketing)/privacy/page.tsx`) and linked it in the marketing site footer (`app/(marketing)/layout.tsx`).**
  - **Implemented Google OAuth Sign-In (Pre-built Button):**
    - Added `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local`.
    - Modified `app/login/page.tsx` to include the Google GSI client script, nonce generation, button rendering, and the `handleSignInWithGoogle` callback using `supabase.auth.signInWithIdToken`.
  - **Implemented GitHub OAuth Sign-In:**
    - Added `NEXT_PUBLIC_GITHUB_CLIENT_ID` to `.env.local`.
    - Modified `app/login/page.tsx` to include a GitHub sign-in button and the `signInWithGithub` handler using `supabase.auth.signInWithOAuth`.
  - **Refactored authentication to use Supabase Magic Links:**
    - Removed password input and related logic from `app/login/page.tsx`.
    - Updated `app/login/actions.ts` to use `supabase.auth.signInWithOtp` instead of `signInWithPassword`.
    - Removed the `signup` and `requestPasswordReset` server actions from `app/login/actions.ts`.
    - Deleted the password reset page and related files (`app/auth/reset-password/`).
  - **Added explicit Stripe subscription status tracking:**
    - Added `stripeSubscriptionStatus` field to `User` model (`prisma/schema.prisma`). Applied migration `20250414181014_add_subscription_status`.
    - Updated `UserRepository` methods (`updateSubscriptionByAuthId`, `updateSubscriptionByCustomerId`, `clearSubscriptionByCustomerId`) to handle the status field.
    - Modified `UserRepository.checkUsageLimit` to verify `stripeSubscriptionStatus` is 'active' for subscribed users before granting access.
    - Updated Stripe webhook handler (`app/api/webhooks/stripe/route.ts`) to pass `subscription.status` to repository methods.
  - **Handled Stripe `cancel_at_period_end` flag:**
    - Added `stripeCancelAtPeriodEnd` field (Boolean) to `User` model (`prisma/schema.prisma`). Applied migration `add_stripe_cancel_at_period_end`.
    - Updated `UserRepository.updateSubscriptionByCustomerId` to accept and store the `stripeCancelAtPeriodEnd` value.
    - Modified Stripe webhook handler (`app/api/webhooks/stripe/route.ts`) to extract `cancel_at_period_end` from the `customer.subscription.updated` event and pass it to the repository method.
  - **Fixed race condition in `ensureUserExists` (`app/_lib/server_actions/user.actions.ts`) by catching Prisma P2002 errors (unique constraint violation) during user creation and re-fetching the user if the error occurs.**

## Active Decisions

1.  **Deployment Strategy**:

- Utilize Docker for containerization in both development and production.
- Employ Fly.io for hosting the production application, leveraging its Docker deployment capabilities.
- Manage environment variables securely through Fly.io secrets and `.env.production` (not committed).

2. Server Actions Architecture

   - Direct database operations through Server Actions
   - Type-safe data handling with Prisma
   - Optimized response processing
   - Enhanced error handling
   - Performance monitoring

3. Database Integration

   - Prisma ORM for all database operations
   - Repository pattern for clean data access
   - Optimized query performance
   - Transaction handling
   - Connection pooling

4. AI Vendor Integration

   - **AI logic encapsulated in standalone `snowgander` npm package.**
   - Factory pattern (`AIVendorFactory`) for vendor selection within the package.
   - Adapter pattern (`AIVendorAdapter`) for implementations within the package.
   - Support for OpenAI, Anthropic, Google AI, and OpenRouter via adapters.
   - Standardized message handling using shared types (`Message`, `ContentBlock`, etc.).
   - Abstracted model configuration (`ModelConfig`) to decouple from Prisma.

5. MCP Integration

- Enhanced tool management
- Improved process handling
- Robust error recovery
- Environment management
- Performance optimization

6.  **Subscription Management** (Decision Summary)

- Stripe integration for payment processing
- Server-side subscription plan retrieval
- Checkout session creation via Server Actions (passing `client_reference_id`).
- Success page confirmation.
- **Database schema updated to store necessary Stripe subscription details (`customerId`, `subscriptionId`, `priceId`, `currentPeriodBegin`, `currentPeriodEnd`, `subscriptionStartDate`).**
- **Webhook handling implemented (`/api/webhooks/stripe`) for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` events.**
  - Uses `UserRepository` methods (`updateSubscriptionByAuthId`, `updateSubscriptionByCustomerId`, `clearSubscriptionByCustomerId`) for database updates.
- **Middleware configured to allow unauthenticated access to the webhook endpoint.**
- **Customer Portal session creation implemented (`createCustomerPortalSessionAction`).**
- **UI added to profile page (`/settings/profile`) for users to access the Customer Portal.**
- **Database structure (`SubscriptionPlan` table) added to support usage limits per plan.**
- **Logic added to `UserRepository` to reset `periodUsage` automatically on subscription renewal via webhook.**
- **Admin UI (`/settings/admin/subscriptions`) created for viewing active Stripe subscriptions and associated local `SubscriptionPlan` records (read-only).**
- **Admin UI (`/settings/admin/subscription-limits`) created for managing local `SubscriptionPlan` records (name, usageLimit) associated with Stripe Prices.**
- **Free Tier Implementation: A dedicated "Free Tier" record in the `SubscriptionPlan` table (with `stripePriceId = null` and `usageLimit = 0.5`) provides a usage allowance for non-subscribed users.**
- **Usage Limit Enforcement: The `UserRepository.checkUsageLimit` method centralizes the logic for checking a user's `periodUsage` against the `usageLimit` of their determined plan (paid or free) AND verifies that the `stripeSubscriptionStatus` is 'active' if a subscription exists. This check is performed in relevant server actions (e.g., `createChat`) before potentially billable operations.**

7.  **Authentication Strategy** (Decision Summary)

    - Utilize Supabase for authentication.
    - Prioritize passwordless (Magic Link) login as the primary method.
    - Offer Google and GitHub OAuth as alternative sign-in options.

8.  **Logging & Monitoring**

    - Use Axiom (`next-axiom`) for structured logging and application monitoring.

9.  **Email Notifications**

    - Use Resend for sending transactional emails (e.g., magic links).

10. **UI/UX Approach**
    - Focus on clean, responsive design using Tailwind CSS.
    - Employ reusable components (`app/_ui/`).
    - Provide a guided onboarding experience (`react-joyride`).

## Next Steps

1. **Deployment & Operations**:

   - Finalize Fly.io deployment pipeline (potentially CI/CD).
   - Implement robust monitoring and logging for the Fly.io deployment.
   - Refine container health checks for production.
   - Document Fly.io deployment and management procedures.

2. Docker Integration

   - Test Docker deployment in various environments
   - Optimize container configurations
   - Document container management procedures
   - Implement CI/CD for Docker builds
   - Create container health checks

3. Performance Optimization

   - Server Action response times
   - Database query optimization
   - Memory usage improvements
   - Caching implementation
   - Load testing

4. Testing Implementation

   - Comprehensive unit tests
   - Integration testing
   - End-to-end testing
   - Performance benchmarks
   - Security testing
   - Docker deployment testing

5. Documentation Updates
   - User documentation
   - Developer guides
   - API documentation
   - Deployment guides (standard & Docker)
   - Troubleshooting guides
6. **Subscription System Enhancement**
   - **Database schema updated for subscription tracking (DONE)**
   - **Add subscription status checks (using new DB fields) (DONE)**
   - Create subscription management UI
   - Implement usage limits based on subscription tier
   - **Add webhook handling for subscription events (DONE for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`)**
   - **Integrate Stripe Customer Portal (DONE)**
   - **Add Admin UI for viewing active customer subscriptions (DONE)**
   - ~~Add webhook handling for other relevant events (`customer.subscription.updated`, `customer.subscription.deleted`, etc.)~~ (Now covered)
   - **Implement usage limit checks based on `SubscriptionPlan` table (DONE)**
   - **Create UI/Action for managing `SubscriptionPlan` table records (DONE)**
   - **Populate `SubscriptionPlan` table with actual plan data (PENDING)**
7. **Marketing Site Development (`app/(marketing)/`)**
   - **Home page content (`/`) (DONE - Needs Review/Refinement)**
   - **Features page content (`/features`) (DONE - Needs Review/Refinement)**
   - **Pricing page content (`/pricing`) (DONE - Needs Review/Refinement)**
   - About page content (`/about`) (PENDING)
   - Blog structure and initial posts (`/blog`) (PENDING)
   - Contact page content (`/contact`) (PENDING)
   - Shared marketing navigation/layout (`app/(marketing)/layout.tsx`) (DONE - Needs Review/Refinement)
   - Terms of Service page (`/terms`) (DONE)
   - Privacy Policy page (`/privacy`) (DONE)
   - Styling and visuals (`app/marketing.css`, Tailwind) (DONE - Needs Review/Refinement)
8. **Onboarding Experience**
   - Refine Product Tour steps and content (`app/_ui/onboarding/ProductTour.tsx`).
   - Integrate tour triggering logic (e.g., for first-time users).
9. **Email Integration**
   - Implement specific email triggers beyond magic links (e.g., subscription confirmations, welcome emails).
10. **Logging & Monitoring**
    - Define key metrics and alerts in Axiom.
    - Ensure comprehensive logging coverage in critical paths.

## Current Considerations

1.  Technical Implementation

- Server Action performance
- Database optimization
- Memory management
- Error handling
- Caching strategies

2. Project Management

   - Testing coverage
   - Documentation completeness
   - Performance metrics
   - User feedback
   - Feature requests

3. Risk Management
   - System reliability
   - Data integrity
   - Error recovery
   - Security measures
   - Resource management
