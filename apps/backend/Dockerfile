# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN npm install -g pnpm@12.3.4

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json tsconfig.base.json tsconfig.json ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/vendor/package.json ./apps/vendor/package.json
COPY packages/api/package.json packages/api/.npmrc ./packages/api/

RUN pnpm install --frozen-lockfile

# Build admin and vendor dashboards sequentially in their own cached layer so
# API-only edits skip the ~2.5m Vite rebuilds and halve peak build RAM.
COPY packages/api/medusa-config.ts ./packages/api/medusa-config.ts
COPY packages/api/src/config ./packages/api/src/config
COPY packages/api/.mercur ./packages/api/.mercur
COPY apps/admin ./apps/admin
COPY apps/vendor ./apps/vendor

ARG MERCUR_BACKEND_URL=https://bwebtamdi.tamadee.online
ENV MERCUR_BACKEND_URL=${MERCUR_BACKEND_URL}
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN pnpm --filter @acme/admin build && pnpm --filter @acme/vendor build

COPY packages/api ./packages/api

RUN pnpm --filter @acme/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/api ./packages/api
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && ln -s /app/node_modules /app/packages/api/.medusa/server/node_modules

WORKDIR /app/packages/api/.medusa/server
EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
