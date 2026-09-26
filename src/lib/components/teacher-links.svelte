<script lang="ts">
import { resolve } from "$app/paths";
let { teachers }: { teachers: { id: number; name: string }[] } = $props();
</script>

{#each teachers as teacher, index (teacher.id)}
  {#if index > 0}<span aria-hidden="true">、</span>{/if}
  <a
    class="underline underline-offset-4 hover:text-foreground"
    href={resolve("/teachers/[teacherId]", { teacherId: String(teacher.id) })}>{teacher.name}</a
  >
{:else}
  <span>教师信息待补充</span>
{/each}
