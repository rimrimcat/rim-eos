<script lang="ts">
	import { navItems } from '$lib/scripts/navMetadata.svelte.ts';
	import { ArrowLeftToLine, ChevronDown, ChevronUp, Menu } from '@lucide/svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly, slide } from 'svelte/transition';

	let {
		isMobile = $bindable(false),
		activeComponent = $bindable('stat-page'),
		isCollapsed = $bindable(false),
		mobileToolbarTransform = $bindable(0)
	} = $props();

	const DEFAULT_ACTIVE_COMPONENT = 'stat-panel' as const;
	let scrollY = $state(0);
	let toolbarWidth = $state(0);
	let offsetHeight = $state(0);
	let collapsedHeight = $state(0);

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function selectComponent(id: string) {
		activeComponent = id;
		if (isMobile && !isCollapsed) {
			isCollapsed = true;
		}
	}

	function setCollapsedHeight() {
		if (collapsedHeight === 0) {
			collapsedHeight = offsetHeight;
		}
	}

	$effect(() => {
		setCollapsedHeight();
		mobileToolbarTransform = offsetHeight - collapsedHeight;
	});
</script>

<svelte:window bind:scrollY />

{#if isMobile}
	<div class="mobile-toolbar" bind:offsetHeight>
		<div class="mobile-header">
			<button class="collapse-toggle" onclick={toggleCollapse}>
				{#if isCollapsed}
					<ChevronDown />
				{:else}
					<ChevronUp />
				{/if}
			</button>
			<div class="logo">
				<span class="logo-text">GearComp</span>
			</div>
		</div>

		{#if !isCollapsed}
			<div transition:slide={{ duration: 300, easing: cubicOut }}>
				<nav class="mobile-nav">
					{#each $navItems as item, i}
						<button
							class="nav-item mobile-item"
							class:active={activeComponent === item.id}
							onclick={() => selectComponent(item.id ?? DEFAULT_ACTIVE_COMPONENT)}
							in:fly={{ y: 20, delay: i * 50, duration: 250, easing: cubicOut }}
							out:fade={{ duration: 150 }}
						>
							<div class="nav-icon">
								{#if item.lucide}
									<item.lucide />
								{/if}
							</div>
							<span class="nav-label">{item.label}</span>
						</button>
					{/each}
				</nav>
			</div>
		{/if}
	</div>
{:else}
	<div
		class="toolbar"
		class:collapsed={isCollapsed}
		style="translate: 0 {scrollY}px; height: {5.5 + 4 * $navItems.length}rem;"
		bind:offsetWidth={toolbarWidth}
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
					<span class="logo-text" in:fade={{ duration: 200 }}>GearComp</span>
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
						<span class="nav-label" in:fade={{ duration: 200 }}>
							{item.label}
						</span>
					{/if}
				</button>
			{/each}
		</nav>
	</div>
{/if}

<style>
	.toolbar {
		position: sticky;
		top: 1rem;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-color);
		color: var(--text-color);
		transition:
			width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
			translate 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		width: 13.75rem;
		border-radius: 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
		z-index: 10;
		overflow: hidden;
	}

	.toolbar.collapsed {
		width: 3.75rem;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 0.0625rem solid var(--border-color);
	}

	.toolbar-nav {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
	}

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
