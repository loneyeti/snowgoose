# Technical Context

## Technology Stack

### Core Technologies

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Form Management**: React Hook Form
- **Validation**: Zod

### Development Environment

- **Node.js**: Required for Next.js development
- **Package Manager**: npm
- **Development Mode**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm start`

## Dependencies

### Production Dependencies

From package.json:

- Next.js 14
- React & React DOM
- TypeScript
- Tailwind CSS
- Clerk for authentication
- React Hook Form
- Zod for validation

### Development Dependencies

- ESLint
- PostCSS
- TypeScript compiler
- Tailwind CSS processor

## Technical Constraints

### Backend Integration

- Connects to GPTFlask API
- Standardized API interface
- Provider-specific adaptations
- Error handling requirements

### Authentication

- Clerk-based authentication
- Protected routes
- User session management
- Role-based access control

### Performance Requirements

- Fast page loads
- Responsive UI
- Efficient API calls
- Optimized assets

### Browser Support

- Modern browsers
- Progressive enhancement
- Responsive design
- Mobile compatibility

## Development Setup

### Environment Variables

Required in env.local:

- Clerk authentication keys
- API endpoints
- Provider configurations

### Local Development

1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

### Build Process

1. TypeScript compilation
2. Asset optimization
3. Route generation
4. Environment validation

### Deployment

1. Environment configuration
2. Production build
3. Static optimization
4. Edge function deployment

## Security Considerations

### Authentication

- Clerk security best practices
- Protected API routes
- Session management
- CSRF protection

### Data Handling

- Secure API communication
- Input validation
- Output sanitization
- Error message security

### API Security

- Rate limiting
- Request validation
- Error handling
- Secure headers
