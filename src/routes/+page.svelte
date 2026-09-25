<script lang="ts">
import { ArrowUpRight, Search, SlidersHorizontal } from "@lucide/svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "$lib/components/ui/input-group/index.js";
import PagePagination from "$lib/components/page-pagination.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

const pageUrl = (page: number) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data.filters)) {
    if (value && !(key === "sort" && value === "popular")) params.set(key, value);
  }
  params.set("page", String(page));
  return `/?${params}`;
};

const hasAdvancedFilters = $derived(
  Boolean(
    data.filters.teacher ||
    data.filters.college ||
    data.filters.electiveType ||
    data.filters.attribute ||
    data.filters.credits ||
    data.filters.minReviews ||
    data.filters.sort !== "popular",
  ),
);

const selectClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";
const tagClass = "max-w-full truncate rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground";
</script>

<svelte:head>
  <title>SHOU LXK</title>
  <meta name="description" content="Find courses by name, teacher, credits, and more at Shanghai Ocean University." />
</svelte:head>

<main class="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
  <section aria-labelledby="search-heading">
    <div>
      <h1 id="search-heading" class="text-xl font-semibold sm:text-4xl">课程</h1>
    </div>

    <form method="GET" role="search" class="mt-7 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-5">
      <div class="flex gap-2 sm:gap-3">
        <InputGroup class="h-10 flex-1">
          <InputGroupAddon>
            <Search size={18} aria-hidden="true" class="size-4.5" />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            value={data.filters.q}
            placeholder="课程名或课程号"
            aria-label="通过课程名或课程号搜索课程"
            class="h-full"
          />
        </InputGroup>
        <Button type="submit" size="lg" class="sm:min-w-26">搜索</Button>
      </div>

      <details class="mt-4 border-t border-border pt-4" open={hasAdvancedFilters}>
        <summary
          class="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground [&::-webkit-details-marker]:hidden"
          ><SlidersHorizontal size={16} aria-hidden="true" />高级过滤</summary
        >
        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>教师</span>
            <Input name="teacher" value={data.filters.teacher} placeholder="教师名" />
          </label>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>学院</span>
            <select name="college" class={selectClass} value={data.filters.college}>
              <option value="">所有学院</option>
              {#each data.options.colleges as college}
                <option value={college}>{college}</option>
              {/each}
            </select>
          </label>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>课程类型</span>
            <select name="electiveType" class={selectClass} value={data.filters.electiveType}>
              <option value="">任意类型</option>
              {#each data.options.electiveTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </label>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>学分</span>
            <select name="credits" class={selectClass} value={data.filters.credits}>
              <option value="">任意值</option>
              {#each data.options.credits as credits}
                <option value={credits}>{credits}</option>
              {/each}
            </select>
          </label>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>课程属性</span>
            <select name="attribute" class={selectClass} value={data.filters.attribute}>
              <option value="">任意属性</option>
              {#each data.options.attributes as attribute}
                <option value={attribute}>{attribute}</option>
              {/each}
            </select>
          </label>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>最少评价数</span>
            <Input
              name="minReviews"
              type="number"
              min="0"
              step="1"
              value={data.filters.minReviews}
              placeholder="任意值"
            />
          </label>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>排序</span>
            <select name="sort" class={selectClass} value={data.filters.sort}>
              <option value="popular">最多喜爱</option>
              <option value="reviews">最多评价</option>
              <option value="name">名称</option>
              <option value="credits">最多学分</option>
            </select>
          </label>
        </div>
        <div class="mt-5 flex items-center gap-2">
          <Button type="submit" variant="outline">应用过滤</Button>
          <Button href="/" variant="ghost">清空</Button>
        </div>
      </details>
    </form>
  </section>

  <section aria-labelledby="courses-heading" class="mt-11 sm:mt-14">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="mb-1 text-xs font-semibold text-muted-foreground uppercase">
          {data.isSearching ? "课程搜索" : "探索"}
        </p>
        <h2 id="courses-heading" class="text-2xl font-semibold">
          {data.isSearching ? "搜索结果" : "热门课程"}
        </h2>
      </div>
      <p class="whitespace-nowrap text-sm text-muted-foreground">
        {data.total.toLocaleString()}个课程
      </p>
    </div>

    {#if data.courses.length}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.courses as course (course.course_id)}
          <a
            class="flex min-h-55 min-w-0 flex-col rounded-lg border border-border bg-card p-5 text-card-foreground no-underline shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/courses/${encodeURIComponent(course.course_id)}`}
          >
            <div class="flex justify-between gap-2 text-xs text-muted-foreground">
              <span class="tabular-nums">{course.course_id}</span>
              {#if course.rank !== null}<span class="font-semibold">#{course.rank}</span>{/if}
            </div>
            <div class="my-4">
              <h3 class="wrap-anywhere text-lg leading-snug font-semibold">{course.name}</h3>
              <p class="mt-1 wrap-anywhere text-sm text-muted-foreground">{course.teacher_name}</p>
            </div>
            <div class="mt-auto mb-4 flex flex-wrap gap-1.5">
              <span class={tagClass}>{course.college}</span>
              {#if course.elective_type && course.elective_type !== "N/A"}<span class={tagClass}
                  >{course.elective_type}</span
                >{/if}
            </div>
            <div class="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>{course.credits}学分</span>
              <span>{course.comments_count}个评价</span>
              <ArrowUpRight size={17} aria-hidden="true" class="ml-auto text-foreground" />
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div
        class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-14 text-center"
      >
        <h3 class="text-lg font-semibold">没有找到课程</h3>
        <p class="text-sm text-muted-foreground">试试别的名字？</p>
        <Button href="/" variant="outline" class="mt-1">清空过滤器</Button>
      </div>
    {/if}

    {#if data.pages > 1}
      <PagePagination count={data.total} perPage={data.pageSize} page={data.page} label="课程页面" {pageUrl} />
    {/if}
  </section>
</main>
