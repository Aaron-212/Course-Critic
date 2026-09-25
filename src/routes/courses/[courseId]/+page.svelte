<script lang="ts">
import { ArrowLeft, MessageSquareText } from "@lucide/svelte";
import { Button } from "$lib/components/ui/button";
import { Separator } from "$lib/components/ui/separator";
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
  <title>{data.course.name} · SHOU LXK</title>
  <meta name="description" content={`Read reviews for ${data.course.name}.`} />
</svelte:head>

<main class="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
  <Button href={data.backUrl} variant="ghost" size="sm" class="-ml-3">
    <ArrowLeft data-icon="inline-start" aria-hidden="true" />返回课程列表
  </Button>

  <header class="mt-8 mb-8 sm:mt-10 sm:mb-10">
    <p class="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
      课程评价 <span aria-hidden="true">/</span>
      {data.course.course_id}
    </p>
    <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{data.course.name}</h1>
    {#if data.section}
      <p class="mt-3 text-base text-muted-foreground">授课教师 · {data.section.teacher_name}</p>
    {/if}
  </header>

  <div class="mb-5 flex items-center justify-between gap-4">
    <h2 class="text-lg font-semibold tracking-tight">同学评价</h2>
    <p class="text-sm tabular-nums text-muted-foreground">共 {data.total.toLocaleString()} 条</p>
  </div>

  {#if data.reviews.length}
    <ol class="flex flex-col gap-4">
      {#each data.reviews as review (`${review.lid}-${review.position}`)}
        <li class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs sm:p-6">
          {#if review.title}
            <h3 class="text-base font-semibold tracking-tight">{review.title}</h3>
          {/if}
          <p class="text-sm text-muted-foreground" class:mt-2={review.title}>
            {review.teacher_name} · <time>{review.posted_at_local}</time>
          </p>
          <Separator class="my-4" />
          <p class="whitespace-pre-wrap wrap-break-words text-sm leading-7 sm:text-base">{review.content}</p>
        </li>
      {/each}
    </ol>
  {:else}
    <div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span class="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        ><MessageSquareText class="size-5" aria-hidden="true" /></span
      >
      <h3 class="text-lg font-semibold">暂无评价</h3>
      <p class="text-sm text-muted-foreground">这门课还没有可展示的评价。</p>
      <Button href={data.backUrl} variant="outline" class="mt-1">浏览其他课程</Button>
    </div>
  {/if}

  {#if data.pages > 1}
    <PagePagination count={data.total} perPage={data.pageSize} page={data.page} label="评价页面" {pageUrl} />
  {/if}
</main>
