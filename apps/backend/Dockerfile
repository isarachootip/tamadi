# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN npm install -g pnpm@12.3.4

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/vendor/package.json ./apps/vendor/package.json
COPY packages/api/package.json ./packages/api/package.json

RUN pnpm install --frozen-lockfile

COPY . .

ARG MERCUR_BACKEND_URL=https://bwebtamdi.tamadee.online
ENV MERCUR_BACKEND_URL=${MERCUR_BACKEND_URL}
ENV NODE_ENV=production

RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/api ./packages/api

WORKDIR /app/packages/api/.medusa/server
EXPOSE 9000

CMD ["pnpm", "start"]
