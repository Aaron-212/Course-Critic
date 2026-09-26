<script lang="ts">
  import { afterNavigate, goto } from "$app/navigation";
  import { ArrowLeft } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";

  let cameFromMain = false;
  let initialized = false;

  afterNavigate(({ from }) => {
    if (initialized) return;
    cameFromMain = from?.url.pathname === "/";
    initialized = true;
  });

  function goBack(event: MouseEvent) {
    if (!cameFromMain || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.back();
  }
</script>

<Button href="/" variant="ghost" size="sm" class="-ml-3" onclick={goBack}>
  <ArrowLeft data-icon="inline-start" aria-hidden="true" />返回课程列表
</Button>
