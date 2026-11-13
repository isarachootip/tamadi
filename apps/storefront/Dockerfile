# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN npm install -g pnpm@12.3.4

FROM base AS builder
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/storefront/package.json ./apps/storefront/package.json

RUN pnpm install --frozen-lockfile

COPY packages/ui ./packages/ui
COPY apps/storefront ./apps/storefront

ENV NODE_ENV=production
ENV STANDALONE_BUILD=true

RUN pnpm --filter @tamadee/storefront build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

COPY --from=builder /workspace/apps/storefront/.next/standalone ./
COPY --from=builder /workspace/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder /workspace/apps/storefront/public ./apps/storefront/public

EXPOSE 3000
CMD ["node", "apps/storefront/server.js"]
