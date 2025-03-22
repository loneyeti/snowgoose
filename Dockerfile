FROM node:18-alpine AS base

WORKDIR /app

# Install netcat for database connection checking
FROM base AS deps
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (no need for database connection)
RUN npx prisma generate

# Development image
FROM base AS development
WORKDIR /app

RUN apk add --no-cache netcat-openbsd

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Create and set permissions for necessary directories
RUN mkdir -p /app/.next/cache \
    && chown -R nextjs:nodejs /app \
    && chmod -R 755 /app

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]