# Base image with Node.js
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat # Required for Prisma on Alpine

# ----------------------------------------
# Stage 1: Install dependencies (shared)
# ----------------------------------------
FROM base AS deps
# Install OS-level dependencies needed for npm install or Prisma (if any)
# RUN apk add --no-cache ...

# Copy package files
COPY package*.json ./
# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# ----------------------------------------
# Stage 2: Builder (for production build)
# ----------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client needed for build
# Ensure DATABASE_URL is available during build *if* your build process needs it
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ----------------------------------------
# Stage 3: Production Runtime
# ----------------------------------------
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user (good practice)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
USER nextjs

# Copy built artifacts and production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# Copy Prisma schema if needed by runtime (usually not after generate)
# COPY --chown=nextjs:nodejs prisma ./prisma

EXPOSE 3000

# Set NEXT_TELEMETRY_DISABLED to 1 to disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

# Run the application using the standalone output
# NO entrypoint script needed for basic prod start
CMD ["node", "server.js"]

# ----------------------------------------
# Stage 4: Development Runtime
# ----------------------------------------
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