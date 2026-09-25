import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 20;

type Course = { course_id: string; name: string };
type Review = {
  lid: string;
  position: number;
  title: string;
  content: string;
  posted_at_local: string;
  teacher_name: string;
};

export const load: PageServerLoad = async ({ params, platform, url }) => {
  const db = platform?.env.DB;
  if (!db) error(503, "The course database is unavailable.");

  let backUrl = "/";
  const from = url.searchParams.get("from");
  if (from) {
    try {
      const destination = new URL(from, url);
      if (destination.origin === url.origin && destination.pathname === "/") {
        backUrl = `${destination.pathname}${destination.search}`;
      }
    } catch {
      // Ignore invalid return URLs and use the course list.
    }
  }

  const course = await db
    .prepare("SELECT course_id, name FROM courses WHERE course_id = ?")
    .bind(params.courseId)
    .first<Course>();
  if (!course) error(404, "Course not found.");

  const countRow = await db
    .prepare(`
    SELECT COUNT(*) AS total
    FROM reviews AS r
    JOIN course_section AS ci ON ci.lid = r.lid
    WHERE ci.course_id = ?
  `)
    .bind(course.course_id)
    .first<{ total: number }>();
  const total = countRow?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;

  const { results: reviews } = await db
    .prepare(`
    SELECT r.lid, r.position, r.title, r.content, r.posted_at_local, ci.teacher_name
    FROM course_section AS ci
    JOIN reviews AS r ON r.lid = ci.lid
    WHERE ci.course_id = ?
    ORDER BY r.posted_at_local DESC, r.lid, r.position
    LIMIT ? OFFSET ?
  `)
    .bind(course.course_id, PAGE_SIZE, (page - 1) * PAGE_SIZE)
    .all<Review>();

  return { course, reviews, total, page, pages, pageSize: PAGE_SIZE, backUrl };
};
