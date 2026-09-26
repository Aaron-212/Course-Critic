<script lang="ts">
import { resolve } from "$app/paths";
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
  return `?${params}`;
};
</script>

<svelte:head>
  <title>{data.teacher.name} · SHOU LXK</title>
  <meta name="description" content={`Read reviews for ${data.teacher.name}.`} />
</svelte:head>

<main class="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
  <Button href="/" variant="ghost" size="sm" class="-ml-3">
    <ArrowLeft data-icon="inline-start" aria-hidden="true" />返回课程列表
  </Button>

  <header class="mt-8 mb-8 sm:mt-10 sm:mb-10">
    <p class="mb-3 text-xs font-medium tracking-widest text-muted-foreground">教师评价</p>
    <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{data.teacher.name}</h1>
  </header>

  {#if data.submitted}
    <p class="mb-6 rounded-lg border border-border bg-muted px-4 py-3 text-sm" role="status">评价已提交，感谢分享。</p>
  {/if}

  <section class="mb-10" aria-labelledby="teacher-courses">
    <h2 id="teacher-courses" class="mb-4 text-lg font-semibold">授课课程</h2>
    <ul class="flex flex-col gap-3">
      {#each data.courses as course (course.lid)}
        <li class="rounded-xl border border-border bg-card p-4">
          <a
            class="font-medium underline underline-offset-4"
            href={`${resolve("/courses/[courseId]", { courseId: course.course_id })}?${new URLSearchParams({ lid: course.lid })}`}
            >{course.name}</a
          >
          <p class="mt-2 text-sm text-muted-foreground">
            {course.course_id} · 班级 {course.lid} · {course.college} · {course.credits} 学分
          </p>
        </li>
      {:else}
        <li class="text-sm text-muted-foreground">暂无授课课程。</li>
      {/each}
    </ul>
  </section>

  <section
    class="mb-10 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6"
    aria-labelledby="review-form-title"
  >
    <h2 id="review-form-title" class="text-lg font-semibold tracking-tight">评价教师</h2>
    <p class="mt-1 text-sm text-muted-foreground">分享对这位教师的教学体验。评价匿名展示，登录仅用于防止垃圾内容。</p>
    {#if data.authenticated}
      <form method="POST" action="?/submitReview" class="mt-5">
        <Field.Group>
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
      <p class="text-sm text-muted-foreground">这位教师还没有可展示的评价。</p>
      <Button href="/" variant="outline" class="mt-1">浏览其他课程</Button>
    </div>
  {/if}

  {#if data.pages > 1}
    <PagePagination count={data.total} perPage={data.pageSize} page={data.page} label="评价页面" {pageUrl} />
  {/if}
</main>
