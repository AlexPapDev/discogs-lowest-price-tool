<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import type { DiscogsListItem } from "$lib/types";

  let items: DiscogsListItem[] = [];
  let loading: boolean = true;
  let listName: string = '';
  let error: string | null = null;
  const url = 'https://discogs-lowest-price-tool-node.onrender.com'

  $: listId = $page.params.id;

  onMount(async () => {
    try {
      // Fetch list items
      const listRes = await fetch(`${url}/api/get-list-info?listId=${listId}`);
      if (!listRes.ok) throw new Error("Failed to fetch list items");
      const list = await listRes.json();
      const listItems = list.items;
      
      listName = list.name;
      // Extract all release IDs
      const releaseIds = listItems.map((item: DiscogsListItem) => item.id).filter(Boolean);

      // Fetch lowest prices for all releases
      const pricesRes = await fetch(`${url}/api/get-lowest-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ releaseIds })
      });
      if (!pricesRes.ok) throw new Error("Failed to fetch lowest prices");
      const pricesMap = await pricesRes.json();

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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
  <div class="max-w-4xl mx-auto">
    
    <div class="flex items-center justify-between mb-6">
      <a href="/" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all lists
      </a>
      <h1 class="text-2xl sm:text-3xl font-bold text-center flex-1">List: <span class="text-blue-600 dark:text-blue-400">{listName}</span></h1>
    </div>
    
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <p class="text-lg text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    {:else if error}
      <div class="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg">
        <p class="font-medium">Error: {error}</p>
      </div>
    {:else if items.length === 0}
      <div class="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
        <p>No items in this list.</p>
      </div>
    {:else}
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th scope="col" class="py-3 px-4 sm:px-6">Item</th>
              <th scope="col" class="py-3 px-4 sm:px-6">Lowest Price</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item, i}
              <tr class="border-b transition-colors duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 {i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}">
                <td class="py-4 px-4 sm:px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <a href={`https://www.discogs.com/release/${item.id}`} target="_blank" rel="noopener noreferrer" class="hover:underline">
                    {item.display_title}
                  </a>
                </td>
                <td class="py-4 px-4 sm:px-6 font-semibold">
                  {item.lowest_price ? `${item.lowest_price}€` : 'NA'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>