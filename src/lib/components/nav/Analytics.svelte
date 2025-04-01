<script>
	import { onMount } from 'svelte';
	import ComponentTools from '../NavTools.svelte';
	import { registerComponent } from '$lib/scripts/componentMetadata.svelte.ts';

	// Component ID
	const id = 'analytics';

	// Define this component's metadata including tools
	const metadata = {
		id,
		label: 'Analytics',
		icon: 'bar-chart',
		showInNav: true,
		order: 1,
		tools: [
			{ id: 'download', label: 'Download', icon: 'download' },
			{ id: 'share', label: 'Share', icon: 'share' }
		]
	};

	onMount(() => {
		registerComponent(id, metadata);
	});
</script>

<div class="analytics-container">
	<div class="analytics-content">
		<h1>Analytics</h1>
		<div class="chart-container">
			<div class="chart-header">
				<h3>User Growth</h3>
			</div>
			<div class="chart-placeholder">
				<p>Chart visualization would go here</p>
			</div>
		</div>

		<div class="chart-container">
			<div class="chart-header">
				<h3>Revenue Trends</h3>
			</div>
			<div class="chart-placeholder">
				<p>Chart visualization would go here</p>
			</div>
		</div>
	</div>

	<ComponentTools tools={metadata.tools} />
</div>

<style>
	.analytics-container {
		display: flex;
		height: 100%;
	}

	.analytics-content {
		flex: 1;
		padding: 20px;
		overflow-y: auto;
	}

	.chart-container {
		background-color: white;
		border-radius: 8px;
		margin-bottom: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.chart-header {
		padding: 15px 20px;
		border-bottom: 1px solid #e0e0e0;
	}

	.chart-placeholder {
		height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f9f9f9;
		color: #666;
	}
</style>
