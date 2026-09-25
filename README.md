# SHOU LXK

A SvelteKit course browser backed by Cloudflare D1. The home page lists course sections by the number of archived reviews for each section. Search by course name or code, and filter by teacher, college, course type, credits, attribute, or minimum review count. Results support sorting and pagination. Select a section card to read its reviews, with instructor names and review pagination. Review text is not searchable.

Cloudflare Workers Builds reads Node.js 26 from `.node-version`. In the Worker dashboard, set **Settings > Build > Build Variables and Secrets** → `PNPM_VERSION=12` so dependency installation uses pnpm 12. The `packageManager` field pins the project's pnpm release.

## Run locally

```sh
pnpm install
pnpm dev
```

Local development uses a local D1 database. See [SCHEMA.md](SCHEMA.md) for the schema, the archived snapshot import, and the migration. The Cloudflare database is `shou-lxk`, configured in `wrangler.jsonc`.

## Authentication

The header links to [Aaron212 IdP](https://idp.aaron212.com) for sign-in and registration. On an HTTPS `aaron212.com` subdomain, the IdP returns users to the page they came from. The IdP shares its session cookie across those subdomains, and this Worker checks it through the private `PlatformAuth` service binding. The binding targets the `aaron212-idp` Worker configured in the sibling IdP repo; both Workers must be deployed in the same Cloudflare account. Signed-in and signed-out visitors can browse the same courses and reviews.

The IdP does not accept localhost callback URLs, so the production sign-in and registration links do not return automatically to a local dev server. Local pages remain browsable without the IdP running.
