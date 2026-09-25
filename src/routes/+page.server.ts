import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 12;

type CourseCard = {
  course_id: string;
  name: string;
  teacher_name: string;
  college: string;
  elective_type: string;
  credits: number;
  comments_count: number;
  likes: number;
  rank: number | null;
};

type Option = { value: string };
type CreditOption = { credits: number };

const textFilter = (value: string | null) => (value ?? "").trim().slice(0, 100);

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = platform?.env.DB;
  if (!db) error(503, "The course database is unavailable.");

  const filters = {
    q: textFilter(url.searchParams.get("q")),
    teacher: textFilter(url.searchParams.get("teacher")),
    college: textFilter(url.searchParams.get("college")),
    electiveType: textFilter(url.searchParams.get("electiveType")),
    attribute: textFilter(url.searchParams.get("attribute")),
    credits: textFilter(url.searchParams.get("credits")),
    minReviews: textFilter(url.searchParams.get("minReviews")),
    sort: textFilter(url.searchParams.get("sort")),
  };

  const credit = /^\d+$/.test(filters.credits) ? Number(filters.credits) : null;
  const minReviews = /^\d+$/.test(filters.minReviews) ? Number(filters.minReviews) : null;
  const sort = ["popular", "reviews", "name", "credits"].includes(filters.sort) ? filters.sort : "popular";
  filters.sort = sort;
  filters.credits = credit !== null && Number.isSafeInteger(credit) ? String(credit) : "";
  filters.minReviews =
    minReviews !== null && Number.isSafeInteger(minReviews) && minReviews > 0 ? String(minReviews) : "";

  const isSearching = Boolean(
    filters.q ||
    filters.teacher ||
    filters.college ||
    filters.electiveType ||
    filters.attribute ||
    filters.credits ||
    filters.minReviews ||
    sort !== "popular",
  );
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [colleges, electiveTypes, attributes, credits] = await Promise.all([
    db
      .prepare(
        "SELECT value FROM category_options WHERE category_type = 'college' AND value <> 'N/A' ORDER BY position",
      )
      .all<Option>(),
    db
      .prepare(
        "SELECT value FROM category_options WHERE category_type = 'lessonType' AND value <> 'N/A' ORDER BY position",
      )
      .all<Option>(),
    db
      .prepare(
        "SELECT DISTINCT trim(attribute) AS value FROM course_instructors WHERE attribute IS NOT NULL AND trim(attribute) <> '' ORDER BY value",
      )
      .all<Option>(),
    db.prepare("SELECT DISTINCT credits FROM course_instructors ORDER BY credits").all<CreditOption>(),
  ]);

  let total: number;
  let courses: CourseCard[];
  let currentPage: number;

  if (isSearching) {
    const clauses: string[] = [];
    const values: (string | number)[] = [];
    if (filters.q) {
      clauses.push("(instr(lower(c.name), lower(?)) > 0 OR instr(lower(c.course_id), lower(?)) > 0)");
      values.push(filters.q, filters.q);
    }
    if (filters.teacher) {
      clauses.push("instr(lower(ci.teacher_name), lower(?)) > 0");
      values.push(filters.teacher);
    }
    if (filters.college) {
      clauses.push("ci.college = ?");
      values.push(filters.college);
    }
    if (filters.electiveType) {
      clauses.push("ci.elective_type = ?");
      values.push(filters.electiveType);
    }
    if (filters.attribute) {
      clauses.push("trim(ci.attribute) = ?");
      values.push(filters.attribute);
    }
    if (filters.credits) {
      clauses.push("ci.credits = ?");
      values.push(Number(filters.credits));
    }
    if (filters.minReviews) {
      clauses.push("ci.comments_count >= ?");
      values.push(Number(filters.minReviews));
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const matching = `FROM course_instructors AS ci JOIN courses AS c ON c.course_id = ci.course_id ${where}`;
    const countRow = await db
      .prepare(`SELECT COUNT(DISTINCT c.course_id) AS total ${matching}`)
      .bind(...values)
      .first<{ total: number }>();
    total = countRow?.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(page, pages);

    const orderBy = {
      popular: "likes DESC, comments_count DESC, name COLLATE NOCASE ASC",
      reviews: "comments_count DESC, likes DESC, name COLLATE NOCASE ASC",
      name: "name COLLATE NOCASE ASC",
      credits: "credits DESC, name COLLATE NOCASE ASC",
    }[sort];

    const result = await db
      .prepare(`
      WITH matches AS (
        SELECT c.course_id, c.name, ci.teacher_name, ci.college, ci.elective_type,
          ci.credits, ci.comments_count, ci.likes,
          ROW_NUMBER() OVER (
            PARTITION BY c.course_id
            ORDER BY ci.comments_count DESC, ci.likes DESC, ci.lid
          ) AS listing_number
        ${matching}
      )
      SELECT course_id, name, teacher_name, college, elective_type, credits,
        comments_count, likes, NULL AS rank
      FROM matches
      WHERE listing_number = 1
      ORDER BY ${orderBy}, course_id
      LIMIT ? OFFSET ?
    `)
      .bind(...values, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE)
      .all<CourseCard>();
    courses = result.results;
  } else {
    const countRow = await db
      .prepare("SELECT COUNT(DISTINCT course_id) AS total FROM hot_entries")
      .first<{ total: number }>();
    total = countRow?.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(page, pages);
    const result = await db
      .prepare(`
      WITH top_courses AS (
        SELECT course_id, MIN(rank) AS rank FROM hot_entries GROUP BY course_id
      )
      SELECT c.course_id, c.name, ci.teacher_name, h.college, h.elective_type,
        h.credits, h.comments_count, h.likes, top_courses.rank
      FROM top_courses
      JOIN courses AS c ON c.course_id = top_courses.course_id
      JOIN hot_entries AS h ON h.rank = top_courses.rank
      JOIN course_instructors AS ci ON ci.lid = (
        SELECT lid FROM course_instructors
        WHERE course_id = c.course_id
        ORDER BY comments_count DESC, likes DESC, lid LIMIT 1
      )
      ORDER BY top_courses.rank
      LIMIT ? OFFSET ?
    `)
      .bind(PAGE_SIZE, (currentPage - 1) * PAGE_SIZE)
      .all<CourseCard>();
    courses = result.results;
  }

  return {
    courses,
    filters,
    isSearching,
    page: currentPage,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
    pageSize: PAGE_SIZE,
    options: {
      colleges: colleges.results.map((row) => row.value),
      electiveTypes: electiveTypes.results.map((row) => row.value),
      attributes: attributes.results.map((row) => row.value),
      credits: credits.results.map((row) => row.credits),
    },
  };
};
