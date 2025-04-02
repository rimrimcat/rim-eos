<script lang="ts">
	import { activeComponent } from '$lib/scripts/navMetadata.svelte.ts';
	import Toolbar from './Toolbar.svelte';
	import Dialog from './Dialog.svelte';

	// Components to display
	import StatPanel from './nav/StatPanel.svelte';
	import OpenCvTest from './nav/OpenCvTest.svelte';
	import type { Component } from 'svelte';

	// Map of component IDs to component definitions
	const componentMap = {
		'stat-panel': StatPanel,
		'opencv-test': OpenCvTest
	};

	// Other stuff
	let dialogOpen = $state(true);
	const CurrentComponent: Component = $derived(componentMap[$activeComponent] || StatPanel);
</script>

<Dialog
	bind:open={dialogOpen}
	title="WARNINGGGGG"
	blocking={true}
	blur={true}
	closable={true}
	buttons={['OK', 'Cancel']}
>
	<h3>Not Important Information</h3>
	<p>Go on.</p>
</Dialog>

<div class="app-container">
	<Toolbar />

	<div class="content-container">
		<div style="display: none">
			<StatPanel />
			<OpenCvTest />
		</div>

		<CurrentComponent />
	</div>
</div>

<style>
	.app-container {
		display: flex;
		height: 100vh;
		overflow: hidden;
	}

	.content-container {
		flex: 1;
		display: flex;
		overflow: hidden;
		/* left: 60px; */
	}
</style>
