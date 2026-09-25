PRAGMA foreign_keys = ON;

CREATE TABLE courses (
    course_id TEXT PRIMARY KEY,
    name TEXT NOT NULL
) STRICT;

CREATE TABLE course_section (
    lid TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(course_id),
    teacher_name TEXT NOT NULL,
    college TEXT NOT NULL,
    elective_type TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits >= 0),
    attribute TEXT,
    likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
    dislikes INTEGER NOT NULL DEFAULT 0 CHECK (dislikes >= 0),
    teacher_list_raw TEXT NOT NULL
) STRICT;

CREATE INDEX course_section_course_id_idx ON course_section(course_id);
CREATE INDEX course_section_teacher_name_idx ON course_section(teacher_name);
CREATE INDEX course_section_college_idx ON course_section(college);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    lid TEXT NOT NULL REFERENCES course_section(lid),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL
) STRICT;

CREATE INDEX reviews_lid_idx ON reviews(lid);
CREATE INDEX reviews_posted_at_idx ON reviews(posted_at_local);

CREATE TABLE category_options (
    category_type TEXT NOT NULL CHECK (category_type IN ('attr', 'college', 'lessonType', 'score')),
    position INTEGER NOT NULL CHECK (position >= 1),
    value TEXT NOT NULL,
    PRIMARY KEY (category_type, position),
    UNIQUE (category_type, value)
) WITHOUT ROWID, STRICT;
