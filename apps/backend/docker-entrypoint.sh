#!/bin/sh
set -e

if [ "${MEDUSA_WORKER_MODE}" != "worker" ]; then
  echo "[Tamadee] Running database migrations..."
  pnpm predeploy

  if [ "${AUTO_SEED}" = "true" ]; then
    echo "[Tamadee] Running idempotent Tamadee seed..."
    pnpm exec medusa exec ./src/scripts/seed.js
  fi
fi

echo "[Tamadee] Starting Mercur server (mode=${MEDUSA_WORKER_MODE:-server})..."
exec pnpm start
