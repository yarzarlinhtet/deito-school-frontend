# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

# ── Stage 2: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Production deps only — @sentry/tanstackstart-react is resolved at runtime by instrument.server.mjs
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Sentry preload (loaded via NODE_OPTIONS before the server starts)
COPY --from=builder /app/instrument.server.mjs ./

# Custom server + built app
COPY --from=builder /app/server.mjs ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Preloads Sentry instrumentation into every Node.js process in this container
ENV NODE_OPTIONS="--import ./instrument.server.mjs"

CMD ["node", "server.mjs"]
