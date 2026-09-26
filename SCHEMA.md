# SHOU LXK database schema

[`schema.sql`](schema.sql) defines the current SQLite and Cloudflare D1 schema. All tables are `STRICT`. Course IDs and section `lid` values are `TEXT` to preserve source codes and leading zeroes. `credits`, `likes`, and `dislikes` are `INTEGER`; the two counters default to zero and must be nonnegative.

| Table                     | Grain                                       | Rows after migrating the archived snapshot |
| ------------------------- | ------------------------------------------- | -----------------------------------------: |
| `courses`                 | One course code                             |                                      1,910 |
| `course_section`          | One API section `lid`                       |                                      3,287 |
| `teachers`                | One distinct normalized teacher name        |                                        971 |
| `course_section_teachers` | One teacher assigned to a section           |                                      4,407 |
| `course_reviews`          | One course review with a stable integer ID  |                                      5,631 |
| `teacher_reviews`         | One teacher review with a stable integer ID |                                          0 |
| `category_options`        | One selectable category value               |                                         97 |

A section belongs to one course. Course reviews refer directly to sections through `lid`; `id` is an automatically assigned integer primary key. Reviews default to newest first by `posted_at_local`, with `id` breaking timestamp ties; readers can switch to oldest first. `posted_at_local` stores the source's UTC+8 wall-clock text. Teachers live in `teachers` with integer IDs and unique names. `course_section_teachers` links sections to one or more teachers, preserving their display order with `position`. `teacher_reviews` references `teachers.id`; these reviews never contribute to course-section review counts. The old `teacher_name` and `teacher_list_raw` columns are removed. Empty and missing attributes remain distinct (`''` and `NULL`).

The home page lists `course_section` rows and joins `courses` for course names. `course_section.review_count` stores review totals for ranking, filtering, and display; triggers keep it in sync with review inserts, deletes, and section moves. The old `hot_entries`, `review_fetches`, `comments_count`, and `hits` data is removed. Historical likes and dislikes are reset to zero during migration.

Teacher identity is based on the exact normalized name because the source has no reliable teacher ID. Suffixes such as `(1804)` are preserved; identical names share a profile. The migration splits whitespace, commas, Chinese commas, enumeration commas, and semicolons, and deduplicates repeated names within a section. The `teacher_list_raw` values contain course-wide `name|section-id` options, so they must not be interpreted as co-teachers or teacher IDs.

## Migration

[`migrations/0001_section_schema.sql`](migrations/0001_section_schema.sql) converts a database with the original `shou-coursecritic` schema. It copies sections and reviews into the new strict tables, recreates the review foreign key, then removes the old tables. Apply migrations in order against an existing database. [`0002_review_ids.sql`](migrations/0002_review_ids.sql) preserves all review content while replacing `position` with `id` and adding a section lookup index. [`0003_section_review_count.sql`](migrations/0003_section_review_count.sql) backfills stored review counts and installs maintenance triggers. Apply it before deploying the listing code that reads `review_count`. [`0004_teachers_and_reviews.sql`](migrations/0004_teachers_and_reviews.sql) creates and backfills teachers and section membership, renames `reviews` to `course_reviews` without changing IDs or content, recreates its counter triggers, and adds `teacher_reviews`. Apply it before running the updated application. For a new empty database, use `schema.sql` and import data in the new column layout.

The original archive importer and SQL snapshot are in the sibling `StructureAnalysis-shou-laixk` repository. That snapshot still uses the old schema. To use it locally, import the snapshot first and then apply the migration:

```sh
mise exec -- ./node_modules/.bin/wrangler d1 execute DB --local --file ../StructureAnalysis-shou-laixk/data/shou-coursecritic.sql
mise exec -- ./node_modules/.bin/wrangler d1 migrations apply DB --local
```

The Cloudflare database is `shou-lxk` in APAC, with binding `DB` and ID `8fd0140d-9e3e-435a-a42d-2e39574a7f84` in `wrangler.jsonc`. It was created from an export of `shou-coursecritic` and migrated with `0001_section_schema.sql`. The previously recorded remote snapshot contains 1,909 courses, 3,286 sections, 5,596 reviews, and 97 category options. The old database remains available as a rollback source.

The local archived snapshot migrated with `0004` contains 971 teachers and 4,407 section-teacher links, including 669 sections with multiple teachers. All 5,631 course reviews are retained. These counts describe the local archive, not a fresh audit of production.

Deploy the migration and application together during a maintenance window: the old application queries `reviews` and `teacher_name`, while the new application requires the new tables. Back up the remote database before applying migrations. This change has been applied locally; production migration and deployment are separate steps.
