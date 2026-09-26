ALTER TABLE course_section ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0);

UPDATE course_section
SET review_count = (SELECT COUNT(*) FROM reviews WHERE reviews.lid = course_section.lid);

CREATE TRIGGER reviews_count_insert AFTER INSERT ON reviews
BEGIN
    UPDATE course_section SET review_count = review_count + 1 WHERE lid = NEW.lid;
END;

CREATE TRIGGER reviews_count_delete AFTER DELETE ON reviews
BEGIN
    UPDATE course_section SET review_count = review_count - 1 WHERE lid = OLD.lid;
END;

CREATE TRIGGER reviews_count_move AFTER UPDATE OF lid ON reviews
WHEN NEW.lid <> OLD.lid
BEGIN
    UPDATE course_section SET review_count = review_count - 1 WHERE lid = OLD.lid;
    UPDATE course_section SET review_count = review_count + 1 WHERE lid = NEW.lid;
END;

CREATE INDEX course_section_review_count_idx ON course_section(review_count DESC);
