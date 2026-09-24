<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import PagePagination from '$lib/components/page-pagination.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const pageUrl = (page: number, query: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', String(page));
    return `/?${params}`;
  };
</script>

<svelte:head>
  <title>Courses · Course Critic</title>
  <meta name="description" content="Browse courses at Shanghai Ocean University." />
</svelte:head>

<main class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
  <header class="mb-8">
    <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-500">Course Critic</p>
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Courses</h1>
    <p class="mt-3 text-slate-600">Browse {data.total.toLocaleString()} {data.query ? 'matching' : 'available'} courses.</p>
  </header>

  <form method="GET" class="mb-6 flex gap-2" role="search">
    <Input name="q" value={data.query} placeholder="Search by course name or code" aria-label="Search courses" class="flex-1" />
    <Button type="submit">Search</Button>
  </form>

  {#if data.courses.length}
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <ul class="divide-y divide-slate-100">
        {#each data.courses as course (course.course_id)}
          <li>
            <a class="flex flex-col gap-1 px-5 py-4 hover:bg-slate-50 focus-visible:bg-slate-50 sm:flex-row sm:items-center sm:gap-6" href={`/courses/${encodeURIComponent(course.course_id)}`}>
              <span class="w-36 shrink-0 font-mono text-sm text-slate-500">{course.course_id}</span>
              <span class="font-medium text-slate-900">{course.name}</span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <div class="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
      No courses found. Try another name or code.
    </div>
  {/if}

  {#if data.pages > 1}
    <PagePagination count={data.total} perPage={data.pageSize} page={data.page} label="Course pages" pageUrl={(page) => pageUrl(page, data.query)} />
  {/if}
</main>
