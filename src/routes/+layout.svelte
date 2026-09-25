<script lang="ts">
import "../app.css";
let { children } = $props();
</script>

<nav class="border-b border-border bg-background" aria-label="Main navigation">
  <div class="mx-auto flex min-h-16 max-w-6xl items-center px-4 sm:px-6">
    <a href="/" class="font-semibold tracking-tight text-foreground no-underline">SHOU LXK</a>
  </div>
</nav>

{@render children()}
