# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

# VITE_API_BASE_URL is embedded at build time by Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the build output — no source code or node_modules
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", "--import", "./.output/server/instrument.server.mjs", ".output/server/index.mjs"]
