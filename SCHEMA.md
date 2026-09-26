# SHOU LXK database schema

[`schema.sql`](schema.sql) defines the current SQLite and Cloudflare D1 schema. All tables are `STRICT`. Course IDs and section `lid` values are `TEXT` to preserve source codes and leading zeroes. `credits`, `likes`, and `dislikes` are `INTEGER`; the two counters default to zero and must be nonnegative.

| Table              | Grain                                      | Rows in the archived snapshot |
| ------------------ | ------------------------------------------ | ----------------------------: |
| `courses`          | One course code                            |                         1,910 |
| `course_section`   | One API `lid` (course and teacher listing) |                         3,287 |
| `reviews`          | One review with a stable integer ID      |                         5,631 |
| `category_options` | One selectable category value              |                            97 |

A section belongs to one course. Reviews refer directly to sections through `lid`; `id` is an automatically assigned integer primary key. Reviews default to newest first by `posted_at_local`, with `id` breaking timestamp ties; readers can switch to oldest first. `posted_at_local` stores the source's UTC+8 wall-clock text. The original comma-separated teacher string remains in `teacher_list_raw`. Empty and missing attributes remain distinct (`''` and `NULL`).

The home page lists `course_section` rows and joins `courses` for course names. It does not aggregate review totals. The old `hot_entries`, `review_fetches`, `comments_count`, and `hits` data is removed. Historical likes and dislikes are reset to zero during migration.

## Migration

[`migrations/0001_section_schema.sql`](migrations/0001_section_schema.sql) converts a database with the original `shou-coursecritic` schema. It copies sections and reviews into the new strict tables, recreates the review foreign key, then removes the old tables. Apply migrations in order against an existing database. [`0002_review_ids.sql`](migrations/0002_review_ids.sql) preserves all review content while replacing `position` with `id` and adding a section lookup index. Apply this migration before deploying the updated review page. For a new empty database, use `schema.sql` and import data in the new column layout.

The original archive importer and SQL snapshot are in the sibling `StructureAnalysis-shou-laixk` repository. That snapshot still uses the old schema. To use it locally, import the snapshot first and then apply the migration:

```sh
mise exec -- ./node_modules/.bin/wrangler d1 execute DB --local --file ../StructureAnalysis-shou-laixk/data/shou-coursecritic.sql
mise exec -- ./node_modules/.bin/wrangler d1 migrations apply DB --local
```

The Cloudflare database is `shou-lxk` in APAC, with binding `DB` and ID `8fd0140d-9e3e-435a-a42d-2e39574a7f84` in `wrangler.jsonc`. It was created from an export of `shou-coursecritic` and migrated with `0001_section_schema.sql`. The remote database contains 1,909 courses, 3,286 sections, 5,596 reviews, and 97 category options. The old database remains available as a rollback source.
