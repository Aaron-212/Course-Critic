CREATE TABLE teachers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0)
) STRICT;

CREATE TABLE course_section_teachers (
    lid TEXT NOT NULL REFERENCES course_section(lid),
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    position INTEGER NOT NULL CHECK (position >= 1),
    PRIMARY KEY (lid, teacher_id),
    UNIQUE (lid, position)
) WITHOUT ROWID, STRICT;

CREATE INDEX course_section_teachers_teacher_idx ON course_section_teachers(teacher_id, lid);

-- teacher_list_raw contains course-wide section options, not teacher IDs.
-- Split only the current section's teacher_name; retain disambiguating suffixes.
CREATE TABLE teacher_names_migration (
    lid TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL
) STRICT;

INSERT INTO teacher_names_migration (lid, name, position)
WITH RECURSIVE names(lid, rest, name, position) AS (
    SELECT lid,
           trim(replace(replace(replace(replace(replace(replace(replace(replace(replace(
               teacher_name, ',', ' '), '，', ' '), '、', ' '), ';', ' '), '；', ' '),
               char(9), ' '), char(10), ' '), char(13), ' '), '　', ' ')) || ' ', '', 0
    FROM course_section
    UNION ALL
    SELECT lid, substr(rest, instr(rest, ' ') + 1),
           trim(substr(rest, 1, instr(rest, ' ') - 1)), position + 1
    FROM names WHERE rest <> ''
)
SELECT lid, name, MIN(position) FROM names WHERE name <> '' GROUP BY lid, name;

INSERT INTO teachers (name)
SELECT DISTINCT name FROM teacher_names_migration ORDER BY name;

INSERT INTO course_section_teachers (lid, teacher_id, position)
SELECT n.lid, t.id, n.position
FROM teacher_names_migration AS n JOIN teachers AS t ON t.name = n.name;

DROP TABLE teacher_names_migration;
DROP INDEX course_section_teacher_name_idx;
ALTER TABLE course_section DROP COLUMN teacher_name;
ALTER TABLE course_section DROP COLUMN teacher_list_raw;

DROP TRIGGER reviews_count_insert;
DROP TRIGGER reviews_count_delete;
DROP TRIGGER reviews_count_move;
ALTER TABLE reviews RENAME TO course_reviews;
DROP INDEX reviews_lid_idx;
DROP INDEX reviews_posted_at_idx;
CREATE INDEX course_reviews_lid_idx ON course_reviews(lid);
CREATE INDEX course_reviews_posted_at_idx ON course_reviews(posted_at_local);

CREATE TRIGGER course_reviews_count_insert AFTER INSERT ON course_reviews
BEGIN
    UPDATE course_section SET review_count = review_count + 1 WHERE lid = NEW.lid;
END;

CREATE TRIGGER course_reviews_count_delete AFTER DELETE ON course_reviews
BEGIN
    UPDATE course_section SET review_count = review_count - 1 WHERE lid = OLD.lid;
END;

CREATE TRIGGER course_reviews_count_move AFTER UPDATE OF lid ON course_reviews
WHEN NEW.lid <> OLD.lid
BEGIN
    UPDATE course_section SET review_count = review_count - 1 WHERE lid = OLD.lid;
    UPDATE course_section SET review_count = review_count + 1 WHERE lid = NEW.lid;
END;

CREATE TABLE teacher_reviews (
    id INTEGER PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL
) STRICT;

CREATE INDEX teacher_reviews_teacher_posted_idx ON teacher_reviews(teacher_id, posted_at_local, id);

