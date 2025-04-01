<script>
	import { activeComponent } from '$lib/scripts/navigation.ts';
	import Toolbar from './Toolbar.svelte';

	// Components to display
	import Dashboard from './nav/Dashboard.svelte';
	import Analytics from './nav/Analytics.svelte';
	import Settings from './nav/Settings.svelte';

	// Import all components to ensure they're registered on mount
	// (even if they're not immediately displayed)

	// Map of component IDs to component definitions
	const componentMap = {
		dashboard: Dashboard,
		analytics: Analytics,
		settings: Settings
	};

	// Get current component
	$: currentComponent = componentMap[$activeComponent] || Dashboard;
</script>

<div class="app-container">
	<Toolbar />

	<div class="content-container">
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
