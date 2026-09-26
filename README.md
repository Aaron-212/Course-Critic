# SHOU LXK

A SvelteKit course browser backed by Cloudflare D1. The home page lists course sections by their stored review counts. Search by course name or code, and filter by teacher, college, course type, credits, attribute, or minimum review count. Results support sorting and pagination. Select a section card to read its reviews, with instructor names and review pagination. Teacher names link to profiles listing their course sections and separate teacher reviews. Sections can have multiple teachers. Review text is not searchable.

Cloudflare Workers Builds reads Node.js 26 from `.node-version`. In the Worker dashboard, set **Settings > Build > Build Variables and Secrets** → `PNPM_VERSION=12` so dependency installation uses pnpm 12. The `packageManager` field pins the project's pnpm release.

## Run locally

```sh
pnpm install
pnpm dev
```

Local development uses a local D1 database. See [SCHEMA.md](SCHEMA.md) for the schema, the archived snapshot import, and the migration. The Cloudflare database is `shou-lxk`, configured in `wrangler.jsonc`.

## Authentication

The header links to [Aaron212 IdP](https://idp.aaron212.com) for sign-in and registration. On an HTTPS `aaron212.com` subdomain, the IdP returns users to the page they came from. The IdP shares its session cookie across those subdomains. Browsing pages use the cookie's presence only to choose whether to show the account link and review form; a stale cookie may still show those controls. The Worker verifies the cookie through the private `PlatformAuth` service binding only when a visitor submits a review. The binding targets the `aaron212-idp` Worker configured in the sibling IdP repo; both Workers must be deployed in the same Cloudflare account. Everyone can browse courses and reviews. Signed-in visitors can submit reviews; each review shows only a title, body, and server-set submission date. Account details are not saved with reviews.

The IdP does not accept localhost callback URLs, so the production sign-in and registration links do not return automatically to a local dev server. Local pages remain browsable without the IdP running.

## Checks

```sh
pnpm test
pnpm check
pnpm lint
pnpm build
```

The database tests use Node.js 26's built-in SQLite to verify migration integrity, teacher search, review authentication and validation, pagination, and review-count triggers.
