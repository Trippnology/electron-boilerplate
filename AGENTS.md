# AGENTS.md

Guidance for AI coding agents working in this repo.

## Architecture

Electron app, no frontend framework. Webpack + Babel compile `src/` → `app/`.

- `src/main.js` — Electron main process entry (`package.json` `main` points to compiled `app/main.js`).
- `src/app.js` — renderer entry, loaded by `app/app.html`.
- `src/` is source; `app/` holds static assets (committed) **plus** webpack output. Generated files `app/app.js`, `app/main.js`, `app/**/*.map` are git-ignored — never edit them, edit `src/` counterparts.
- `temp/` (test bundles) and `dist/` (packaged installers) are build outputs, git-ignored.

## Environment variables (unusual)

Not `process.env`. Config lives in plain JSON: `config/env_development.json`, `env_production.json`, `env_test.json`. Webpack aliases `env` to the right one based on `--env` flag, so code does:

```js
import env from 'env';
env.name; // 'development' | 'production' | 'test'
```

To add app config, edit the JSON files and import `env` — no dotenv, no env vars.

## Commands

- `npm start` — webpack watch + spawns Electron. Electron does **not** restart on rebuild; restart `npm start` to pick up main-process changes.
- `npm run unit` — unit tests. Specs: any `src/**/*.spec.js`. Runs electron-mocha; `preunit` webpack step runs automatically.
- `npm test` — builds unit bundle, builds app + e2e bundles, then runs **wdio** (`wdio run ./wdio.conf.js`). Specs come from `test/specs/`, `e2e/*.e2e.js`, and the unit bundle `temp/specs.js` (see `specs` array in `wdio.conf.js`). Runs against the local Electron binary via `wdio-electron-service` (`appEntryPoint: ./app/main.js`), not a packaged build.
- `npm run e2e` — vestigial: runs e2e bundle under plain mocha, where `browser` from `@wdio/globals` is undefined. Run e2e via `npm test` or `npm run pree2e && npm run wdio`.
- `npm run release` — full test suite, then production webpack + `electron-builder` → `dist/`.
- No lint or typecheck configured.

## Gotchas

- Native npm modules: after installing one, run `npm run postinstall` (`electron-builder install-app-deps`) to rebuild for Electron.
- Keep the `dependencies` vs `devDependencies` split strict: only `dependencies` ship in the packaged app.
- Renderer is built with webpack `target: electron-renderer`; main process uses `nodeIntegration: true`, `contextIsolation: false` — don't "fix" this without understanding the boilerplate's assumptions.
- Dev/test builds open DevTools automatically and dev userData is path-suffixed (`Electron Boilerplate (development)`) to avoid clobbering prod data.
