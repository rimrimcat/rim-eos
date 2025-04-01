<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ArrowRightToLine, Menu, CircleHelp } from '@lucide/svelte';

	export let tools = [];

	let isCollapsed = false;
	let scrollY = 0;
	const dispatch = createEventDispatcher();

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
		dispatch('toggleCollapse', { isCollapsed });
	}
</script>

<svelte:window bind:scrollY />
<div
	class="component-tools"
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
						<svelte:component this={tool.lucide} />
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
	.component-tools {
		position: sticky;
		left: 100vw;
		top: 1rem;
		width: 13.75rem;
		background-color: #1a1a1a;
		display: flex;
		flex-direction: column;
		color: #ffffff;
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		border-radius: 1rem;
	}

	.component-tools.collapsed {
		position: sticky;
		width: 3.75rem;
		background-color: #1a1a1a;
		display: flex;
		flex-direction: column;
		color: #ffffff;
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
		border-bottom: 1px solid #2a2a2a;
		font-size: 1.2rem;
	}

	.header-content {
		display: flex;
		flex: 1;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
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
		color: #aaaaaa;
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 4px;
		text-align: left;
	}

	.tool-item:hover {
		background-color: #2a2a2a;
		color: #ffffff;
	}

	.tool-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tool-label {
		flex: 1;
		margin-left: 1rem;
	}
</style>
