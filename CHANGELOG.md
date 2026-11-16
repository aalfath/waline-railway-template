# Changelog

Changes to the Waline Railway template. Deployers: read the entry before you apply an update from the Railway dashboard.

## Unreleased (2026-11-16)

- README: Deploy on Railway button linking to the published template (`waline`). No change to what gets deployed.

## 1.43.7 (2026-11-16)

- **Changed:** the template now builds from this repository instead of running the upstream image with an inline start command. Railway shows you an "update available" notice when this repo's `main` changes, so you decide when to apply new Waline versions. Existing deploys keep running as they are. Your Postgres data and admin account are unchanged.
- **Updated:** Waline server 1.43.6 → 1.43.7 (`lizheming/waline:1.43.7@sha256:b51dd56e…5c83`). Upstream changes: https://github.com/walinejs/waline/releases
- The first-start script (`railway-init.js`) is unchanged: it creates the tables if they are missing and the first administrator only when none exists.
- Removed `build-start-command.sh` and `start-command.txt`, which only produced the old inline start command.

## 1.43.6 (2026-11-11)

- First version: `lizheming/waline:1.43.6` with Railway Postgres, schema and first admin created at deploy.
