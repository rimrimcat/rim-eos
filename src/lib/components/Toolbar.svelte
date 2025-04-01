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
		<div class="logo">
			{#if !$isCollapsed}
				<span class="logo-text">MyApp</span>
			{/if}
		</div>
		<button class="collapse-toggle" on:click={toggleCollapse}>
			{#if $isCollapsed}
				<Menu />
			{:else}
				<ArrowLeftToLine />
			{/if}
		</button>
	</div>

	<nav class="toolbar-nav">
		{#each $navItems as item}
			<button
				class="nav-item"
				class:active={$activeComponent === item.id}
				on:click={() => selectComponent(item.id)}
			>
				<div class="nav-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						{#if item.lucide}
							<svelte:component this={item.lucide} />
						{/if}
					</svg>
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
		width: 220px;
	}

	.toolbar.collapsed {
		width: 60px;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #2a2a2a;
	}

	.logo {
		display: flex;
		align-items: center;
		font-weight: bold;
		font-size: 18px;
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 4px;
	}

	.toolbar-nav {
		display: flex;
		flex-direction: column;
		padding: 16px 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		background: none;
		border: none;
		color: #aaaaaa;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s ease;
		border-left: 3px solid transparent;
	}

	.nav-item:hover {
		background-color: #2a2a2a;
		color: #ffffff;
	}

	.nav-item.active {
		background-color: #2a2a2a;
		color: #ffffff;
		border-left: 3px solid #4c9aff;
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
	}

	.nav-label {
		flex: 1;
	}
</style>
