<script lang="ts">
	import { fade } from 'svelte/transition';

	let app: Promise<any> | null = $state(null);
	let signal = $state(false);

	async function load() {
		app = import('$lib/components/App.svelte');
	}
	load();

	$inspect('signal', signal);
</script>

{#if !signal}
	<div class="loading" transition:fade={{ duration: 1000 }}>
		<p>This is supposed to be a loading page...</p>
	</div>
{/if}

{#await app then { default: App }}
	<div transition:fade={{ duration: 1000 }}>
		<App bind:signal />
	</div>
{/await}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		background-color: #2f2f37;
		font-family: Arial, Helvetica, sans-serif;
		color: #cdd6f4;
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
