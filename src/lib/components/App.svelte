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

	// COLOR SCHEMEEEEE
	let styles = $state({
		// Base colors
		'bg-color': '#1e1e2e',
		'text-color': '#cdd6f4',
		'title-color': '#cba6f7',
		'border-color': '#313244',

		// Button colors
		'button-bg': '#313244',
		'button-text': '#cdd6f4',
		'button-border': '#45475a',
		'button-hover-bg': '#45475a',

		// Primary button colors
		'button-primary-bg': '#89b4fa',
		'button-primary-text': '#1e1e2e',
		'button-primary-border': '#74c7ec',
		'button-primary-hover-bg': '#74c7ec',

		// Interactive elements
		'hover-bg': '#313244',
		'active-bg': '#45475a',
		'focus-outline': '#89b4fa',

		// Overlay and shadows
		'overlay-bg': 'rgba(0, 0, 0, 0.5)',
		'shadow-color': 'rgba(0, 0, 0, 0.4)',

		// Status colors
		'error-color': '#f38ba8',
		'success-color': '#a6e3a1',
		'warning-color': '#f9e2af',
		'info-color': '#89dceb'
	});

	$effect(() => {
		const root = document.documentElement;
		Object.entries(styles).forEach(([key, value]) => {
			root.style.setProperty(`--dialog-${key}`, value);
		});
	});
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
