<script lang="ts">
	import { registerComponent, type ComponentMetadata } from '$lib/scripts/nav-metadata';
	import { AppWindowIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	// register
	const id = 'main-page';
	const metadata: ComponentMetadata = {
		id,
		label: 'Main Page',
		lucide: AppWindowIcon,
		showInNav: true,
		order: 0,
		actions: []
	};

	onMount(() => {
		registerComponent(id, metadata);
	});
</script>

<div class="main-page">
	<h1>Dashboard</h1>
	<p>This page is under construction!</p>
</div>

<style>
	.main-page {
		padding: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
	}
</style>
