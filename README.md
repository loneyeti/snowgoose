# Snowgoose

A unified interface for connecting to various AI services.

## Database Operations

The project uses Prisma ORM to interact with a PostgreSQL database. The schema is defined in `prisma/schema.prisma` and includes models for:

- Users and authentication
- AI models and vendors
- Personas and output formats
- Conversation history
- MCP tools and settings

### Available Commands

- `npm run db:generate` - Generate Prisma Client after schema changes
- `npm run db:studio` - Open Prisma Studio to view/edit data
- `npm run db:pull` - Pull the latest database schema
- `npm run db:push` - Push schema changes to the database
- `npm run db:test` - Run database connection test

### Environment Setup

The database connection requires the following environment variables in `.env.local`:

```env
POSTGRES_DB=snowgoose
POSTGRES_USER=your_username
POSTGRES_PASS=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASS}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

### Using Prisma Client

Import and use the Prisma client in your code:

```typescript
import prisma from "@/lib/db/prisma";

// Example: Fetch all models with their vendors
const models = await prisma.model.findMany({
  include: {
    apiVendor: true,
  },
});

// Example: Create a new persona
const newPersona = await prisma.persona.create({
  data: {
    name: "Custom Assistant",
    prompt: "You are a helpful assistant...",
  },
});
```

### Database Schema

The database schema is designed to support:

1. **AI Integration**

   - Models and their capabilities (vision, image generation, thinking mode)
   - API vendor relationships
   - Model preferences

2. **User Management**

   - User accounts and authentication
   - User-specific settings and preferences
   - Conversation history

3. **Content Management**

   - Personas with customizable prompts
   - Output formats with render types
   - MCP tool configurations

4. **Relationships**
   - User ownership of personas and output formats
   - Model associations with vendors
   - Settings linked to users and models

For detailed schema information, see `prisma/schema.prisma`.
