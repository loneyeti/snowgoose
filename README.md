# Snowgoose

<div align="center">
  <img src="public/snowgoose-logo.png" alt="Snowgoose Logo" width="200"/>
  <p>A unified interface for AI service interactions</p>
</div>

## Overview

Snowgoose is a powerful Next.js 14 application that provides a unified interface for interacting with multiple AI services. It simplifies the complexity of managing different AI service integrations by offering a standardized, feature-rich frontend while maintaining provider-specific capabilities.

### Key Features

- 🤖 **Multi-Provider Support**

  - OpenAI integration
  - Anthropic integration
  - Google AI integration
  - Extensible for additional providers

- 💬 **Rich Interaction Capabilities**

  - Text chat with AI models
  - Vision/image analysis
  - Image generation
  - Thinking mode support
  - Conversation history management

- 🎭 **Customization Options**

  - Custom personas for different interaction styles
  - Configurable output formats (Markdown, HTML, plain text)
  - User preferences management
  - MCP tool integration (coming soon)

- 🔒 **Security & Reliability**
  - Clerk authentication
  - Elegant error handling
  - Type-safe database operations
  - Comprehensive data validation

## Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- API keys for desired AI services (OpenAI, Anthropic, Google AI)
- Clerk account for authentication

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/snowgoose.git
cd snowgoose
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."

# MCP Configuration
MCP_CONFIG_PATH="..."
```

4. Initialize the database:

```bash
npx prisma generate
npx prisma migrate dev
```

## Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Production

Build and start the production server:

```bash
npm run build
npm start
```

## Features

### AI Service Integration

- **Multiple Providers**: Seamlessly switch between different AI providers
- **Standardized Interface**: Consistent experience across all providers
- **Provider-Specific Features**: Access unique capabilities of each provider
- **Thinking Mode**: Support for advanced thinking models

### Chat Capabilities

- **Text Chat**: Natural language conversations with AI models
- **Vision Analysis**: Process and analyze images
- **Image Generation**: Create images using AI models
- **History Management**: Save and revisit previous conversations

### Customization

- **Personas**: Create and manage different interaction styles
- **Output Formats**: Configure response formats (Markdown, HTML, plain text)
- **User Preferences**: Personalize your interaction experience
- **MCP Tools**: Extend functionality with custom tools (coming soon)

### Technical Features

- **Server Actions**: Efficient server-side operations
- **Database Integration**: Type-safe Prisma ORM integration
- **Error Handling**: Comprehensive error management
- **Authentication**: Secure user authentication via Clerk
- **Repository Pattern**: Clean and maintainable data access
- **Factory Pattern**: Flexible AI vendor integration

## Architecture

Snowgoose follows a clean architecture pattern with:

- Next.js 14 App Router
- Server Components and Actions
- Prisma ORM for database operations
- Repository pattern for data access
- Factory pattern for AI vendor integration
- MCP integration for extensibility

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
