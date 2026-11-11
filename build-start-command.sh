#!/bin/sh
# Rebuilds start-command.txt (the Railway start command of the Waline service) from railway-init.js.
set -e
cd "$(dirname "$0")"
B=$(gzip -9cn railway-init.js | base64 -w0)
printf "/bin/sh -c 'case \"\$TZ\" in \"\"|Asia/Shanghai) export TZ=UTC;; esac; export PG_PREFIX=\"\${PG_PREFIX:-wl_}\"; if [ -n \"\$SECURE_DOMAINS\" ] && [ -n \"\$RAILWAY_PUBLIC_DOMAIN\" ]; then export SECURE_DOMAINS=\"\$SECURE_DOMAINS,\$RAILWAY_PUBLIC_DOMAIN\"; fi; echo %s | base64 -d | gunzip > /app/railway-init.js && node /app/railway-init.js && exec node /app/vanilla.js \"\${PORT:-8360}\"'" "$B" > start-command.txt
