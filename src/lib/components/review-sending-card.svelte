<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Field from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";

  type Section = { lid: string; teachers: { name: string }[] };
  type FormData = { message?: string; title?: string; content?: string; lid?: string } | null;

  let {
    heading,
    description,
    authenticated,
    signInUrl,
    form,
    sections,
    selectedLid,
  }: {
    heading: string;
    description: string;
    authenticated: boolean;
    signInUrl: string;
    form: FormData;
    sections?: Section[];
    selectedLid?: string;
  } = $props();
</script>

<section class="mb-10 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6" aria-labelledby="review-form-title">
  <h2 id="review-form-title" class="text-lg font-semibold tracking-tight">{heading}</h2>
  <p class="mt-1 text-sm text-muted-foreground">{description}</p>
  {#if authenticated}
    <form method="POST" action="?/submitReview" class="mt-5">
      <Field.Group>
        {#if sections}
          {#if selectedLid || sections.length === 1}
            <input type="hidden" name="lid" value={selectedLid ?? sections[0].lid} />
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
                {#each sections as choice (choice.lid)}
                  <option value={choice.lid}
                    >{choice.teachers.map((teacher) => teacher.name).join("、") || "教师信息待补充"} · {choice.lid}</option
                  >
                {/each}
              </select>
            </Field.Field>
          {/if}
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
    <Button href={signInUrl} class="mt-5">登录后写评价</Button>
  {/if}
</section>
