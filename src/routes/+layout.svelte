<script lang="ts">
import "../app.css";
import { Button } from "$lib/components/ui/button";
import type { Snippet } from "svelte";
import type { LayoutData } from "./$types";

let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<nav class="border-b border-border bg-background" aria-label="Main navigation">
  <div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
    <a href="/" class="font-semibold tracking-tight text-foreground no-underline">SHOU LXK</a>
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
