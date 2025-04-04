<script lang="ts">
	import { ArrowRightToLine, Menu, CircleHelp } from '@lucide/svelte';

	let { tools = [] } = $props();

	let isCollapsed = $state(false);
	let scrollY = $state(0);

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<svelte:window bind:scrollY />
<div
	class="nav-tools"
	class:collapsed={isCollapsed}
	style="translate: 0px {scrollY}px; height: {5.5 + 3 * tools.length}rem"
>
	<div class="tools-header">
		<div class="header-content">
			{#if !isCollapsed}
				<span>Actions</span>
			{/if}
		</div>
		<button class="collapse-toggle" onclick={toggleCollapse}>
			{#if isCollapsed}
				<Menu />
			{:else}
				<ArrowRightToLine />
			{/if}
		</button>
	</div>
	<div class="tools-list">
		{#each tools as tool}
			<button
				class="tool-item"
				title={isCollapsed ? tool.label : 'Unset'}
				onclick={tool.action ?? (() => {})}
			>
				<div class="tool-icon">
					{#if tool.lucide}
						<tool.lucide />
					{:else}
						<CircleHelp />
					{/if}
				</div>
				{#if !isCollapsed}
					<span class="tool-label">{tool.label}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.nav-tools {
		position: sticky;
		top: 1rem;
		width: 13.75rem;
		margin-right: 0.5rem;
		background-color: var(--bg-color);
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		border-radius: 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
	}

	.nav-tools.collapsed {
		position: sticky;
		width: 3.75rem;
		background-color: var(--bg-color);
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		border-radius: 1rem;
		font-size: medium;
	}

	.tools-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.8rem;
		border-bottom: 1px solid var(--border-color);
		font-size: 1.2rem;
	}

	.header-content {
		display: flex;
		flex: 1;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2rem;
		color: var(--title-color);
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
	}

	.collapse-toggle:hover {
		background-color: var(--hover-bg);
	}

	.tools-list {
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		/* gap: 0.8rem; */
	}

	.tool-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 4px;
		text-align: left;
	}

	.tool-item:hover {
		background-color: var(--hover-bg);
		color: var(--text-color);
	}

	.tool-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tool-label {
		flex: 1;
		margin-left: 1rem;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		transition: opacity 0.3s ease;
	}
</style>
