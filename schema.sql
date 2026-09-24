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
