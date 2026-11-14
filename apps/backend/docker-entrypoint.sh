#!/bin/sh
set -e

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-9000}"

if [ -n "${POSTGRES_PASSWORD}" ]; then
  export DATABASE_URL="$(node -e "const u=encodeURIComponent(process.env.POSTGRES_USER||'tamadee');const p=encodeURIComponent(process.env.POSTGRES_PASSWORD);const h=process.env.POSTGRES_HOST||'postgres';const d=encodeURIComponent(process.env.POSTGRES_DB||'tamadee');process.stdout.write('postgres://'+u+':'+p+'@'+h+':5432/'+d);")"
fi

if [ "${MEDUSA_WORKER_MODE}" != "worker" ]; then
  echo "[Tamadee] Running database migrations..."
  pnpm exec medusa db:migrate --execute-safe-links --execute-safe-search

  if [ "${AUTO_SEED}" = "true" ]; then
    echo "[Tamadee] Running idempotent Tamadee seed..."
    pnpm exec medusa exec ./src/scripts/seed.js
  fi
fi

echo "[Tamadee] Starting Mercur server (mode=${MEDUSA_WORKER_MODE:-server}, host=${HOST}:${PORT})..."
exec pnpm start
