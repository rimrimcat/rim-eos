<script>
	import { createEventDispatcher } from 'svelte';
	import {
		navItems,
		activeComponent,
		isCollapsed,
		componentRegistry
	} from '$lib/scripts/componentMetadata.svelte.ts';
	import { ArrowLeftToLine, Menu } from '@lucide/svelte';

	// Debug log
	$: console.log('Nav Items:', $navItems);
	$: console.log('Component Registry:', $componentRegistry);

	const dispatch = createEventDispatcher();

	function toggleCollapse() {
		$isCollapsed = !$isCollapsed;
		dispatch('toggleCollapse', { isCollapsed: $isCollapsed });
	}

	function selectComponent(id) {
		$activeComponent = id;
	}
</script>

<div class="toolbar" class:collapsed={$isCollapsed}>
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
		display: flex;
		flex-direction: column;
		background-color: #1a1a1a;
		color: #ffffff;
		height: 100%;
		transition: width 0.3s ease;
		width: 13.75em;
		border-radius: 1em;
	}

	.toolbar.collapsed {
		width: 3.75em;
	}
	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1em;
		border-bottom: 0.0625em solid #2a2a2a;
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		width: 2.2em;
		height: 2.2em;
		vertical-align: bottom;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: left;
		padding: 1em;
		border-bottom: 0.0625em solid #2a2a2a;
	}

	.logo {
		display: flex;
		flex: 1;
		justify-content: center;
		text-align: right;
		font-weight: bold;
		font-size: 1.2em;
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 0.25em;
	}

	.toolbar-nav {
		display: flex;
		flex-direction: column;
		padding: 1em 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		padding: 0.75em 1em;
		background: none;
		border: none;
		color: #aaaaaa;
		cursor: pointer;
		text-align: left;
		transition: all 1s ease;
		font-size: 1em;
		/* border-left: 0.1875em solid transparent; */
	}

	.nav-item:hover {
		background-color: #2a2a2a;
		color: #ffffff;
	}

	.nav-item.active {
		background-color: #2a2a2a;
		color: #ffffff;
		border-left: 0.1875em solid #4c9aff;
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 0.75em;
	}

	.nav-label {
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		transition: opacity 0.3s ease;
	}
</style>
