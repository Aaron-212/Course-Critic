# Course Critic

A SvelteKit course browser backed by Cloudflare D1. The home page lists courses by the number of archived reviews. Search by course name or code, and filter by teacher, college, course type, credits, attribute, or minimum review count. Results support sorting and pagination. Select a course card to read its reviews, with instructor names and review pagination. Review text is not searchable.

Cloudflare Workers Builds reads Node.js 26 from `.node-version`. In the Worker dashboard, set **Settings > Build > Build Variables and Secrets** → `PNPM_VERSION=12` so dependency installation uses pnpm 12. The `packageManager` field pins the project's pnpm release.

## Run locally

```sh
pnpm install
pnpm dev
```

Local development uses a local D1 database. See [SCHEMA.md](SCHEMA.md) for the schema, the archived snapshot import, and the migration. The Cloudflare database is `shou-lxk`, configured in `wrangler.jsonc`.
