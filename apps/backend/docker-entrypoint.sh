#!/bin/sh
set -e

SEED_MARKER="/app/packages/api/.medusa/server/static/.tamadee_seeded_v1"

if [ "${MEDUSA_WORKER_MODE}" != "worker" ]; then
  echo "[Tamadee] Running database migrations..."
  pnpm predeploy

  if [ "${FORCE_SEED}" = "true" ] || { [ "${AUTO_SEED}" = "true" ] && [ ! -f "${SEED_MARKER}" ]; }; then
    echo "[Tamadee] Running idempotent Tamadee seed..."
    pnpm exec medusa exec ./src/scripts/seed.js
    mkdir -p "$(dirname "${SEED_MARKER}")"
    touch "${SEED_MARKER}"
  fi
fi

echo "[Tamadee] Starting Mercur server (mode=${MEDUSA_WORKER_MODE:-server})..."
exec pnpm start
