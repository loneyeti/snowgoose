# Snowgoose

<div align="center">
  <img src="public/snowgoose-logo.png" alt="Snowgoose Logo" width="200"/>
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
| Anthropic   | ✅   | 🚫     | N/A       | ✅                 | ✅      |
| OpenAI      | ✅   | ✅     | ✅        | 🚫                 | 🚫      |
| Google      | ✅   | 🚫     | ✅        | 🚫                 | 🚫      |
| OpenRouter  | ✅   | 🚫     | N/A       | 🚫                 | 🚫      |

## Known Issues / Areas for Improvement

- Test coverage needs improvement
- Performance optimization is ongoing (Server Actions, DB queries)
- Logging and monitoring systems need enhancement/implementation
- Forget password functionality is not working
- Need to implement automatic deletion of saved Vision files
- Potential bug when loading history conversations created before a model was marked as 'thinking'

## Prerequisites

- API keys for desired AI services (OpenAI, Anthropic, Google AI, Openrouter)
- Supabase account for authentication & storage:
  - Sign up for a free Supabase account at [supabase.com](https://supabase.com)
  - Create a private storage bucket (e.g., `snowgoose-vision`) and configure policies.
    - **Hint**: Use the "Give users access to only their own top level folder named as uid" template policy, as this matches Snowgoose's file saving structure.
- Docker and Docker Compose installed.

## Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/snowgoose.git # Replace with actual repo URL if different
    cd snowgoose
    ```

2.  **Set up environment variables:**

    Copy the example file:

    ```bash
    cp env.local.example .env.local
    ```

    Edit `.env.local` with your configuration details:

    ```env
    # Database (Used by Docker Compose for the Postgres service)
    # You can leave DATABASE_URL commented out or blank here if using the default docker-compose setup,
    # as compose defines it for the app service. Set it if your DB is external.
    # DATABASE_URL="postgresql://postgres:yoursecurepassword@db:5432/snowgoose?schema=public"

    # Authentication & Cloud storage (for vision capabilities)
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
    ```

    **Important:** The `DATABASE_URL` in `.env.local` is primarily for Prisma CLI commands run _outside_ the container (if needed). The `docker-compose.yml` file defines the `DATABASE_URL` environment variable _for the app service container_, pointing it to the `db` service within the Docker network. Ensure the credentials match between `docker-compose.yml`'s `db` service environment variables and the `DATABASE_URL` used by the `app` service.

## Development (Docker)

1.  **Build and start the development containers:**

    This command uses `docker-compose.yml` to build the necessary images (if they don't exist) and start the application container (`app`) and the database container (`db`). It mounts the local codebase into the `app` container for hot-reloading.

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

## Production Deployment

There are two primary Docker-based deployment methods:

### Option 1: Self-Hosted Production (using Docker Compose)

This method uses `docker-compose.prod.yml` for a production-ready setup on your own server.

1.  **Create Production Environment File:**
    Create a `.env.production` file (DO NOT COMMIT THIS FILE). It should contain the same variables as `.env.local` but with your production values (production database URL, production API keys, etc.).

    ```bash
    cp .env.local .env.production
    # Edit .env.production with production values
    ```

    _Ensure `DATABASE_URL` in `.env.production` points to your intended production database if it's external to the compose setup._

2.  **Build and Start Production Containers:**
    Use the `-f` flag to specify the production compose file. Run in detached mode (`-d`).

    ```bash
    docker compose -f docker-compose.prod.yml up --build -d
    ```

3.  **Run Database Migrations:**
    Execute migrations inside the running production `app` container.

    ```bash
    docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
    ```

### Option 2: Fly.io Deployment

This project is configured for easy deployment to [Fly.io](https://fly.io) using the provided `Dockerfile` and `fly.toml`.

1.  **Prerequisites:**

    - Install `flyctl`: `curl -L https://fly.io/install.sh | sh`
    - Login: `flyctl auth login`
    - Create Fly app (if first time): `flyctl launch` (Review `fly.toml`, **do not** deploy a database via this command if using Fly Postgres).
    - Provision Fly Postgres (Recommended): `flyctl postgres create`
    - Attach Postgres to App: `flyctl postgres attach --app <your-app-name> <your-postgres-app-name>` (Sets `DATABASE_URL` secret).

2.  **Set Secrets:**
    Configure required environment variables as secrets in Fly.io:

    ```bash
    flyctl secrets set NEXT_PUBLIC_SUPABASE_URL="..." \
      NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
      SUPABASE_SERVICE_ROLE_KEY="..." \
      SUPABASE_VISION_STORAGE_BUCKET="..." \
      OPENAI_API_KEY="..." \
      ANTHROPIC_API_KEY="..." \
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
    Connect to a running instance and apply migrations:

    ```bash
    flyctl ssh console --command "npx prisma migrate deploy"
    ```

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
- Docker for containerization (Development & Production)
- Fly.io configuration for cloud deployment

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
