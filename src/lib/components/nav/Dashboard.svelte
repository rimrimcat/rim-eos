<script>
	import { onMount } from 'svelte';
	import ComponentTools from '../NavTools.svelte';
	import { registerComponent } from '$lib/scripts/componentMetadata.svelte.ts';

	// Component ID
	const id = 'dashboard';

	// Define this component's metadata including tools
	const metadata = {
		id,
		label: 'Dashboard',
		icon: 'grid',
		showInNav: true,
		order: 0, // First item
		tools: [
			{ id: 'refresh', label: 'Refresh', icon: 'refresh-cw' },
			{ id: 'filter', label: 'Filter', icon: 'filter' }
		]
	};

	onMount(() => {
		// Register only once on mount
		registerComponent(id, metadata);
	});
</script>

<div class="dashboard-container">
	<div class="dashboard-content">
		<h1>Dashboard</h1>
		<div class="dashboard-grid">
			<div class="dashboard-card">
				<h3>Users</h3>
				<div class="metric">12,345</div>
			</div>
			<div class="dashboard-card">
				<h3>Revenue</h3>
				<div class="metric">$45,678</div>
			</div>
			<div class="dashboard-card">
				<h3>Active Sessions</h3>
				<div class="metric">1,234</div>
			</div>
			<div class="dashboard-card">
				<h3>Conversion Rate</h3>
				<div class="metric">12.3%</div>
			</div>
		</div>
	</div>

	<ComponentTools tools={metadata.tools} />
</div>

<style>
	.dashboard-container {
		display: flex;
		height: 100%;
	}

	.dashboard-content {
		flex: 1;
		padding: 20px;
		overflow-y: auto;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 20px;
		margin-top: 20px;
	}

	.dashboard-card {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.metric {
		font-size: 28px;
		font-weight: bold;
		margin-top: 10px;
		color: #2c5282;
	}
</style>
