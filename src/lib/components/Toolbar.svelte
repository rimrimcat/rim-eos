<script>
	import { createEventDispatcher } from 'svelte';
	import { navItems, activeComponent, isCollapsed } from '$lib/scripts/componentMetadata.svelte.ts';
	import { ArrowLeftToLine, Menu } from '@lucide/svelte';

	const dispatch = createEventDispatcher();
	let scrollY = 0;

	function toggleCollapse() {
		$isCollapsed = !$isCollapsed;
		dispatch('toggleCollapse', { isCollapsed: $isCollapsed });
	}

	function selectComponent(id) {
		$activeComponent = id;
	}
</script>

<svelte:window bind:scrollY />
<div
	class="toolbar"
	class:collapsed={$isCollapsed}
	style="translate: 0px {scrollY}px; height: {5.5 + 4 * $navItems.length}rem"
>
	<div class="toolbar-header">
		<button class="collapse-toggle" on:click={toggleCollapse}>
			{#if $isCollapsed}
				<Menu />
			{:else}
				<ArrowLeftToLine />
			{/if}
		</button>

		<div class="logo">
			{#if !$isCollapsed}
				<span class="logo-text">GearComp</span>
			{/if}
		</div>
	</div>

	<nav class="toolbar-nav">
		{#each $navItems as item}
			<button
				class="nav-item"
				class:active={$activeComponent === item.id}
				on:click={() => selectComponent(item.id)}
			>
				<div class="nav-icon">
					{#if item.lucide}
						<svelte:component this={item.lucide} />
					{/if}
				</div>
				{#if !$isCollapsed}
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
		background-color: #1a1a1a;
		color: #ffffff;
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		width: 13.75rem;
		border-radius: 1rem;
	}

	.toolbar.collapsed {
		width: 3.75rem;
	}
	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 0.0625rem solid #2a2a2a;
	}

	.collapse-toggle {
		background: none;
		border: none;
		display: flex;
		color: #ffffff;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		vertical-align: bottom;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: left;
		padding: 1rem;
		border-bottom: 0.0625rem solid #2a2a2a;
	}

	.logo {
		display: flex;
		flex: 1;
		justify-content: center;
		text-align: right;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 0.25rem;
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
		color: #aaaaaa;
		cursor: pointer;
		text-align: left;
		transition: all 0.3s ease;
		font-size: 1rem;
	}

	.nav-item:hover {
		background-color: #2a2a2a;
		color: #ffffff;
	}

	.nav-item.active {
		background-color: #2a2a2a;
		color: #ffffff;
		border-left: 0.1875rem solid #4c9aff;
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
