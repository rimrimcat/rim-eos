<script>
	import { activeComponent } from '$lib/scripts/componentMetadata.svelte.ts';
	import Toolbar from './Toolbar.svelte';

	// Components to display
	import StatPanel from './nav/StatPanel.svelte';

	// Map of component IDs to component definitions
	const componentMap = {
		'stat-panel': StatPanel
	};

	// Get current component
	// $: currentComponent = componentMap[$activeComponent] || StatPanel;
	$: currentComponent = componentMap[$activeComponent] || StatPanel;
</script>

<div class="app-container">
	<Toolbar />

	<div class="content-container">
		<!-- Mount all components but only show the active one -->
		<div style="display: none">
			<StatPanel />
		</div>

		<svelte:component this={currentComponent} />
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
	}
</style>
