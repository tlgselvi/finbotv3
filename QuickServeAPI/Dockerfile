# FinBot v3 - Multi-stage Docker Build
# Production-ready, optimized Node.js image

# ================================
# Stage 1: Base Dependencies
# ================================
FROM node:20.19-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# ================================
# Stage 2: Development Dependencies
# ================================
FROM base AS deps

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# ================================
# Stage 3: Builder
# ================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# ================================
# Stage 4: Production Dependencies
# ================================
FROM base AS prod-deps

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# ================================
# Stage 5: Production Runner
# ================================
FROM node:20.19-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Copy migrations and shared files
COPY --from=builder --chown=nodejs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server/index.js"]

