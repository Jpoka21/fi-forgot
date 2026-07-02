# F.I. Forgot — Frontend (`@workspace/fi-forgot`)

Vite + React frontend for the F.I. Forgot web app.

## Required environment variables

Both are **mandatory** for `dev`, `build`, and `serve` (enforced in `vite.config.ts`):

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `25460` | Vite dev/preview server port |
| `BASE_PATH` | `/` | Vite `base` URL path |

Copy `.env.example` values into your shell or Replit secrets as needed. Vite reads these from `process.env` at config load time (not `VITE_*` client vars).

Runtime (Vite-provided): `import.meta.env.BASE_URL`, `import.meta.env.DEV`.

## Replit development workflow (canonical)

From repository root `Forgot-Identifier/`:

```bash
pnpm install
pnpm --filter @workspace/fi-forgot run dev
```

Replit artifact config (`.replit-artifact/artifact.toml`) sets `PORT=25460` and `BASE_PATH=/` for the web service. The API server runs as a separate artifact on `/api`.

### Verification commands

```bash
pnpm --filter @workspace/fi-forgot run typecheck
pnpm --filter @workspace/fi-forgot run lint
PORT=25460 BASE_PATH=/ pnpm --filter @workspace/fi-forgot run build
```

### Production build

```bash
PORT=25460 BASE_PATH=/ pnpm --filter @workspace/fi-forgot run build
```

Output: `artifacts/fi-forgot/dist/public/`

## Local Windows limitations

- Root `pnpm install` may fail: `preinstall` script requires `sh` (use Git Bash, WSL, or `pnpm install --ignore-scripts`).
- `@rollup/rollup-win32-x64-msvc` may be missing after `--ignore-scripts`, blocking local `build`.
- **Use Replit/Linux for production build verification** when Windows native deps are absent.

PowerShell env for local commands:

```powershell
$env:PORT = "25460"
$env:BASE_PATH = "/"
npm exec --yes pnpm@10 -- --filter @workspace/fi-forgot run typecheck
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Vite dev server |
| `build` | Production build (requires `PORT`, `BASE_PATH`) |
| `serve` | Preview production build |
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint (`src/`, excludes `_legacy`) |
| `lint:fix` | ESLint with auto-fix |
| `format` | Prettier write |
| `format:check` | Prettier check |

## API

The app calls relative `/api/*` endpoints (Replit routes to `api-server`). Auth uses `x-user-id` headers via `getApiHeaders()` in `src/lib/data.ts`.

## Legacy code

Orphan pages/components quarantined under `src/_legacy/` (excluded from ESLint/Prettier). Not routed in `App.tsx`.
