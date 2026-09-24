import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 24;

type Course = { course_id: string; name: string };

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = platform?.env.DB;
  if (!db) error(503, 'The course database is unavailable.');

  const query = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
  const requestedPage = Number(url.searchParams.get('page') ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const where = query ? 'WHERE instr(lower(course_id), lower(?)) > 0 OR instr(lower(name), lower(?)) > 0' : '';
  const params = query ? [query, query] : [];

  const countRow = await db.prepare(`SELECT COUNT(*) AS total FROM courses ${where}`).bind(...params).first<{ total: number }>();
  const total = countRow?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const { results } = await db
    .prepare(`SELECT course_id, name FROM courses ${where} ORDER BY course_id LIMIT ? OFFSET ?`)
    .bind(...params, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE)
    .all<Course>();

  return { courses: results, query, page: currentPage, pages, total, pageSize: PAGE_SIZE };
};
