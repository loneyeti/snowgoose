# Snowgoose

<div align="center">
  <img src="public/snowgoose-logo.png" alt="Snowgoose Logo" width="200"/>
  <p>A unified interface for AI service interactions</p>
</div>

## Overview

Snowgoose is a powerful Next.js 14 application that provides a unified interface for interacting with multiple AI services. It simplifies the complexity of managing different AI service integrations by offering a standardized, feature-rich frontend while maintaining provider-specific capabilities.

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

## Known Issues

- Need more robust Supabase authentication
- Forget password is not working
- Need to implement automatic deletion of saved Vision files
- Bug when loading a history conversation that was created before a model was marked as a thinking model.
- Error handling in general

## Prerequisites

- API keys for desired AI services (OpenAI, Anthropic, Google AI)
- Supabase account for authentication
  - Sign up for a free Supabase account at [supabase.com](https://supabase.com)
  - Create a private storage bucket and create policies for it
    - Hint: Use "Give users access to only their own top level folder named as uid" template Supabase policy as this matches how Snowgoose saves files.
- Either:
  - **Option 1: Local Setup**
    - Node.js v18 or higher
    - PostgreSQL database
  - **Option 2: Docker Setup**
    - Docker and Docker Compose

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/snowgoose.git
cd snowgoose
```

2. Set up environment variables:

```bash
cp env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication & Cloud storage (for vision capabilities)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_VISION_STORAGE_BUCKET=snowgoose-vision

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."
```

_Note: If using Docker compose, PostgreSQL settings can be left blank as Docker compose will set up a PostgreSQL instance for you._

### Option 1 (Easiest): Docker:

3. Build and start the server in dev mode:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`.

### Option 2: Local development (Non-Docker):

3. Install dependencies:

```bash
npm install
```

4. Initialize the database:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production

### Non-docker Production

Build and start the production server:

```bash
npm run build
npm start
```

Host with something like a combination of PM2 and nginx.

_Note: Vercel hosting will not work with the MCP client implementation in its current state because of the need for a stateful server._

### Docker Production

Coming soon.

## Architecture

- Next.js 14 App Router
- Server Components and Actions
- Prisma ORM for database operations
- Repository pattern for data access
- Factory pattern for AI vendor integration
- MCP server integration

## Contributing

Please contribute!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
