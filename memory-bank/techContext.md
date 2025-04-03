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

- **Docker**: Latest version required.
- **Docker Compose**: v3.8+ required.
- **Development**: Uses `docker-compose.yml`. Run with `docker compose up`. Includes hot-reloading via volume mounts.
- **Production**: Uses `docker-compose.prod.yml`. Run with `docker compose -f docker-compose.prod.yml up -d`. Builds optimized production image.
- **Dockerfile**: Utilizes multi-stage builds to create smaller, more secure production images. Includes stages for dependency installation, building, and the final runtime environment.
- **Database**: PostgreSQL 15 (Alpine image used in compose files).
- **Container Management**:
  - Volumes: Used in development for code (`.`), node_modules cache, Next.js cache. Used in production for persistent PostgreSQL data.
  - Network: Internal Docker network (`default` or custom) for container communication.

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
    "sonner": "^2.0.2",
    "zod": "^3.22.4",
    "snowgander": "^0.0.1" // AI vendor package
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

Required Environment Variables:

- **Development (`.env.local`)**:

  ```env
  # Database (for local Postgres or Dockerized Postgres)
  DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public" # Or postgres:5432 if using Docker compose network

  # Authentication
  NEXT_PUBLIC_SUPABASE_URL=https://projectid.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASEANONKEY}}

  # AI Services
  OPENAI_API_KEY="sk-..."
  ANTHROPIC_API_KEY="sk-..."
  GOOGLE_AI_API_KEY="..."

  # MCP Configuration (Optional, if using local MCP servers)
  MCP_CONFIG_PATH="/path/to/your/mcp/config.json"
  ```

- **Production (`.env.production` - DO NOT COMMIT, use secrets management)**:
  - Same variables as `.env.local`, but with production values.
  - `DATABASE_URL` should point to the production database (e.g., Fly Postgres URL).
- **Fly.io Deployment**:
  - Variables are set using `fly secrets set VAR_NAME=value`.
  - `DATABASE_URL` is typically automatically injected by Fly when attaching a Postgres cluster.
  - Other secrets (API keys, Supabase keys) must be set manually via `fly secrets set`.

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

#### 1. Standard (Non-Docker) Deployment

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

#### 2. Docker Deployment (Local/Self-Hosted)

1. Environment Setup:

   - Create `.env.production` file with production values (ensure `DATABASE_URL` points to the correct production DB).
   - Ensure Docker and Docker Compose are installed.

2. Build and Deploy:

   ```bash
   # Build and run containers in detached mode
   docker compose -f docker-compose.prod.yml up --build -d
   ```

3. Database Migration:
   ```bash
   # Execute migrations inside the running app container
   docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   ```

#### 3. Fly.io Deployment

1. Prerequisites:

   - Install `flyctl`: `curl -L https://fly.io/install.sh | sh`
   - Login: `flyctl auth login`
   - Create Fly app (if not already done): `flyctl launch` (Review and adjust `fly.toml` settings, especially memory/CPU, regions, and health checks). _Do not deploy the database via this command if you intend to use Fly Postgres._
   - Provision Fly Postgres (if needed): `flyctl postgres create`
   - Attach Postgres to the app: `flyctl postgres attach --app <your-app-name> <your-postgres-app-name>` (This usually sets the `DATABASE_URL` secret automatically).

2. Environment Setup (Secrets):

   - Set required secrets (Supabase keys, AI keys, etc.):
     ```bash
     flyctl secrets set NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... OPENAI_API_KEY=... ANTHROPIC_API_KEY=... GOOGLE_AI_API_KEY=...
     ```
   - Verify secrets: `flyctl secrets list`

3. Deployment:

   ```bash
   # Deploy the application using the Dockerfile and fly.toml configuration
   flyctl deploy
   ```

   _Note: Fly.io automatically builds the Docker image based on `Dockerfile`._

4. Database Migration (Post-Deployment):

   - Open a remote console to the deployed app instance:
     ```bash
     flyctl ssh console
     ```
   - Once inside the console, run the migration:
     ```bash
     # cd /app # Navigate to the app directory if needed
     npx prisma migrate deploy
     exit
     ```

5. Monitoring:

   - Check status: `flyctl status`
   - View logs: `flyctl logs`

   - Configure .env.local file
   - Ensure Docker and Docker Compose are installed
   - Set up container registry (if using)

6. Build and Deploy:

   ```bash
   docker compose -f docker-compose.yml up -d
   ```

7. Database Migration:
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
