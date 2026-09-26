<script lang="ts">
  import { afterNavigate, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { ArrowLeft } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";

  let cameFromApp = false;

  afterNavigate(({ from, to, type }) => {
    if (type === "enter" || type === "popstate") {
      cameFromApp = page.state.detailFromApp === true;
    } else if (from?.url.pathname !== to?.url.pathname) {
      cameFromApp = from?.route.id != null;
    }
    if (type !== "enter") replaceState("", { ...page.state, detailFromApp: cameFromApp });
  });

  function goBack(event: MouseEvent) {
    if (!cameFromApp || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.back();
  }
</script>

<Button href="/" variant="ghost" size="sm" class="-ml-3" onclick={goBack}>
  <ArrowLeft data-icon="inline-start" aria-hidden="true" />返回
</Button>
