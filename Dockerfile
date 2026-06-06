# ── Stage 1: Install dependencies ─────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client (produces linux-musl binary for alpine)
RUN npx prisma generate
# DATABASE_URL is only needed so db.ts can be imported without throwing at build time
RUN DATABASE_URL=mysql://build:build@localhost/build npm run build
# Standalone output doesn't auto-include public/ or .next/static/ — copy them in
RUN cp -r public .next/standalone/public && \
    cp -r .next/static .next/standalone/.next/static

# ── Stage 3: Runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone Next.js server (includes .next/server, public, static)
COPY --from=builder /app/.next/standalone ./

# Full node_modules required at startup for:
#   - npx prisma db push  (prisma CLI)
#   - npm run db:seed     (uses tsx, which is a devDependency)
COPY --from=builder /app/node_modules ./node_modules

# Prisma schema + config (for db push), seed file, generated client + engine binary
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run db:seed && node server.js"]
