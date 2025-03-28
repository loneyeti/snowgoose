# System Patterns

## Architecture Overview

### System Architecture (Next.js 14)

```mermaid
flowchart TD
    UI[UI Components] --> Actions[Server Actions]
    UI --> ClientUtils[Client Utilities]
    Actions --> Repositories[Repository Layer]
    Repositories --> Prisma[Prisma ORM]
    Prisma --> DB[(Postgres Database)]
    Actions --> AIFactory[AI Vendor Factory]
    AIFactory --> AIVendors[AI Vendors]
    Actions --> MCPManager[MCP Manager]

    subgraph Components
        Pages[Pages] --> UIComponents[UI Components]
        UIComponents --> Forms[Forms]
        UIComponents --> Display[Display Components]
    end

    subgraph AI Vendors
        AIVendors --> OpenAI[OpenAI Adapter]
        AIVendors --> Anthropic[Anthropic Adapter]
        AIVendors --> Google[Google AI Adapter]
    end

    subgraph Database
        Repositories --> BaseRepo[Base Repository]
        BaseRepo --> EntityRepos[Entity Repositories]
    end
```

## Key Design Patterns

### 1. Component Organization

- **\_ui/**: Reusable UI components
  - Form components with validation
  - Display components for responses
  - Settings management interfaces
  - Common UI utilities
- **\_lib/**: Shared utilities and business logic
  - **/db**: Database models and repositories
  - **/ai**: AI vendor implementations
  - **/mcp**: MCP server management
  - **/server_actions**: Server action business logic for interfacing with repositories
  - Form schemas and validation
- **mcp_servers/** Storage of MCP servers

### 2. Data Flow

- Repository pattern for database operations
  - Base repository with common operations
  - Entity-specific repositories
  - Transaction handling
  - Error standardization
- Server Actions for data mutations
  - Form handling
  - Data validation
  - Error handling
  - Response formatting
- Vendor adapter pattern for AI services
  - Common interface
  - Vendor-specific implementations
  - Factory pattern for instantiation
  - Response standardization

### 3. Feature Organization

- Feature-based directory structure
- Shared components in \_ui directory
- Provider-specific logic isolated in adapters
- Settings management separated by domain
- API routes aligned with features

### 4. State Management

- Form state handled by React Hook Form
- Server state managed through Server Actions
- UI state managed locally in components
- Authentication state via hosted Supabase
- Database state via Prisma

### 5. Error Handling

- **Server Action Pattern:**
  - `catch` blocks in Server Actions log the full error details server-side using `console.error(error)`.
  - A new, generic `Error("User-friendly message")` is then thrown to prevent leaking implementation details to the client boundary.
  - The `BaseRepository.handleError` method now simply re-throws the original error, allowing the Server Action layer to handle logging and user-facing message generation.
  - For actions using `useFormState` (like `updateUserPassword`), the `handleServerError` utility in `app/_lib/utils.ts` is used to return a structured `FormState` object containing either validation errors (`fieldErrors`) or a generic `error` message.
- Standardized error responses (primarily through generic thrown errors or `FormState`).
- Type-safe error handling (e.g., checking for `ZodError` in `handleServerError`).
- Recovery mechanisms (e.g., allowing chat to proceed if auxiliary data fetching fails).
- Transaction management (handled within repositories where applicable).

## Component Relationships

### Repository Pattern

```mermaid
flowchart TD
    BaseRepo[Base Repository] --> PrismaClient[Prisma Client]
    BaseRepo --> ErrorHandler[Error Handler]

    subgraph Repositories
        PersonaRepo[Persona Repository] --> BaseRepo
        ModelRepo[Model Repository] --> BaseRepo
        MCPToolRepo[MCP Tool Repository] --> BaseRepo
        OutputFormatRepo[Output Format Repository] --> BaseRepo
        HistoryRepo[History Repository] --> BaseRepo
    end

    subgraph Database
        PrismaClient --> Models[Database Models]
        Models --> Relationships[Model Relationships]
    end
```

### AI Vendor Integration

```mermaid
flowchart TD
    VendorFactory[Vendor Factory] --> Config[Vendor Config]
    VendorFactory --> Cache[Instance Cache]

    subgraph Adapters
        BaseAdapter[Base Adapter Interface] --> Common[Common Functionality]
        OpenAIAdapter[OpenAI Adapter] --> BaseAdapter
        AnthropicAdapter[Anthropic Adapter] --> BaseAdapter
        GoogleAdapter[Google AI Adapter] --> BaseAdapter
    end

    subgraph Features
        Common --> MessageHandling[Message Handling]
        Common --> ErrorHandling[Error Handling]
        Common --> ResponseFormat[Response Format]
        Common --> ThinkingMode[Thinking Mode]
    end
```

### MCP Integration

```mermaid
flowchart TD
    MCPManager[MCP Manager] --> Config[Configuration]
    MCPManager --> ProcessMgmt[Process Management]

    subgraph Tools
        ToolRepo[Tool Repository] --> CRUD[CRUD Operations]
        CRUD --> Validation[Validation]
        CRUD --> ErrorHandling[Error Handling]
    end

    subgraph Communication
        Protocol[Protocol Handler] --> Requests[Request Handler]
        Protocol --> Responses[Response Handler]
        Protocol --> Errors[Error Recovery]
    end
```

## Technical Patterns

### 1. Form Handling

- React Hook Form for state management
- Zod schemas for validation
- Server-side validation
- Error message standardization
- Field-level validation

### 2. Database Operations

- Repository pattern abstraction
- Prisma for type-safe queries
- Transaction management
- Error handling standardization
- Connection pooling

### 3. AI Integration

- Vendor adapter pattern
- Factory pattern for instantiation
- Response standardization
- Error handling middleware
- Message formatting

### 4. Authentication

- Supabase integration
- Protected routes
- Session management
- Role-based access
- User context

### 5. UI Patterns

- Component composition
- Progressive enhancement
- Responsive design
- Loading states
- Error boundaries
- Toast notifications (`sonner`)

### 6. MCP Integration

- Tool management
- Process lifecycle
- Environment handling
- Error recovery
- Communication protocol
