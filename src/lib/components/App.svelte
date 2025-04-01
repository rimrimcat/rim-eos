<script>
	import { activeComponent, isCollapsed } from '$lib/scripts/componentMetadata.svelte.ts';
	import Toolbar from './Toolbar.svelte';

	// Components to display
	import StatPanel from './nav/StatPanel.svelte';

	// Map of component IDs to component definitions
	const componentMap = {
		'stat-panel': StatPanel
	};

	$: currentComponent = componentMap[$activeComponent] || StatPanel;
</script>

<div class="app-container">
	<Toolbar />

	<div class="content-container">
		<div style="display: none">
			<StatPanel />
		</div>
		<!-- style="left: {$isCollapsed ? '3.75em' : '13.75em'}" -->

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
		left: 60px;
	}
</style>
