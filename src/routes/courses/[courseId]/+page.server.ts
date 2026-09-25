import { error, fail, redirect } from "@sveltejs/kit";
import { isAuthenticated } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

const PAGE_SIZE = 20;

type Course = { course_id: string; name: string };
type Section = { lid: string; teacher_name: string };
type Review = {
  lid: string;
  position: number;
  title: string;
  content: string;
  posted_at_local: string;
};

export const load: PageServerLoad = async ({ params, platform, url, parent }) => {
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

  const sections = await db
    .prepare("SELECT lid, teacher_name FROM course_section WHERE course_id = ? ORDER BY teacher_name, lid")
    .bind(course.course_id)
    .all<Section>();

  const lid = url.searchParams.get("lid");
  const section = lid
    ? await db
        .prepare("SELECT lid, teacher_name FROM course_section WHERE lid = ? AND course_id = ?")
        .bind(lid, course.course_id)
        .first<Section>()
    : null;
  if (lid && !section) error(404, "Course section not found.");
  const sectionFilter = section ? "AND ci.lid = ?" : "";
  const reviewValues = section ? [course.course_id, section.lid] : [course.course_id];

  const countRow = await db
    .prepare(`
    SELECT COUNT(*) AS total
    FROM reviews AS r
    JOIN course_section AS ci ON ci.lid = r.lid
    WHERE ci.course_id = ? ${sectionFilter}
  `)
    .bind(...reviewValues)
    .first<{ total: number }>();
  const total = countRow?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;

  const { results: reviews } = await db
    .prepare(`
    SELECT r.lid, r.position, r.title, r.content, r.posted_at_local
    FROM course_section AS ci
    JOIN reviews AS r ON r.lid = ci.lid
    WHERE ci.course_id = ? ${sectionFilter}
    ORDER BY r.posted_at_local DESC, r.lid, r.position
    LIMIT ? OFFSET ?
  `)
    .bind(...reviewValues, PAGE_SIZE, (page - 1) * PAGE_SIZE)
    .all<Review>();

  const { authenticated, signInUrl } = await parent();
  return {
    course,
    section,
    sections: sections.results,
    reviews,
    total,
    page,
    pages,
    pageSize: PAGE_SIZE,
    backUrl,
    authenticated,
    signInUrl,
    submitted: url.searchParams.get("submitted") === "1",
  };
};

export const actions: Actions = {
  submitReview: async ({ params, platform, request, url }) => {
    const db = platform?.env.DB;
    if (!db) error(503, "The course database is unavailable.");
    const form = await request.formData();
    const lid = form.get("lid");
    const submittedTitle = form.get("title");
    const submittedContent = form.get("content");
    const title = typeof submittedTitle === "string" ? submittedTitle.trim() : "";
    const content = typeof submittedContent === "string" ? submittedContent.trim() : "";
    const values = { title, content, lid: typeof lid === "string" ? lid : "" };

    if (!(await isAuthenticated(request, url, platform?.env.PLATFORM_AUTH))) {
      return fail(401, { message: "请先登录，再提交评价。", ...values });
    }

    if (!title || title.length > 120 || !content || content.length > 5000) {
      return fail(400, { message: "请填写标题（最多 120 字）和正文（最多 5000 字）。", ...values });
    }
    if (typeof lid !== "string" || !lid) {
      return fail(400, { message: "请选择课程对应的教师。", ...values });
    }

    const section = await db
      .prepare("SELECT lid FROM course_section WHERE lid = ? AND course_id = ?")
      .bind(lid, params.courseId)
      .first<{ lid: string }>();
    if (!section) return fail(400, { message: "请选择有效的课程教师。", ...values });

    const postedAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    await db
      .prepare(`
        INSERT INTO reviews (lid, position, title, content, posted_at_local)
        SELECT ?, COALESCE(MAX(position), 0) + 1, ?, ?, ?
        FROM reviews WHERE lid = ?
      `)
      .bind(lid, title, content, postedAt, lid)
      .run();

    const destination = new URL(url.pathname, url);
    destination.searchParams.set("lid", lid);
    const from = form.get("from");
    if (typeof from === "string" && from) destination.searchParams.set("from", from);
    destination.searchParams.set("submitted", "1");
    redirect(303, destination);
  },
};
