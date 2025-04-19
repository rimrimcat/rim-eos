<script lang="ts">
	import { is_mobile, toolbar_transform } from '$lib/scripts/stores';
	import {
		AppWindowIcon,
		BoxIcon,
		ChartNoAxesColumnIcon,
		ChevronDown,
		ChevronUp,
		ShirtIcon
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly, slide } from 'svelte/transition';

	type NavIds = 'main-page' | 'loadout-page' | 'gear-page' | 'stat-page';
	type NavItem = {
		id: NavIds;
		label: string;
		lucide: Component;
		import_name: string;
	};

	const NAV_ITEMS: NavItem[] = [
		{
			id: 'main-page',
			label: 'Main Page',
			lucide: AppWindowIcon,
			import_name: 'MainPage'
		},
		{
			id: 'loadout-page',
			label: 'Loadout',
			lucide: BoxIcon,
			import_name: 'LoadoutPage'
		},
		{
			id: 'gear-page',
			label: 'Gears',
			lucide: ShirtIcon,
			import_name: 'GearPage'
		},
		{
			id: 'stat-page',
			label: 'Stats',
			lucide: ChartNoAxesColumnIcon,
			import_name: 'StatPage'
		}
	];

	let { active_component = $bindable({} as NavItem), is_collapsed = $bindable(false) } = $props();

	let offset_height = $state(0);
	let collapsed_height = $state(0);

	function toggleCollapse() {
		is_collapsed = !is_collapsed;
	}

	function selectComponent(nav_item: NavItem) {
		active_component = nav_item;
		if ($is_mobile && !is_collapsed) {
			is_collapsed = true;
		}
	}

	function setCollapsedHeight() {
		if (collapsed_height === 0) {
			collapsed_height = offset_height;
		}
	}

	$effect(() => {
		setCollapsedHeight();
		$toolbar_transform = offset_height - collapsed_height;
	});
</script>

<div class="mobile-toolbar" bind:offsetHeight={offset_height}>
	<div class="mobile-header">
		<button class="collapse-toggle" onclick={toggleCollapse} id="toolbar-collapse-toggle">
			{#if is_collapsed}
				<ChevronDown />
			{:else}
				<ChevronUp />
			{/if}
		</button>
		<div class="logo">
			<span class="logo-text">Rim EOS</span>
		</div>
	</div>

	{#if !is_collapsed}
		<div transition:slide={{ duration: 300, easing: cubicOut }}>
			<nav class="mobile-nav">
				{#each NAV_ITEMS as nav_item, i}
					<button
						class="nav-item mobile-item"
						class:active={active_component.id === nav_item.id}
						id={`nav-item-${nav_item.id}`}
						onclick={() => selectComponent(nav_item)}
						in:fly={{ y: 20, delay: i * 50, duration: 250, easing: cubicOut }}
						out:fade={{ duration: 150 }}
					>
						<div class="nav-icon">
							{#if nav_item.lucide}
								<nav_item.lucide />
							{/if}
						</div>
						<span class="nav-label">{nav_item.label}</span>
					</button>
				{/each}
			</nav>
		</div>
	{/if}
</div>

<style>
	.mobile-toolbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-color);
		color: var(--text-color);
		border-radius: 0 0 1rem 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
		z-index: 100;
		overflow: hidden;
	}

	.mobile-header {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 0.0625rem solid var(--border-color);
	}

	.mobile-nav {
		display: flex;
		flex-direction: row;
		justify-content: center;
		flex-wrap: wrap;
		padding: 0.5rem;
		max-height: 40vh;
		overflow-y: auto;
	}

	/* Common Styles */
	.collapse-toggle {
		background: none;
		border: none;
		display: flex;
		color: var(--text-color);
		cursor: pointer;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		vertical-align: bottom;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.collapse-toggle:hover {
		background-color: var(--hover-bg);
		border-radius: 0.25rem;
		transform: scale(1.1);
	}

	.collapse-toggle:active {
		transform: scale(0.95);
	}

	.logo {
		display: flex;
		flex: 1;
		justify-content: center;
		text-align: right;
		font-weight: bold;
		font-size: 1.2rem;
		color: var(--title-color);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.nav-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		text-align: left;
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		font-size: 1rem;
		opacity: 0.7;
	}

	.mobile-item {
		flex-direction: column;
		padding: 0.5rem;
		margin: 0.25rem;
		min-width: 4.5rem;
		border-radius: 0.5rem;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.nav-item:hover {
		background-color: var(--hover-bg);
		color: var(--text-color);
		opacity: 1;
		transform: translateY(-2px);
	}

	.mobile-item:active {
		transform: scale(0.95);
	}

	.nav-item.active {
		background-color: var(--active-bg);
		color: var(--text-color);
		opacity: 1;
	}

	.nav-item.active:not(.mobile-item) {
		border-left: 0.1875rem solid var(--focus-outline);
	}

	.nav-item.active.mobile-item {
		border-bottom: 0.1875rem solid var(--focus-outline);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.mobile-item:hover .nav-icon {
		transform: scale(1.1);
	}

	.mobile-item .nav-icon {
		margin-right: 0;
		margin-bottom: 0.25rem;
	}

	.nav-item:not(.mobile-item) .nav-icon {
		margin-right: 0.75rem;
	}

	.nav-label {
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		transition: opacity 0.3s ease;
		font-size: 0.875rem;
	}
</style>
