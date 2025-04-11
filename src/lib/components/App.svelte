<script lang="ts">
	import type { GearView, UserGear } from '$lib/scripts/gears';
	import { loadObject, openImageDB } from '$lib/scripts/loader';
	import type { AllLoadouts } from '$lib/scripts/loadouts';
	import { onMount, type Component } from 'svelte';
	import Dialog from './Dialog.svelte';
	import GearPage, { createGearView } from './nav/GearPage.svelte';
	import LoadoutPage from './nav/LoadoutPage.svelte';
	import MainPage from './nav/MainPage.svelte';
	import StatPage from './nav/StatPage.svelte';
	import Toolbar from './Toolbar.svelte';

	// Toolbar
	let is_collapsed = $state(true);
	let mobile_toolbar_transform = $state(0);

	// Detect if mobile
	let font_size = $state(0);
	let inner_width = $state(1000);
	let is_mobile = $derived((13.75 * font_size) / inner_width > 0.25);

	// Active Nav
	const NAV_MAP: Record<string, Component> = {
		'main-page': MainPage,
		'loadout-page': LoadoutPage,
		'stat-page': StatPage,
		'gear-page': GearPage
	};
	let active_component = $state('main-page');
	let CurrentComponent: Component = $derived(NAV_MAP[active_component] || StatPage);

	// Dialogs
	let dialog_open = $state(true);

	// color scheme
	let styles = $state({});

	// synced data across app
	let user_gears: UserGear[] = $state([]);
	let user_loadouts: AllLoadouts = $state({});
	let current_loadout: string = $state('');
	let gear_views: GearView[] = $state([]);

	onMount(() => {
		// get font size
		font_size = parseFloat(getComputedStyle(document.documentElement).fontSize);

		// setup imagedb
		openImageDB();

		// load styles
		const _styles = loadObject('styles');
		const root = document.documentElement;
		Object.entries(_styles).forEach(([key, value]) => {
			root.style.setProperty(`--${key}`, value);
		});
		styles = _styles;

		// load synced
		user_gears = loadObject('gears_v1');
		user_loadouts = loadObject('loadouts_v1');
		current_loadout = Object.keys(user_loadouts)[0];

		// processing
		Promise.all(
			user_gears.map((gear) => createGearView(gear, false, user_loadouts, current_loadout))
		).then((gearViews) => {
			gear_views = gearViews;
			console.log('Done processing user_gears');
		});
	});

	// $inspect('mobile detection:', isMobile);
	// $inspect('innerWidth', innerWidth);
</script>

<svelte:window bind:innerWidth={inner_width} />

<Dialog
	bind:open={dialog_open}
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
	<Toolbar bind:is_mobile bind:active_component bind:is_collapsed bind:mobile_toolbar_transform />

	<div
		class="content-container"
		class:mobile={is_mobile}
		style="translate: 0 {is_mobile ? mobile_toolbar_transform : 0}px;"
	>
		<div style="display: none">
			<MainPage />
			<LoadoutPage />
			<StatPage />
			<GearPage />
		</div>

		<CurrentComponent
			bind:isMobile={is_mobile}
			bind:user_gears
			bind:user_loadouts
			bind:current_loadout
			bind:gear_views
		/>
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

	/* for buttons that contain icons and responsive */
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

	/* for buttons that contain image */
	:global(button.image) {
		background-color: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		opacity: 1;
	}

	/* buttons with border since they have label text */
	:global(button.border) {
		display: flex;
		background: none;
		border: 2px solid var(--border-color);
		border-radius: 0.5rem;
		cursor: pointer;
		padding: 0.5rem;
		height: 100%;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	/* :global(div.column) {
		display: grid;
		flex-direction: column;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
	} */

	:global(input) {
		background-color: var(--button-bg);
		border: 1px solid var(--button-border);
		border-radius: 0.5rem;
		color: var(--button-text);
		padding: 2px 6px;
		font-size: large;
	}

	:global(.horizontal) {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	:global(.horizontal.center) {
		justify-content: center;
	}

	:global(div.hori-item) {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(div.vertical) {
		display: flex;
		flex-direction: column;
	}

	:global(div.vertical-left) {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	:global(div.item-flex) {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(div.equispace) {
		justify-content: space-around;
	}

	:global(div.full) {
		width: 100%;
		height: 100%;
	}

	:global(div.full-width) {
		width: 100%;
	}

	:global(div.full-height) {
		height: 100%;
	}

	:global(div.block) {
		display: block;
		padding: 1rem;
		width: 100%;
	}

	:global(div.noslider) {
		overflow-x: hidden;
		overflow-y: hidden;
	}

	:global(div.noslider-x) {
		overflow-x: hidden;
	}

	/* add opacity transition when hovering */
	:global(button.hover) {
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	:global(button.hover:hover) {
		opacity: 1;
	}

	/* labels inside button */
	:global(label.in-button) {
		/* display: flex; */
		cursor: pointer;
		text-align: center;
		vertical-align: middle;
		pointer-events: none;
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
		padding-right: 6rem;
		transition: translate 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.content-container.mobile {
		margin-top: 3rem;
	}

	/* specific for attribute icons */
	:global(.attribute-icon) {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.attribute-icon img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: none;
		filter: invert(75%);
	}
</style>
