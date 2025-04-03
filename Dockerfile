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

# Copy root package.json
COPY package*.json ./

# Install ALL dependencies using npm install
RUN npm install

# ----------------------------------------
# Stage 2: Builder (for production build)
# ----------------------------------------
FROM base AS builder
WORKDIR /app

ARG DATABASE_URL_SECRET_ID="DATABASE_URL"
ARG NEXT_PUBLIC_SUPABASE_URL_SECRET_ID="NEXT_PUBLIC_SUPABASE_URL"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY_SECRET_ID="NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy package.json again (needed for npx prisma generate and npm run build)
COPY package*.json ./
# Copy the rest of the application source code
COPY . .

# Generate Prisma client needed for build
# Ensure DATABASE_URL is available during build *if* your build process needs it
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Build the Next.js application *here*
# This requires source code and full node_modules (incl. devDependencies)
RUN --mount=type=secret,id=${DATABASE_URL_SECRET_ID} \
    --mount=type=secret,id=${NEXT_PUBLIC_SUPABASE_URL_SECRET_ID} \
    --mount=type=secret,id=${NEXT_PUBLIC_SUPABASE_ANON_KEY_SECRET_ID} \
    # Add more --mount lines for each secret
    echo "Exporting build secrets..." && \
    # Read each secret file and export it as an environment variable
    export DATABASE_URL=$(cat /run/secrets/${DATABASE_URL_SECRET_ID}) && \
    export NEXT_PUBLIC_SUPABASE=$(cat /run/secrets/${NEXT_PUBLIC_SUPABASE_URL_SECRET_ID}) && \
    export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/${NEXT_PUBLIC_SUPABASE_ANON_KEY_SECRET_ID}) && \
    echo "Running npm run build..." && \
    npm run build && \
    # Build the MCP server
    echo "Building MCP server..." && \
    cd mcp_servers/mcp-time-js && \
    npm ci && \
    npm run build && \
    # Go back to the app root
    cd ../..

# If you are using the 'standalone' output mode in next.config.js,
# pruning is handled by Next.js during the build when creating .next/standalone.
# If not using standalone, you might uncomment the prune here, but standalone is recommended.
# RUN npm prune --production

# ----------------------------------------
# Stage 3: Production Runtime
# ----------------------------------------
# Start from a clean base image for the final stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user (good practice)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only the necessary artifacts from the 'builder' stage
# IMPORTANT: This assumes you have `output: 'standalone'` in your next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the built MCP server and its dependencies
COPY --from=builder --chown=nextjs:nodejs /app/mcp_servers/mcp-time-js/build ./mcp_servers/mcp-time-js/build
COPY --from=builder --chown=nextjs:nodejs /app/mcp_servers/mcp-time-js/node_modules ./mcp_servers/mcp-time-js/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/mcp_servers/mcp-time-js/package.json ./mcp_servers/mcp-time-js/package.json

USER nextjs

EXPOSE 3000

# Set NEXT_TELEMETRY_DISABLED to 1 to disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Run the application using the standalone output server
# The entrypoint is copied within .next/standalone
CMD ["node", "server.js"]

# ----------------------------------------
# Stage 4: Development Runtime
# ----------------------------------------
FROM base AS development
WORKDIR /app

# Install tools needed for development (like wait-for-it or netcat)
RUN apk add --no-cache netcat-openbsd

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy *all* dependencies (including dev) from the 'deps' stage
# Use 'deps' not 'builder' as 'deps' has the clean 'npm ci' state
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy application code and necessary config files
COPY --chown=nextjs:nodejs . .

# Ensure entrypoint script is executable
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
