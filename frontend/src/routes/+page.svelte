<script lang="ts">
  import { onMount } from "svelte";
  import type { DiscogsList } from "$lib/types";

  let username = $state('');
  let lists: DiscogsList[] = $state([]);
  let loading: boolean = $state(false);
  let error: string | null = null;
  const url = 'https://discogs-lowest-price-tool-node.onrender.com' //'http://localhost:3000'
  
  async function search() {
    try {
      loading = true;
      error = null; // Clear previous errors
      const res = await fetch(`${url}/api/get-lists?username=${username}`);
      if (!res.ok) {
        throw new Error("Failed to fetch lists. The user may not exist or has no public lists.");
      }
      lists = (await res.json()) as DiscogsList[];
    } catch (e: any) {
      error = e.message ?? "An unknown error occurred.";
      lists = []; // Clear lists on error
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
  <div class="max-w-2xl w-full bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">

    <div class="text-center">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
        Find Discogs Lists
      </h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Enter a Discogs username to find their public lists.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4">
      <input
        type="text"
        placeholder="Enter Discogs username"
        bind:value={username}
        class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
        on:keydown={(e) => { if (e.key === 'Enter') search() }}
      />
      <button
        on:click={search}
        disabled={!username || loading}
        class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {#if loading}
          Searching...
        {:else}
          Search
        {/if}
      </button>
    </div>
    
    <div class="relative min-h-24">
      {#if loading}
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      {:else if error}
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg shadow-inner">
          <p class="font-medium">{error}</p>
        </div>
      {:else if lists.length === 0}
        <div class="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg shadow-inner">
          <p>No lists found for this user.</p>
        </div>
      {:else}
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Public Lists for "{username}"
        </h2>
        <ul class="space-y-3">
          {#each lists as list}
            <li class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <a
                class="block font-medium text-lg text-blue-600 dark:text-blue-400 hover:underline"
                href={`/lists/${list.id}`}
              >
                {list.name}
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400 block mt-1">
                  <!-- ({list.item_count} items) -->
                </span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>