<script lang="ts">
	import { navItems } from '$lib/scripts/navMetadata.svelte.ts';
	import { ArrowLeftToLine, Menu } from '@lucide/svelte';

	let { isMobile = $bindable(false), activeComponent = $bindable('stat-page') } = $props();

	const DEFAULT_ACTIVE_COMPONENT = 'stat-panel' as const;
	let isCollapsed = $state(false);
	let scrollY = $state(0); // is this even still needed?

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function selectComponent(id: string) {
		activeComponent = id;
	}
</script>

<svelte:window bind:scrollY />
<div
	class="toolbar"
	class:mobile={isMobile}
	class:collapsed={isCollapsed}
	style="translate: 0px {scrollY}px; height: {5.5 + 4 * $navItems.length}rem"
>
	<div class="toolbar-header">
		<button class="collapse-toggle" onclick={toggleCollapse}>
			{#if isCollapsed}
				<Menu />
			{:else}
				<ArrowLeftToLine />
			{/if}
		</button>

		<div class="logo">
			{#if !isCollapsed}
				<span class="logo-text">GearComp</span>
			{/if}
		</div>
	</div>

	<nav class="toolbar-nav">
		{#each $navItems as item}
			<button
				class="nav-item"
				class:active={activeComponent === item.id}
				onclick={() => selectComponent(item.id ?? DEFAULT_ACTIVE_COMPONENT)}
			>
				<div class="nav-icon">
					{#if item.lucide}
						<item.lucide />
					{/if}
				</div>
				{#if !isCollapsed}
					<span class="nav-label">{item.label}</span>
				{/if}
			</button>
		{/each}
	</nav>
</div>

<style>
	.toolbar {
		position: sticky;
		top: 1rem;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-color);
		color: var(--text-color);
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		width: 13.75rem;
		border-radius: 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
	}

	.toolbar.mobile {
		position: sticky;
		top: 0rem;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-color);
		color: var(--text-color);
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		width: 13.75rem;
		border-radius: 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
	}

	.toolbar.collapsed {
		width: 3.75rem;
	}

	.toolbar.mobile.collapsed {
		position: fixed;
		left: -4rem;
		/* translate: -3.75rem 10rem; */
		width: 3.75rem;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 0.0625rem solid var(--border-color);
	}

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
	}

	.collapse-toggle:hover {
		background-color: var(--hover-bg);
		border-radius: 0.25rem;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: left;
		padding: 1rem;
		border-bottom: 0.0625rem solid var(--border-color);
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

	.toolbar-nav {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
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
		transition: all 0.3s ease;
		font-size: 1rem;
		opacity: 0.7;
	}

	.nav-item:hover {
		background-color: var(--hover-bg);
		color: var(--text-color);
		opacity: 1;
	}

	.nav-item.active {
		background-color: var(--active-bg);
		color: var(--text-color);
		border-left: 0.1875rem solid var(--focus-outline);
		opacity: 1;
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.75rem;
	}

	.nav-label {
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		transition: opacity 0.3s ease;
	}
</style>
