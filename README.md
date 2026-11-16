[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/waline?utm_medium=integration&utm_source=button&utm_campaign=waline)

# Waline on Railway

[Waline](https://waline.js.org) comment server with Postgres, packaged as a one-click [Railway template](https://railway.com/deploy/waline).

This repo is what the template's **Waline** service builds: the official image `lizheming/waline:1.43.7` (pinned by digest in the [`Dockerfile`](Dockerfile)), plus a small start script. The **Postgres** service is Railway's own Postgres with a volume.

## What happens on start

[`start.sh`](start.sh) runs on every deploy:

1. Runs [`railway-init.js`](railway-init.js), which waits for Postgres and then:
   - creates Waline's tables (`wl_comment`, `wl_counter`, `wl_users`) if they don't exist, matching upstream [`assets/waline.pgsql`](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql);
   - if there's no administrator yet, creates one from `WALINE_ADMIN_EMAIL` and `WALINE_ADMIN_PASSWORD` (hashed with phpass, as Waline does). Without this, whoever registered first on a fresh deploy would become the admin. Once an admin exists, the script never changes accounts again.
2. If `SECURE_DOMAINS` is set, adds the service's own Railway domain to it, so the admin dashboard at `/ui` keeps working.
3. Starts Waline on Railway's `PORT` (`8080` in the template).

The time zone is UTC (the upstream image defaults to Asia/Shanghai). Set `TZ` on the service to change it.

## Variables (Waline service)

| Variable | Default | Notes |
|---|---|---|
| `WALINE_ADMIN_EMAIL` | (you enter it) | E-mail of the first administrator |
| `WALINE_ADMIN_PASSWORD` | generated | Sign in at `/ui` with it, then change it in the dashboard |
| `JWT_TOKEN` | generated | Signs login tokens |
| `SERVER_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | Public URL of this server |
| `PG_HOST`, `PG_PORT`, `PG_DB`, `PG_USER`, `PG_PASSWORD` | references to the Postgres service | Database connection |
| `PORT` | `8080` | Port Waline listens on |
| `SECURE_DOMAINS` | empty (optional) | Your blog's domain(s), comma-separated, to stop other sites using your server |

Other Waline settings (`SMTP_*`, `AUTHOR_EMAIL`, `SITE_NAME`, `SITE_URL`, `COMMENT_AUDIT`, …) work as in the [Waline docs](https://waline.js.org/en/reference/server/env.html): add them to the Waline service.

## Updates

Changes reach deployers through this repo's `main` branch: Railway shows an "update available" notice on each deployed Waline service, and you choose when to apply it. Each update is listed in [`CHANGELOG.md`](CHANGELOG.md). Waline keeps its data in Postgres, so updating the server doesn't touch your comments.
