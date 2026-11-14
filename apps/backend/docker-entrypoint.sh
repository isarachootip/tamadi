#!/bin/sh
set -e

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-9000}"

# Build DATABASE_URL from parts so special characters in the password are URL-encoded.
# sslmode=disable: Postgres runs on the private Docker network without TLS, but Medusa
# enables SSL for every non-localhost host in production, which hangs the connection.
if [ -n "${POSTGRES_PASSWORD}" ]; then
  export DATABASE_URL="$(node -e "const e=process.env,c=encodeURIComponent;process.stdout.write('postgres://'+c(e.POSTGRES_USER||'tamadee')+':'+c(e.POSTGRES_PASSWORD)+'@'+(e.POSTGRES_HOST||'postgres')+':5432/'+c(e.POSTGRES_DB||'tamadee')+'?sslmode=disable');")"
fi

# Call the Medusa CLI directly: running it through pnpm triggers a dependency
# verification/install against the npm registry on every container start.
MEDUSA="./node_modules/.bin/medusa"

if [ "${MEDUSA_WORKER_MODE}" != "worker" ]; then
  echo "[Tamadee] Running database migrations..."
  "$MEDUSA" db:migrate --execute-safe-links --execute-safe-search

  if [ "${AUTO_SEED}" = "true" ]; then
    echo "[Tamadee] Running idempotent Tamadee seed..."
    "$MEDUSA" exec ./src/scripts/seed.js
  fi
fi

echo "[Tamadee] Starting Mercur server (mode=${MEDUSA_WORKER_MODE:-server}, host=${HOST}:${PORT})..."
exec "$MEDUSA" start
