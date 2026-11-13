# syntax=docker/dockerfile:1
FROM debian:bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git unzip xz-utils \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch stable https://github.com/flutter/flutter.git /usr/local/flutter
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

WORKDIR /workspace

COPY packages/flutter_ui/pubspec.yaml ./packages/flutter_ui/pubspec.yaml
COPY apps/mobile/pubspec.yaml apps/mobile/pubspec.lock ./apps/mobile/

RUN cd apps/mobile && flutter pub get

COPY packages/flutter_ui ./packages/flutter_ui
COPY apps/mobile ./apps/mobile

ARG TAMADEE_API_BASE_URL=https://bwebtamdi.tamadee.online
ARG TAMADEE_PUBLISHABLE_KEY=""
ARG TAMADEE_SITE_URL=https://m.tamadee.online

WORKDIR /workspace/apps/mobile
RUN flutter build web --release \
    --dart-define=TAMADEE_API_BASE_URL=${TAMADEE_API_BASE_URL} \
    --dart-define=TAMADEE_PUBLISHABLE_KEY=${TAMADEE_PUBLISHABLE_KEY} \
    --dart-define=TAMADEE_SITE_URL=${TAMADEE_SITE_URL}

FROM nginx:1.27-alpine AS runner

COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/mobile/build/web /usr/share/nginx/html
COPY --from=builder /workspace/apps/mobile/web/.well-known /usr/share/nginx/html/.well-known

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
