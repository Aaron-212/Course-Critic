export type Teacher = { id: number; name: string };

export async function withTeachers<T extends { lid: string }>(
  db: D1Database,
  sections: T[],
): Promise<(T & { teachers: Teacher[] })[]> {
  if (!sections.length) return [];
  // Keep each query below D1's bound-parameter limit for courses with many sections.
  if (sections.length > 90) {
    const groups = [];
    for (let offset = 0; offset < sections.length; offset += 90) {
      groups.push(...(await withTeachers(db, sections.slice(offset, offset + 90))));
    }
    return groups;
  }
  const { results } = await db
    .prepare(`SELECT st.lid, t.id, t.name
      FROM course_section_teachers AS st JOIN teachers AS t ON t.id = st.teacher_id
      WHERE st.lid IN (${sections.map(() => "?").join(",")})
      ORDER BY st.lid, st.position, t.id`)
    .bind(...sections.map((section) => section.lid))
    .all<Teacher & { lid: string }>();
  const teachers = new Map<string, Teacher[]>();
  for (const { lid, id, name } of results) {
    const group = teachers.get(lid) ?? [];
    group.push({ id, name });
    teachers.set(lid, group);
  }
  return sections.map((section) => ({ ...section, teachers: teachers.get(section.lid) ?? [] }));
}
