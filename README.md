# Waline on Railway

Start command and first-start script for the Railway template that runs [Waline](https://github.com/walinejs/waline) with Postgres.

The template uses the official image `lizheming/waline:1.43.6` (pinned by digest) and Railway's Postgres. Railway templates can't build from this repo, so the script is inlined into the service's start command as a gzip+base64 blob. This repo is the readable copy.

## What the start command does

1. Sets `TZ=UTC` unless you set another time zone (the image defaults to `Asia/Shanghai`).
2. If `SECURE_DOMAINS` is set, adds the service's own Railway domain to it so the admin UI at `/ui` keeps working.
3. Runs [`railway-init.js`](railway-init.js), which:
   - waits for Postgres, then creates Waline's tables (`wl_comment`, `wl_counter`, `wl_users`) if they don't exist, matching upstream [`assets/waline.pgsql`](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql);
   - if no administrator exists yet, creates one from `WALINE_ADMIN_EMAIL` and `WALINE_ADMIN_PASSWORD` (hashed with phpass, as Waline does). Without this step, whoever registered first on a fresh deploy would become the admin. Once an admin exists, the script never touches accounts again.
4. Starts Waline on Railway's `PORT`: `node /app/vanilla.js $PORT`.

## Rebuilding the start command

Edit `railway-init.js`, then run `./build-start-command.sh`. It writes `start-command.txt`, which you paste into the service's start command.
