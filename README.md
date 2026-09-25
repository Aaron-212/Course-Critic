# Course Critic

A SvelteKit course browser backed by the existing Cloudflare D1 database `shou-coursecritic`. The home page shows ranked courses from `hot_entries` until a search or filter is applied. Search by course name or code, and filter by teacher, college, course type, credits, attribute, or minimum review count. Results support sorting and pagination. Select a course card to read its reviews, with instructor names and review pagination. Review text is not searchable.

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
