# roleplay-manager

A roleplay conversation manager with a Node/Express backend, an Astro+React
frontend, and shared TypeScript types. Built as a pnpm + turbo monorepo.

> **License:** [AGPL-3.0-or-later](./LICENSE) — free to use, modify, and
> redistribute. Any modifications you distribute (including over a network)
> must also be open source under the same license. See the [license
> section](#license) below for details.

## Quick start

### Requirements

- **Node.js** ≥ 22.12.0
- **pnpm** ≥ 11.15.1 (the install script will install it via corepack if
  missing)

### Install

**Linux / macOS:**

```bash
./scripts/install.sh
```

**Windows:**

```bat
scripts\install.bat
```

### Start the app

**Linux / macOS:**

```bash
./scripts/start.sh
```

**Windows:**

```bat
scripts\start.bat
```

The script opens <http://localhost:4321> in your browser. The backend
runs on <http://localhost:3001>. Press `Ctrl+C` to stop.

## Manual install (for developers)

If you'd rather install by hand:

```bash
# Install pnpm (if you don't have it)
corepack enable
corepack prepare pnpm@11.17.0 --activate

# Install dependencies
pnpm install

# Run all packages in dev mode
pnpm dev
```

Open <http://localhost:4321>.

## Project layout

This is a pnpm + turbo monorepo with four packages:

| Package | Purpose |
|---|---|
| `packages/backend`  | Express + Drizzle + SQLite. Hexagonal architecture. |
| `packages/frontend` | Astro + React + shadcn/ui. Talks to the backend via REST + SSE. |
| `packages/shared`   | Pure TypeScript types and framework-agnostic helpers. |
| `packages/ui`       | Reusable shadcn/ui components. |

See [AGENTS.md](./AGENTS.md) for the architecture rules, naming
conventions, and quality gates enforced by `pnpm check:arch`.

## Common scripts

| Script | What it does |
|---|---|
| `pnpm dev`         | Run all packages in dev mode (watch + HMR). |
| `pnpm build`       | Build all packages for production. |
| `pnpm check`       | Architecture check + typecheck + lint. |
| `pnpm check:arch`  | Just the architecture check. |
| `pnpm typecheck`   | Just the typecheck. |
| `pnpm lint`        | Just the lint. |
| `pnpm format`      | Run Prettier on the whole repo. |
| `pnpm --filter @workspace/backend test` | Run the backend test suite. |

## Configuring an AI provider

The app uses local AI models via [Ollama](https://ollama.com/) or any
OpenAI-compatible endpoint. After starting the app:

1. Go to **Settings → Proveedores** in the sidebar.
2. Pick a provider (Ollama or OpenAI-compatible).
3. Click **Probar conexión** to verify the connection.
4. Save the model you want to use as default.

## License

This project is licensed under the **GNU Affero General Public License v3.0
or later** (AGPL-3.0-or-later). See [LICENSE](./LICENSE) for the full text.

**What this means in practice:**

- ✅ You can use the app for free, for any purpose.
- ✅ You can read and modify the source code.
- ✅ You can redistribute the app or your modifications.
- ✅ You can contribute back to the project (see
  [CONTRIBUTING.md](./CONTRIBUTING.md)).
- ❌ You **cannot** take the code, modify it, and sell it as a
  closed-source product. Modified versions you distribute (including
  hosted/SAAS versions) must also be released under AGPL v3 with the
  source code available to your users.

If you have a use case that doesn't fit the AGPL, please open an issue
and we can discuss it.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for
how to set up the dev environment, run the tests, and submit a pull
request.

By contributing, you agree that your contributions will be licensed under
the AGPL v3 (or later).

## Reporting bugs and requesting features

Open an issue on this repository. Please include:

- A clear title and description.
- Steps to reproduce (for bugs).
- Expected vs. actual behavior.
- Your operating system and Node.js version (`node --version`).
- Relevant logs or screenshots.
