-- Apply to the existing shou-coursecritic schema. D1 executes migration files atomically.
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

INSERT INTO course_section (
    lid, course_id, teacher_name, college, elective_type, credits,
    attribute, likes, dislikes, teacher_list_raw
)
SELECT lid, course_id, teacher_name, college, elective_type, credits,
       attribute, 0, 0, teacher_list_raw
FROM course_instructors;

CREATE TABLE reviews_new (
    lid TEXT NOT NULL REFERENCES course_section(lid),
    position INTEGER NOT NULL CHECK (position >= 1),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL,
    PRIMARY KEY (lid, position)
) WITHOUT ROWID, STRICT;

INSERT INTO reviews_new (lid, position, title, content, posted_at_local)
SELECT lid, position, title, content, posted_at_local FROM reviews;

DROP TABLE reviews;
DROP TABLE review_fetches;
DROP TABLE hot_entries;
DROP TABLE course_instructors;

ALTER TABLE reviews_new RENAME TO reviews;
CREATE INDEX course_section_course_id_idx ON course_section(course_id);
CREATE INDEX course_section_teacher_name_idx ON course_section(teacher_name);
CREATE INDEX course_section_college_idx ON course_section(college);
CREATE INDEX reviews_posted_at_idx ON reviews(posted_at_local);
