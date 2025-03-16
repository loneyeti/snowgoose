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
- **Authentication**: Supabase
- **Form Management**: React Hook Form
- **Validation**: Zod
- **AI Integration**:
  - OpenAI SDK
  - Anthropic SDK (@anthropic-ai/sdk)
  - Google AI SDK

### Development Environment

#### Local Setup

- **Node.js**: v18+ required
- **Package Manager**: npm
- **Development Mode**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm start`
- **Database Tools**:
  - Prisma CLI
  - Prisma Studio
  - PostgreSQL client

#### Docker Setup

- **Docker**: Latest version
- **Docker Compose**: v3.8+
- **Development Mode**: `docker compose up`
- **Production**: `docker compose -f docker-compose.yml up -d`
- **Database**: PostgreSQL 15 (Alpine)
- **Container Management**:
  - Build: Docker multi-stage builds
  - Volumes: Node modules, Next.js cache, PostgreSQL data
  - Network: Internal container networking

## Dependencies

### Production Dependencies

Required in package.json:

```json
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@google-cloud/storage": "^7.7.0",
    "@google/generative-ai": "^0.24.0",
    "@headlessui/react": "^1.7.18",
    "@heroicons/react": "^2.1.1",
    "@modelcontextprotocol/sdk": "^1.7.0",
    "@prisma/client": "^6.5.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.49.1",
    "clsx": "^2.1.0",
    "html-react-parser": "^5.1.1",
    "nanoid": "^5.0.5",
    "next": "^14.1.0",
    "openai": "^4.87.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^9.0.1",
    "react-material-symbols": "^4.3.1",
    "rehype-raw": "^7.0.0",
    "sharp": "^0.33.2",
    "zod": "^3.22.4"
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

- **Supabase Integration**:
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
NEXT_PUBLIC_SUPABASE_URL=https://projectid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASEANONKEY}}

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

#### Standard Deployment

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

#### Docker Deployment

1. Environment Setup:

   - Configure .env.local file
   - Ensure Docker and Docker Compose are installed
   - Set up container registry (if using)

2. Build and Deploy:

   ```bash
   docker compose -f docker-compose.yml up -d
   ```

3. Database Migration:
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

## Security Considerations

### Authentication

- Supabase security best practices
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
