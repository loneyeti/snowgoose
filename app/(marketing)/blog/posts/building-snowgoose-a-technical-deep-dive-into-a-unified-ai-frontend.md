---
title: "Building Snowgoose: A Technical Deep Dive into a Unified AI Frontend"
date: "2025-04-19"
excerpt: "Leveraging NextJS, Supabase, and Fly.io to create our SaaS"
tags: ["snowgoose", "launch", "snowgander", "ai"]
---

Snowgoose started with a simple premise: accessing the power of cutting-edge AI models shouldn't require juggling multiple subscriptions, APIs, and complex billing systems. We wanted to build a clean, unified frontend that makes interacting with models from OpenAI, Anthropic, Google, and others seamless and predictable. As an open-source project, we believe in transparency, and that includes sharing the technical journey behind building Snowgoose.

This post dives into the technical nuts and bolts – the tech stack we chose, the architectural decisions we made, and some of the specific problems we solved along the way. Whether you're a developer considering similar tools or just curious about how Snowgoose works under the hood, read on!

### The Core Problem: AI API Fragmentation

The AI landscape is exploding, which is exciting but also creates challenges:

1.  **Vendor Lock-in:** Relying on a single provider limits flexibility.
2.  **Integration Complexity:** Each vendor has its own SDK, authentication methods, request/response formats, and capability nuances (vision, tool use, thinking steps). Integrating multiple vendors directly into a frontend application becomes messy quickly.
3.  **Cost Management:** Token-based billing across multiple services is hard to predict and manage.
4.  **UI/UX Consistency:** Providing a consistent user experience across different backend models is difficult.

Snowgoose aims to solve these by providing a unified interface built on a thoughtful tech stack and a dedicated abstraction layer.

### The Snowgoose Tech Stack

We chose a modern, robust stack centered around TypeScript and Next.js:

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Backend Logic:** Next.js Server Actions
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Supabase Auth (Magic Link, Google OAuth, GitHub OAuth)
- **File Storage:** Supabase Storage (for vision uploads)
- **Styling:** Tailwind CSS
- **UI Components:** React, Headless UI
- **State Management:** React Hooks (useState, useEffect, custom hooks)
- **AI Abstraction:** `snowgander` (Our custom open-source npm package)
- **Deployment:** Docker & Fly.io
- **Logging:** Axiom (`next-axiom`)
- **Notifications:** Sonner
- **Validation:** Zod

### Key Architectural Choices & Rationale

1.  **Next.js 14 App Router & Server Actions:**

    - **Why:** We embraced the App Router for its Server Component-first architecture and Server Actions for handling backend logic. This allows co-locating data fetching and mutations with UI components, reducing the need for separate API routes for many operations, simplifying state management, and minimizing client-side JavaScript.
    - **Impact:** Server Actions directly interact with our database repositories and the `snowgander` AI abstraction layer, keeping sensitive logic (like API key handling and database writes) securely on the server.

2.  **Prisma & Repository Pattern:**

    - **Why:** Prisma provides excellent type safety, developer experience (Prisma Studio, migrations), and performance for interacting with our PostgreSQL database. We implemented the Repository Pattern (`app/_lib/db/repositories/`) to abstract Prisma client calls, centralizing database logic and making Server Actions cleaner and more testable.
    - **Impact:** This keeps our data access logic organized and decoupled from the Server Action business logic. The `BaseRepository` provides common error handling.

3.  **Supabase for Auth & Storage:**

    - **Why:** Supabase offers a fantastic, easy-to-integrate suite of backend services. We leverage Supabase Auth for user management (supporting Magic Link and OAuth providers) and Supabase Storage for handling user image uploads required by vision-capable AI models. Although we use Supabase's Postgres for production, the auth and storage integrations are key benefits.
    - **Impact:** Simplifies user authentication flows significantly and provides a secure, scalable solution for file storage linked directly to user IDs via Row Level Security (RLS) policies.

4.  **`snowgander` - The AI Abstraction Layer:**

    - **Why:** This was perhaps the most critical architectural decision. Directly integrating multiple AI vendor SDKs into the main application would lead to tight coupling and maintenance nightmares. We created `snowgander`, a separate TypeScript npm package, to solve this.
    - **Impact:** `snowgander` uses the Factory and Adapter patterns. The `AIVendorFactory` takes vendor/model configuration and returns a standardized `AIVendorAdapter`. Each adapter (e.g., `OpenAIAdapter`, `AnthropicAdapter`) implements this standard interface but handles the specific vendor SDK calls internally. It standardizes request options (`AIRequestOptions`), response formats (`AIResponse`, `ChatResponse`), and content representation (`ContentBlock[]`), allowing Snowgoose to interact with any supported vendor through a single, consistent interface. This keeps the main Snowgoose codebase focused on application logic and UI, not vendor-specific integration details.

5.  **Docker & Fly.io for Deployment:**
    - **Why:** Containerization with Docker ensures consistency between development and production environments. Fly.io provides a great platform for deploying containerized applications globally with ease, including managed Postgres databases (though we use Supabase for prod DB) and secret management.
    - **Impact:** Our multi-stage `Dockerfile` creates optimized production images. `docker-compose.yml` provides a reproducible local development environment (including a local Postgres DB), while `fly.toml` configures the Fly.io deployment. This setup supports reliable deployments and scaling.

### Solving Specific Technical Problems

Building Snowgoose involved tackling several interesting challenges:

1.  **Handling AI Vendor Differences (`snowgander`):**

    - **Problem:** OpenAI, Anthropic, and Google have different ways to format messages (especially multi-modal content), different parameters (e.g., `temperature`, `max_tokens`), and different ways of reporting capabilities or handling errors.
    - **Solution:** `snowgander`'s adapters handle this translation. For example, the `OpenAIAdapter` maps our internal `ContentBlock[]` (which includes text, images, etc.) to the specific array format expected by OpenAI's `client.responses.create` or `client.chat.completions.create` endpoints, including formatting base64 image data into data URLs. The `AnthropicAdapter` does the same for Anthropic's `messages.create` format. `ModelConfig` within `snowgander` allows specifying model capabilities (`isVision`, `isThinking`) which adapters use to validate requests or adjust parameters.

2.  **Implementing Usage Limits:**

    - **Problem:** To offer predictable pricing, we needed to track AI usage costs against subscription limits without direct per-token billing to the user. Usage needs to reset with the billing period.
    - **Solution:** We added Stripe integration for subscription management and created a `SubscriptionPlan` table in Prisma, linked to Stripe Price IDs, to store usage limits (e.g., `$0.50` worth of credits for the Free Tier). The `User` model tracks `periodUsage`. Stripe webhooks (`/api/webhooks/stripe/route.ts`) listen for `checkout.session.completed`, `customer.subscription.updated` (which triggers usage reset on renewal), and `customer.subscription.deleted`. Before making an AI call, the `chat-actions.ts` server action calls `userRepository.checkUsageLimit`, which verifies the user's `periodUsage` against their plan's `usageLimit` and ensures their `stripeSubscriptionStatus` is `active` if they have a paid plan.

3.  **Multi-Turn MCP Tool Interaction:**

    - **Problem:** Using tools (like Anthropic's function calling via MCP) involves a multi-step process: (1) Send chat history + available tools. (2) AI responds requesting a tool call (`ToolUseBlock`). (3) Application executes the tool. (4) Application sends the tool result back (`ToolResultBlock`). (5) AI provides the final response. A key bug was incorrectly sending the available tools again in step (4), causing the AI to request the tool again instead of using the result.
    - **Solution:** The `chatRepository.sendChat` method was carefully refactored. It now detects a `ToolUseBlock` in the initial AI response. If found, it executes the tool via the `MCPManager`, constructs a `ToolResultBlock` (ensuring the `toolUseId` from the `ToolUseBlock` is correctly passed as a string), adds _both_ the initial AI response (with the `ToolUseBlock`) and the user message containing the `ToolResultBlock` to the chat history. Crucially, before making the _final_ call to the AI (step 4->5), it clears the `mcpAvailableTools` from the chat object, preventing the AI from seeing the tools again and ensuring it processes the result.

4.  **Handling Base64 Image Output:**
    - **Problem:** Some AI models (like Gemini) can return generated images directly as base64 encoded data within the API response (`ImageDataBlock` in `snowgander`). We needed to store this and display it.
    - **Solution:** We created a helper function `uploadBase64Image` (`app/_lib/storage.ts`) that takes the base64 string and MIME type, converts it server-side into a `File`-like object (using Node's `Buffer`), and uploads it to Supabase Storage using the existing `supabaseUploadFile` function. The `ChatRepository` now processes response content, identifies `ImageDataBlock`s, calls this helper, and replaces the `ImageDataBlock` with a standard `ImageBlock` containing the public Supabase URL before returning the final response to the UI.

### The Role of `snowgander`

It's worth reiterating the importance of `snowgander`. By externalizing the AI vendor integration logic:

- **Snowgoose Stays Clean:** The main application (`/app`) doesn't contain vendor-specific SDKs or complex mapping logic. Server Actions simply interact with the standard `AIVendorAdapter` interface provided by the factory.
- **Maintainability:** Updating a vendor SDK or adding a new vendor only requires changes within the `snowgander` package, not scattered throughout the main application.
- **Reusability:** `snowgander` itself is an open-source package that others can potentially use in their own projects.
- **Testability:** Adapters can be tested in isolation.

### Deployment Strategy

We opted for Docker containerization and Fly.io hosting:

- **Docker:** Ensures development/production parity. Our multi-stage `Dockerfile` creates lean production images by separating build dependencies from runtime dependencies. `docker-compose.yml` facilitates local development with hot-reloading and a linked Postgres container.
- **Fly.io:** Provides simple Docker-based deployment, global regions, integrated secret management (`fly secrets set ...`), and easy scaling. Our `fly.toml` configures the app service, build settings (using the production target from the Dockerfile), and health checks. Database migrations (`prisma migrate deploy`) are run via `fly ssh console` post-deployment against the production (Supabase) database.

### Future Directions

We're continually improving Snowgoose. Technically, we're focused on:

- Expanding test coverage (unit, integration, E2E).
- Implementing more robust monitoring and logging in production.
- Optimizing Server Action performance and database queries.
- Enhancing the `snowgander` package with more consistent tool/function-calling support across vendors.
- Refining the UI/UX based on user feedback.

### Conclusion

Building Snowgoose has been a journey in leveraging modern web technologies like Next.js 14, Prisma, and Supabase, combined with careful architectural choices like the Repository pattern and, crucially, the `snowgander` AI abstraction layer. This stack allows us to provide a simple, unified interface over complex backend systems while keeping the codebase maintainable and open source.

We hope this technical overview provides some insight into how Snowgoose works. We encourage you to check out the [Snowgoose GitHub repository](https://github.com/loneyeti/snowgoose) and the [snowgander package](https://github.com/loneyeti/snowgander). Feedback and contributions are always welcome!

---
