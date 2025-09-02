<script lang="ts">
  import { onMount } from "svelte";
  import type { DiscogsList } from "$lib/types";
  let username = $state('');
  let lists: DiscogsList[] = [];
  let loading: boolean = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/get-lists?username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch lists");
      debugger
      lists = (await res.json()) as DiscogsList[];
    } catch (e: any) {
      error = e.message ?? "Unknown error";
    } finally {
      loading = false;
    }
  });
</script>

<input value={username} />
<h1 class="text-xl font-bold mb-4">Discogs Lists</h1>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else if lists.length === 0}
  <p>No lists found.</p>
{:else}
  <ul class="space-y-2">
    {#each lists as list}
      <li>
        <a class="text-blue-600 underline" href={`/lists/${list.id}`}>
          {list.name}
        </a>
      </li>
    {/each}
  </ul>
{/if}
