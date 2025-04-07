<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import Dialog from './Dialog.svelte';
	import GearPage from './nav/GearPage.svelte';
	import MainPage from './nav/MainPage.svelte';
	import OpenCvTest from './nav/OpenCvTest.svelte';
	import StatPage from './nav/StatPage.svelte';
	import Toolbar from './Toolbar.svelte';

	// Toolbar
	let isCollapsed = $state(true);
	let mobileToolbarTransform = $state(0);

	// Detect if mobile
	let fontSize = $state(0);
	let innerWidth = $state(1000);
	let isMobile = $derived((13.75 * fontSize) / innerWidth > 0.25);

	// Active Nav
	const navMap: Record<string, Component> = {
		'main-page': MainPage,
		'stat-page': StatPage,
		'gear-page': GearPage,
		'opencv-test': OpenCvTest
	};
	let activeComponent = $state('main-page');
	let CurrentComponent: Component = $derived(navMap[activeComponent] || StatPage);

	// Other stuff
	let dialogOpen = $state(true);

	// COLOR SCHEMEEEEE
	let styles = $state({
		'main-bg-color': '#2F2F37',
		// Base colors
		'bg-color': '#38383E',
		// 'bg-color': '#1e1e2e',
		'text-color': '#cdd6f4',
		'title-color': '#cba6f7',
		'border-color': '#7A7B84',

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
		'toolbar-border': '#FFFFFFA5',
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

	onMount(() => {
		fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	});

	$effect(() => {
		const root = document.documentElement;
		Object.entries(styles).forEach(([key, value]) => {
			root.style.setProperty(`--${key}`, value);
		});
	});

	$inspect('mobile detection:', isMobile);
	$inspect('innerWidth', innerWidth);
</script>

<svelte:window bind:innerWidth />

<Dialog
	bind:open={dialogOpen}
	title="Note"
	blocking={true}
	blur={true}
	closable={true}
	buttons={['OK', 'Cancel']}
>
	<h3>This WebApp is under development</h3>
	<p>Will be missing some features.</p>
</Dialog>

<div class="app-container">
	<Toolbar bind:isMobile bind:activeComponent bind:isCollapsed bind:mobileToolbarTransform />

	<div
		class="content-container"
		class:mobile={isMobile}
		style="translate: 0 {isMobile ? mobileToolbarTransform : 0}px;"
	>
		<div style="display: none">
			<MainPage />
			<StatPage />
			<GearPage />
			<OpenCvTest />
		</div>

		<CurrentComponent bind:isMobile />
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		/* background-color: var(--bg-color); */
		color: var(--text-color);
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			'Helvetica Neue',
			sans-serif;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		color: var(--title-color);
	}

	:global(button) {
		background-color: var(--button-bg);
		color: var(--button-text);
		border: 1px solid var(--button-border);
		border-radius: 4px;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	:global(button.collapse-toggle) {
		padding: 0 0;
	}

	:global(button:hover) {
		background-color: var(--button-hover-bg);
	}

	:global(button.primary) {
		background-color: var(--button-primary-bg);
		color: var(--button-primary-text);
		border: 1px solid var(--button-primary-border);
	}

	:global(button.primary:hover) {
		background-color: var(--button-primary-hover-bg);
	}

	/* for buttons that contain lucide icons */
	:global(button.icon) {
		background-color: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}

	:global(button.icon:hover) {
		opacity: 1;
	}

	/* for buttons that contain images*/
	:global(button.image) {
		background-color: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: opacity 0.3s ease;
		opacity: 1;
	}

	:global(*:focus-visible) {
		outline: 2px solid var(--focus-outline);
		outline-offset: 2px;
	}

	:global(img.user-upload) {
		max-width: 80vw;
		max-height: 60vh;
		border-radius: 1rem;
	}

	.app-container {
		display: flex;
		height: 100vh;
		overflow: hidden;
		background-color: var(--bg-color);
		color: var(--text-color);
		overscroll-behavior-x: none;
	}

	.content-container {
		flex: 1;
		display: flex;
		overflow-y: scroll;
		overflow-x: hidden;
		padding-left: 1rem;
		padding-right: 5rem;
		transition: translate 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.content-container.mobile {
		margin-top: 3rem;
	}
</style>
