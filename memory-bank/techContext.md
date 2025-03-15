# Technical Context

## Technology Stack

### Core Technologies

- **Framework**: Next.js 14
  - App Router
  - Server Components
  - Server Actions
  - API Routes
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Form Management**: React Hook Form
- **Validation**: Zod
- **AI Integration**:
  - OpenAI SDK
  - Anthropic SDK (@anthropic-ai/sdk)
  - Google AI SDK

### Development Environment

- **Node.js**: v18+ required
- **Package Manager**: npm
- **Development Mode**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm start`
- **Database Tools**:
  - Prisma CLI
  - Prisma Studio
  - PostgreSQL client

## Dependencies

### Production Dependencies

Required in package.json:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "@clerk/nextjs": "latest",
    "@prisma/client": "latest",
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "react-hook-form": "latest",
    "openai": "latest",
    "@google/generative-ai": "latest",
    "zod": "latest",
    "tailwindcss": "latest",
    "typescript": "5.x"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "autoprefixer": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "postcss": "latest",
    "prisma": "latest",
    "typescript": "latest"
  }
}
```

## Technical Constraints

### Database Integration

- **Schema Management**:
  - Prisma schema as source of truth
  - Type-safe database operations
  - Migration handling through Prisma
  - Repository pattern abstraction
  - Connection pooling in production

### Authentication

- **Clerk Integration**:
  - Protected routes
  - Session management
  - User context
  - Role-based access
  - API route protection

### AI Integration

- **Vendor Requirements**:
  - OpenAI API key
  - Anthropic API key
  - Google AI API key
  - Environment configuration
  - Response standardization

### Performance Requirements

- **Response Times**:
  - API responses < 500ms
  - Page loads < 1s
  - AI responses < 5s
- **Database**:
  - Query optimization
  - Connection pooling
  - Transaction management
- **Caching**:
  - Route caching
  - Data caching
  - Static generation

### Browser Support

- Modern browsers (last 2 versions)
- Mobile responsiveness
- Progressive enhancement
- Error boundaries
- Loading states

## Development Setup

### Environment Variables

Required in .env.local:

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

### Local Development

1. Repository Setup:

```bash
git clone <repository>
cd <repository>
npm install
```

2. Database Setup:

```bash
npx prisma generate
npx prisma migrate dev
```

3. Environment Configuration:

- Copy .env.local.example to .env.local
- Fill in required environment variables

4. Development Server:

```bash
npm run dev
```

### Build Process

1. Pre-build checks:

```bash
npm run lint
npm run type-check
```

2. Build steps:

```bash
npm run build
```

3. Production start:

```bash
npm start
```

### Deployment

1. Environment Setup:

- Configure production environment variables
- Set up database connection
- Configure AI service keys

2. Database Migration:

```bash
npx prisma migrate deploy
```

3. Application Deployment:

```bash
npm run build
npm start
```

## Security Considerations

### Authentication

- Clerk security best practices
- Protected API routes
- Session validation
- CSRF protection
- Rate limiting

### Data Protection

- Database encryption
- Secure environment variables
- Input validation
- Output sanitization
- Error message security

### API Security

- Rate limiting
- Request validation
- Response validation
- Secure headers
- Error handling

### Database Security

- Connection encryption
- Access control
- Query sanitization
- Transaction isolation
- Audit logging

### MCP Security

- Process isolation
- Environment separation
- Input validation
- Error recovery
- Resource limits
