# Waline server for the Railway template (https://railway.com/deploy/waline).
# Official image, pinned by version and digest. To update, bump both and add a CHANGELOG entry.
FROM lizheming/waline:1.43.7@sha256:b51dd56e3ddeda17e676a9278dc3bea044a79a3f5ca21d03d3abf392fdac5c83

# The upstream image defaults to Asia/Shanghai; set TZ on the service to change it.
ENV TZ=UTC

COPY railway-init.js /app/railway-init.js
COPY start.sh /app/railway-start.sh

CMD ["sh", "/app/railway-start.sh"]
