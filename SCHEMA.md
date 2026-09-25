# Course Critic SQLite schema

The canonical import source is `archive/normalized/`. Run `python3 import_archive.py` to regenerate `data/shou-coursecritic.sqlite` and the matching D1 import file `data/shou-coursecritic.sql` from `schema.sql` and the archive. The database and SQL dump represent the same snapshot.

## Data model

| Table                | Grain                                           | Source          |
| -------------------- | ----------------------------------------------- | --------------- |
| `courses`            | One distinct course code                        | `courses.json`  |
| `course_instructors` | One API `lid` (course and teacher listing)      | `courses.json`  |
| `review_fetches`     | One response per `lid`                          | `reviews.jsonl` |
| `reviews`            | One review in its original response order       | `reviews.jsonl` |
| `hot_entries`        | One ranked row, including repeated course codes | `hot.json`      |
| `category_options`   | One selectable category value in source order   | `category.json` |

Course IDs and `lid` values are `TEXT` because source course codes include letters and leading-zero preservation matters. A `lid` identifies a course–teacher listing, not a globally unique teacher. The archive has one name per course ID, but college, elective type, credits, attributes, and counters can differ among listings of the same course; those fields therefore belong to `course_instructors`. The original comma-separated teacher string is retained as `teacher_list_raw` for fidelity. The hot list keeps its own observed fields and rank because the same course code can occur more than once.

`reviews.position` preserves response order because the source supplies no review ID. `posted_at_local` is the source's UTC+8 wall-clock text; `fetched_at` is an ISO timestamp with offset. They are intentionally distinct. The reported `comments_count` is retained even when it differs from the number of archived reviews. Source `Dislike` values can be negative, so those columns have no nonnegative check. Empty and missing attributes remain distinct (`''` and `NULL`).

The raw HTTP responses and crawl manifests remain in `archive/` as provenance. The normalized files are the deduplicated application data used by this schema.

The Cloudflare D1 database is `shou-coursecritic` (binding `DB`) in APAC. Its ID is recorded in `wrangler.jsonc`. To load a fresh empty database from this snapshot, run `wrangler d1 execute shou-coursecritic --remote --file data/shou-coursecritic.sql --yes`. The SQL dump omits explicit transaction statements because D1 performs the file import atomically.

## Validation for this snapshot

| Table                |  Rows |
| -------------------- | ----: |
| `courses`            | 1,910 |
| `course_instructors` | 3,287 |
| `review_fetches`     | 3,287 |
| `reviews`            | 5,631 |
| `hot_entries`        |    60 |
| `category_options`   |    97 |

The importer checks these counts, review response lengths, course-name consistency, and foreign keys. SQLite `PRAGMA integrity_check` returns `ok` after import.

## SQL

The executable source of truth is [schema.sql](schema.sql). Its contents are reproduced below for review.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE courses (
    course_id TEXT PRIMARY KEY,
    name TEXT NOT NULL
) STRICT;

CREATE TABLE course_instructors (
    lid TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(course_id),
    teacher_name TEXT NOT NULL,
    college TEXT NOT NULL,
    elective_type TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits >= 0),
    attribute TEXT,
    comments_count INTEGER NOT NULL CHECK (comments_count >= 0),
    likes INTEGER NOT NULL CHECK (likes >= 0),
    dislikes INTEGER NOT NULL,
    hits INTEGER NOT NULL CHECK (hits >= 0),
    teacher_list_raw TEXT NOT NULL
) STRICT;

CREATE INDEX course_instructors_course_id_idx ON course_instructors(course_id);
CREATE INDEX course_instructors_teacher_name_idx ON course_instructors(teacher_name);
CREATE INDEX course_instructors_college_idx ON course_instructors(college);

CREATE TABLE review_fetches (
    lid TEXT PRIMARY KEY REFERENCES course_instructors(lid),
    sheet TEXT NOT NULL,
    class_id TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    comments_count INTEGER NOT NULL CHECK (comments_count >= 0),
    likes INTEGER NOT NULL CHECK (likes >= 0),
    dislikes INTEGER NOT NULL,
    hits INTEGER NOT NULL CHECK (hits >= 0)
) STRICT;

CREATE TABLE reviews (
    lid TEXT NOT NULL REFERENCES review_fetches(lid),
    position INTEGER NOT NULL CHECK (position >= 1),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL,
    PRIMARY KEY (lid, position)
) WITHOUT ROWID, STRICT;

CREATE INDEX reviews_posted_at_idx ON reviews(posted_at_local);

CREATE TABLE hot_entries (
    rank INTEGER PRIMARY KEY CHECK (rank >= 1),
    course_id TEXT NOT NULL REFERENCES courses(course_id),
    college TEXT NOT NULL,
    elective_type TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits >= 0),
    attribute TEXT,
    comments_count INTEGER NOT NULL CHECK (comments_count >= 0),
    likes INTEGER NOT NULL CHECK (likes >= 0),
    dislikes INTEGER NOT NULL,
    hits INTEGER NOT NULL CHECK (hits >= 0),
    teacher_list_raw TEXT NOT NULL
) STRICT;

CREATE INDEX hot_entries_course_id_idx ON hot_entries(course_id);

CREATE TABLE category_options (
    category_type TEXT NOT NULL CHECK (category_type IN ('attr', 'college', 'lessonType', 'score')),
    position INTEGER NOT NULL CHECK (position >= 1),
    value TEXT NOT NULL,
    PRIMARY KEY (category_type, position),
    UNIQUE (category_type, value)
) WITHOUT ROWID, STRICT;
```
