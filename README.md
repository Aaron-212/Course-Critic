# Course Critic

A basic SvelteKit course browser backed by the existing Cloudflare D1 database `shou-coursecritic`. The page reads `courses` from the schema in the neighboring `StructureAnalysis-shou-laixk` repository and supports name or code search and pagination.

Cloudflare Workers Builds reads Node.js 26 from `.node-version`. In the Worker dashboard, set **Settings > Build > Build Variables and Secrets** → `PNPM_VERSION=12` so dependency installation uses pnpm 12. The `packageManager` field pins the project's pnpm release.

## Run locally

```sh
pnpm install
pnpm dev
```

Local development uses a local D1 database. To populate it with the referenced snapshot, run from this directory:

```sh
pnpm wrangler d1 execute shou-coursecritic --local --file ../StructureAnalysis-shou-laixk/data/shou-coursecritic.sql
```

To query the existing remote database during local development, set `remote: true` on the D1 binding in `wrangler.jsonc` temporarily. Deploy with `pnpm deploy` after verifying Cloudflare credentials; the production binding points to the database ID documented in `StructureAnalysis-shou-laixk/wrangler.jsonc`.
