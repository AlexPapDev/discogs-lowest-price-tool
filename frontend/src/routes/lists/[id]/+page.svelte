<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import type { DiscogsListItem } from "$lib/types";

  let items: DiscogsListItem[] = [];
  let loading: boolean = true;
  let error: string | null = null;
  let itemMap: Map<string, DiscogsListItem> = new Map()

  $: listId = $page.params.id;

  onMount(async () => {
    try {
        // Fetch list items
        const listRes = await fetch(`http://localhost:3000/api/get-list-info?listId=${listId}`);
        if (!listRes.ok) throw new Error("Failed to fetch list items");
        const listItems = await listRes.json();
        
        // Extract all release IDs
        const releaseIds = listItems.map((item: DiscogsListItem) => item.id).filter(Boolean);

        // Fetch lowest prices for all releases
        const pricesRes = await fetch('http://localhost:3000/api/get-lowest-prices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ releaseIds })
        });
        if (!pricesRes.ok) throw new Error("Failed to fetch lowest prices");
        const pricesMap = await pricesRes.json();
        debugger
        // Update items with the new lowest prices
        items = listItems.map((item: DiscogsListItem) => ({
          ...item,
          lowest_price: pricesMap[item.id].value || item.lowest_price
        }));

    } catch (e: any) {
      error = e.message ?? "Unknown error";
    } finally {
      loading = false;
    }
});
</script>

<h1 class="text-xl font-bold mb-4">List {listId}</h1>

<a class="text-blue-600 underline mb-4 inline-block" href="/">← Back to all lists</a>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else if items.length === 0}
  <p>No items in this list.</p>
{:else}
  <ul class="space-y-2">
    {#each items as item}
      <li>
        <strong>{item.display_title}</strong>
        <span>{item.lowest_price || 'NA'}</span>
      </li>
    {/each}
  </ul>
{/if}
