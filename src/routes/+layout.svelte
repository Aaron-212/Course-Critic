<script lang="ts">
import "../app.css";
import { BookOpen } from "@lucide/svelte";
import { Button } from "$lib/components/ui/button";
import type { Snippet } from "svelte";
import type { LayoutData } from "./$types";

let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<nav class="border-b border-border bg-background" aria-label="主导航">
  <div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
    <a href="/" class="inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground no-underline">
      <span class="flex size-8 items-center justify-center rounded-md border border-border bg-card shadow-xs"
        ><BookOpen class="size-4" aria-hidden="true" /></span
      >
      <span>SHOU LXK</span>
    </a>
    <div class="flex items-center gap-2">
      {#if data.authenticated}
        <Button href={data.accountUrl} variant="outline" size="sm">账号</Button>
      {:else}
        <Button href={data.signInUrl} variant="outline" size="sm">登录</Button>
        <Button href={data.registerUrl} size="sm">注册</Button>
      {/if}
    </div>
  </div>
</nav>

{@render children()}
