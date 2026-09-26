<script lang="ts">
import TeacherLinks from "$lib/components/teacher-links.svelte";
import { goto } from "$app/navigation";
import * as Select from "$lib/components/ui/select";
import { ArrowLeft, MessageSquareText } from "@lucide/svelte";
import { Button } from "$lib/components/ui/button";
import * as Field from "$lib/components/ui/field";
import { Input } from "$lib/components/ui/input";
import { Separator } from "$lib/components/ui/separator";
import { Textarea } from "$lib/components/ui/textarea";
import PagePagination from "$lib/components/page-pagination.svelte";
import type { ActionData, PageData } from "./$types";

let { data, form }: { data: PageData; form: ActionData } = $props();

const pageUrl = (page: number, sort = data.sort) => {
  const params = new URLSearchParams({ page: String(page) });
  if (sort === "oldest") params.set("sort", sort);
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
      <p class="mt-3 text-base text-muted-foreground">授课教师 · <TeacherLinks teachers={data.section.teachers} /></p>
    {:else}
      <div class="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
        {#each data.sections as section (section.lid)}
          <p>班级 {section.lid} · <TeacherLinks teachers={section.teachers} /></p>
        {/each}
      </div>
    {/if}
  </header>

  {#if data.submitted}
    <p class="mb-6 rounded-lg border border-border bg-muted px-4 py-3 text-sm" role="status">评价已提交，感谢分享。</p>
  {/if}

  {#if data.sections.length}
    <section
      class="mb-10 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6"
      aria-labelledby="review-form-title"
    >
      <h2 id="review-form-title" class="text-lg font-semibold tracking-tight">写评价</h2>
      <p class="mt-1 text-sm text-muted-foreground">评价匿名展示。登录仅用于防止垃圾内容。</p>
      {#if data.authenticated}
        <form method="POST" action="?/submitReview" class="mt-5">
          <Field.Group>
            {#if data.backUrl !== "/"}
              <input type="hidden" name="from" value={data.backUrl} />
            {/if}
            {#if data.section || data.sections.length === 1}
              <input type="hidden" name="lid" value={data.section?.lid ?? data.sections[0].lid} />
            {:else}
              <Field.Field data-invalid={form?.message ? true : undefined}>
                <Field.Label for="review-section">课程班级</Field.Label>
                <select
                  id="review-section"
                  name="lid"
                  required
                  class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-3"
                  value={form?.lid ?? ""}
                >
                  <option value="" disabled>请选择课程班级</option>
                  {#each data.sections as choice (choice.lid)}
                    <option value={choice.lid}
                      >{choice.teachers.map((teacher) => teacher.name).join("、") || "教师信息待补充"} · {choice.lid}</option
                    >
                  {/each}
                </select>
              </Field.Field>
            {/if}
            <Field.Field data-invalid={form?.message ? true : undefined}>
              <Field.Label for="review-title">标题</Field.Label>
              <Input
                id="review-title"
                name="title"
                maxlength={120}
                required
                value={form?.title ?? ""}
                aria-invalid={form?.message ? true : undefined}
              />
            </Field.Field>
            <Field.Field data-invalid={form?.message ? true : undefined}>
              <Field.Label for="review-content">正文</Field.Label>
              <Textarea
                id="review-content"
                name="content"
                rows={5}
                maxlength={5000}
                required
                value={form?.content ?? ""}
                aria-invalid={form?.message ? true : undefined}
              />
            </Field.Field>
            {#if form?.message}
              <p class="text-sm text-destructive" role="alert">{form.message}</p>
            {/if}
            <Button type="submit" class="self-start">提交评价</Button>
          </Field.Group>
        </form>
      {:else}
        <Button href={data.signInUrl} class="mt-5">登录后写评价</Button>
      {/if}
    </section>
  {/if}

  <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
    <h2 class="text-lg font-semibold tracking-tight">同学评价</h2>
    <div class="flex items-center gap-3">
      <p class="text-sm tabular-nums text-muted-foreground">共 {data.total.toLocaleString()} 条</p>
      <Select.Root
        type="single"
        value={data.sort}
        onValueChange={(value) => {
          if (value === "latest" || value === "oldest") {
            void goto(pageUrl(1, value), { noScroll: true, keepFocus: true });
          }
        }}
      >
        <Select.Trigger aria-label="评价排序">
          <Select.Value>{data.sort === "oldest" ? "最早优先" : "最新优先"}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value="latest" label="最新优先">最新优先</Select.Item>
            <Select.Item value="oldest" label="最早优先">最早优先</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  {#if data.reviews.length}
    <ol class="flex flex-col gap-4">
      {#each data.reviews as review (review.id)}
        <li class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs sm:p-6">
          {#if review.title}
            <h3 class="text-base font-semibold tracking-tight">{review.title}</h3>
          {/if}
          <p class="text-sm text-muted-foreground" class:mt-2={review.title}>
            <time>{review.posted_at_local}</time>
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
