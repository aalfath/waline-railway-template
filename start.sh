#!/bin/sh
# Start script for Waline on Railway.
# 1. Creates the Postgres schema and the first administrator (railway-init.js).
# 2. Starts the Waline server on Railway's PORT.
set -e

export PG_PREFIX="${PG_PREFIX:-wl_}"

# If you lock Waline to your blog with SECURE_DOMAINS, keep the Waline domain
# itself allowed, so the admin dashboard at /ui still works.
if [ -n "$SECURE_DOMAINS" ] && [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
  export SECURE_DOMAINS="$SECURE_DOMAINS,$RAILWAY_PUBLIC_DOMAIN"
fi

node /app/railway-init.js
exec node /app/vanilla.js "${PORT:-8360}"
