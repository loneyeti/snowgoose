# Snowgoose

<div align="center">
  <img src="public/snowgoose-logo-spring-2025-black-whitebg.png" alt="Snowgoose Logo" width="200"/>
  <p>A unified interface for AI service interactions</p>
</div>

## Overview

Snowgoose is a powerful Next.js 14 application that provides a unified interface for interacting with multiple AI services. It simplifies the complexity of managing different AI service integrations by offering a standardized, feature-rich frontend while maintaining provider-specific capabilities. It is designed to be deployed using Docker.

### Key Features

- 🤖 **Multi-Provider Support**
  - OpenAI
  - Anthropic
  - Google AI
  - OpenRouter
  - Extensible for additional providers
- 💬 **Rich Interaction Capabilities**
  - Text chat with AI models
  - Vision/image analysis
  - Image generation
  - Thinking mode support
  - Conversation history management
- 🎭 **Customization Options**
  - Custom personas (system prompts) for different interaction styles
  - Configurable output formats (Markdown, HTML, plain text)
  - MCP tool integration

### Feature Status by Vendor:

| AI Provider | Chat | Vision | Image Gen | Thinking/Reasoning | MCP Use |
| ----------- | ---- | ------ | --------- | ------------------ | ------- |
| Anthropic   | ✅   | ✅     | N/A       | ✅                 | ✅      |
| OpenAI      | ✅   | ✅     | ✅        | ✅                 | 🚫      |
| Google      | ✅   | ✅     | ✅        | 🚫                 | 🚫      |
| OpenRouter  | ✅   | ✅     | N/A       | ✅                 | 🚫      |

## Known Issues / Areas for Improvement

- Test coverage needs improvement
- Performance optimization is ongoing (Server Actions, DB queries)
- Logging and monitoring systems need enhancement/implementation
- Need to implement automatic deletion of saved Vision files
- Potential bug when loading history conversations created before a model was marked as 'thinking'

## Prerequisites

- API keys for desired AI services (OpenAI, Anthropic, Google AI, Openrouter)
- Supabase account:
  - Sign up for a free account at [supabase.com](https://supabase.com).
  - Used for **Authentication**, **Storage** (Vision feature), and the **Production Database**.
  - Create a Supabase project, which includes a PostgreSQL database.
  - Create a private storage bucket (e.g., `snowgoose-vision`) and configure policies.
    - **Hint**: Use the "Give users access to only their own top level folder named as uid" template policy, as this matches Snowgoose's file saving structure.
- Docker and Docker Compose installed (for local development environment).

## Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/snowgoose.git # Replace with actual repo URL
    cd snowgoose
    ```

2.  **Set up environment variables:**

    Copy the example file:

    ```bash
    cp env.local.example .env.local
    ```

    Edit `.env.local` with your configuration details. This file is used for local Docker development:

    ```env
    # Database (For Local Docker Development - Points to the DB service in docker-compose.yml)
    DATABASE_URL="postgresql://postgres:yoursecurepassword@db:5432/snowgoose?schema=public" # Default credentials from docker-compose.yml

    # Supabase (Authentication & Storage)
    NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key" # Needed for some server-side operations like deleting storage objects
    SUPABASE_VISION_STORAGE_BUCKET=snowgoose-vision # Or your chosen bucket name

    # AI Services
    OPENAI_API_KEY="sk-..."
    ANTHROPIC_API_KEY="sk-..."
    GOOGLE_AI_API_KEY="..."
    OPENROUTER_API_KEY="..." # If using OpenRouter

    # MCP Configuration (Optional, if using local MCP servers)
    # MCP_CONFIG_PATH="/path/to/your/mcp/config.json"

    # Production Database (Used when deploying, set via secrets, not directly in .env files)
    # PRODUCTION_DATABASE_URL="postgresql://supabase_user:password@db.project-id.supabase.co:5432/postgres"
    ```

    **Note:** For local development, `DATABASE_URL` points to the PostgreSQL container managed by Docker Compose. For production deployment (e.g., on Fly.io), you will set the `DATABASE_URL` secret to your Supabase database connection string.

## Development (Docker)

1.  **Build and start the development containers:**

    This command uses `docker-compose.yml` to build the necessary images (if they don't exist) and start the application container (`app`) and the local PostgreSQL database container (`db`). It mounts the local codebase into the `app` container for hot-reloading.

    ```bash
    docker compose up --build
    ```

2.  **Initialize the database (run in a separate terminal):**

    Once the containers are running, execute the Prisma migration command _inside_ the `app` container:

    ```bash
    docker compose exec app npx prisma migrate dev
    ```

    You might also want to seed the database (if seed script exists):

    ```bash
    docker compose exec app npx prisma db seed
    ```

3.  **Access the application:**

    The application should now be available at `http://localhost:3000`. Changes made to the code locally will trigger a rebuild and reload in the container.

## Production Deployment (Fly.io with Supabase DB)

This project is configured for deployment to [Fly.io](https://fly.io) using the provided `Dockerfile` and `fly.toml`, connecting to a Supabase database for production data.

1.  **Prerequisites:**

    - Ensure you have a Supabase project created (includes a PostgreSQL database).
    - Install `flyctl`: `curl -L https://fly.io/install.sh | sh`
    - Login: `flyctl auth login`
    - Create Fly app (if first time): `flyctl launch` (Review `fly.toml`).

2.  **Set Secrets:**
    Configure required environment variables as secrets in Fly.io. **Crucially, set `DATABASE_URL` to your Supabase database connection string.** You can find this in your Supabase project settings (Database -> Connection string -> URI).

    ```bash
    # Database Secret (IMPORTANT!)
    flyctl secrets set DATABASE_URL="postgresql://supabase_user:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"

    # Other Secrets
    flyctl secrets set NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co" \
      NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-SUPABASE-ANON-KEY]" \
      SUPABASE_SERVICE_ROLE_KEY="[YOUR-SUPABASE-SERVICE-ROLE-KEY]" \
      SUPABASE_VISION_STORAGE_BUCKET="snowgoose-vision" \
      OPENAI_API_KEY="sk-..." \
      ANTHROPIC_API_KEY="sk-..." \
      GOOGLE_AI_API_KEY="..." \
      # Add OPENROUTER_API_KEY if used
      # Add MCP_CONFIG_PATH if used and relevant in production
    ```

3.  **Deploy:**
    Fly.io uses the `Dockerfile` to build and deploy your application.

    ```bash
    flyctl deploy
    ```

4.  **Run Database Migrations (Post-Deploy):**
    Connect to a running instance and apply migrations **to your Supabase database**:

    ```bash
    flyctl ssh console --command "npx prisma migrate deploy"
    ```

    _This command runs inside the Fly container but targets the production `DATABASE_URL` (Supabase) you set via secrets._

5.  **Monitor:**
    - Check status: `flyctl status`
    - View logs: `flyctl logs`

_Note: Hosting on platforms like Vercel is **not recommended** due to the MCP client implementation requiring a stateful server environment._

## Architecture

- Next.js 14 App Router
- Server Components and Server Actions
- Prisma ORM for database operations
- Repository pattern for data access
- Factory pattern for AI vendor integration
- MCP server integration
- **Development Environment:** Docker Compose (App + Postgres DB)
- **Production Environment:** Fly.io (App Container) + Supabase (Postgres DB, Auth, Storage)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
