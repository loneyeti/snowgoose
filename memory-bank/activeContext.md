# Active Context

## Current Focus

- Performance optimization of Server Actions
- Enhanced error handling and recovery
- Monitoring and logging implementation
- Testing and documentation
- User experience improvements

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
  - **Refactored AI vendor logic into a standalone npm package (`snowgander` v0.0.17).**
  - **Fixed `toolUseId` handling in `chat.repository.ts` to correctly pass the string ID from `ToolUseBlock` to `ToolResultBlock` as required by `snowgander` and vendors like Anthropic.**
  - **Corrected MCP tool flow in `chat.repository.ts` to prevent sending available tools on the second API call (after receiving a tool result), resolving an issue where the AI would attempt to call the tool again instead of providing a final text response.**
  - **Implemented basic Stripe integration for subscriptions:**
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

## Active Decisions

1. **Deployment Strategy**:

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

6. **Subscription Management**

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
   - Add subscription status checks (using new DB fields)
   - Create subscription management UI
   - Implement usage limits based on subscription tier
   - **Add webhook handling for subscription events (DONE for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`)**
   - **Integrate Stripe Customer Portal (DONE)**
   - ~~Add webhook handling for other relevant events (`customer.subscription.updated`, `customer.subscription.deleted`, etc.)~~ (Now covered)

## Current Considerations

1. Technical Implementation

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
