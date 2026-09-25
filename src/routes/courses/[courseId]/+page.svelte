<script lang="ts">
import PagePagination from "$lib/components/page-pagination.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

const pageUrl = (page: number) => {
  const params = new URLSearchParams({ page: String(page) });
  if (data.section) params.set("lid", data.section.lid);
  if (data.backUrl !== "/") params.set("from", data.backUrl);
  return `?${params}`;
};
</script>

<svelte:head>
  <title>{data.course.name} · Course Critic</title>
  <meta name="description" content={`Read reviews for ${data.course.name}.`} />
</svelte:head>

<main class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
  <a href={data.backUrl} class="text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
    >← Courses</a
  >

  <header class="mb-8 mt-6">
    <p class="mb-2 tabular-nums text-sm text-slate-500">{data.course.course_id}</p>
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.course.name}</h1>
    {#if data.section}
      <p class="mt-2 text-slate-600">{data.section.teacher_name}</p>
    {/if}
    <p class="mt-3 text-slate-600">{data.total.toLocaleString()}个评价</p>
  </header>

  {#if data.reviews.length}
    <ol class="space-y-4">
      {#each data.reviews as review (`${review.lid}-${review.position}`)}
        <li class="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm">
          {#if review.title}
            <h2 class="text-lg font-semibold text-slate-900">{review.title}</h2>
          {/if}
          <p class="text-sm text-slate-500" class:mt-1={review.title}>
            {review.teacher_name} · <time>{review.posted_at_local}</time>
          </p>
          <p class="mt-4 whitespace-pre-wrap wrap-break-words leading-relaxed text-slate-700">{review.content}</p>
        </li>
      {/each}
    </ol>
  {:else}
    <div class="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
      没有评价。
    </div>
  {/if}

  {#if data.pages > 1}
    <PagePagination count={data.total} perPage={data.pageSize} page={data.page} label="Review pages" {pageUrl} />
  {/if}
</main>
