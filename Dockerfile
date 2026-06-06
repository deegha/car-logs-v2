# ==========================================
# Stage 1: Base image with shared package managers
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine 
# to understand why libc6-compat might be needed for Next.js/Prisma.
RUN apk add --no-cache libc6-compat

# ==========================================
# Stage 2: Install dependencies
# ==========================================
FROM base AS deps
COPY package*.json ./
# 1. We skip husky/git hooks during Docker builds
# 2. We use a cache mount so npm doesn't redownload packages if package.json hasn't changed
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ==========================================
# Stage 3: Build the application
# ==========================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL=mysql://build:build@localhost/build npm run build

# ==========================================
# Stage 4: Production Runner (Ultra-lightweight)
# ==========================================
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what is strictly necessary to run the app
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Next.js automatically leverages output tracing to reduce image size
# Note: To use standalone output, ensure `output: 'standalone'` is in your next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Exec form CMD to handle lifecycle signals properly
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run db:seed && node server.js"]