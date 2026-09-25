-- Replace source response positions with stable, automatically assigned review IDs.
CREATE TABLE reviews_new (
    id INTEGER PRIMARY KEY,
    lid TEXT NOT NULL REFERENCES course_section(lid),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL
) STRICT;

INSERT INTO reviews_new (lid, title, content, posted_at_local)
SELECT lid, title, content, posted_at_local
FROM reviews
ORDER BY posted_at_local, lid, position;

DROP TABLE reviews;
ALTER TABLE reviews_new RENAME TO reviews;

CREATE INDEX reviews_lid_idx ON reviews(lid);
CREATE INDEX reviews_posted_at_idx ON reviews(posted_at_local);
