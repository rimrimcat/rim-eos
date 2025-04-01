<script>
	import { createEventDispatcher } from 'svelte';
	import { ArrowRightToLine, Menu, CircleHelp } from '@lucide/svelte';

	export let tools = [];

	let isCollapsed = false;
	const dispatch = createEventDispatcher();

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
		dispatch('toggleCollapse', { isCollapsed });
	}
</script>

<div class="component-tools" class:collapsed={isCollapsed}>
	<div class="tools-header">
		<div class="header-content">
			{#if !isCollapsed}
				<span>Actions</span>
			{/if}
		</div>
		<button class="collapse-toggle" on:click={toggleCollapse}>
			{#if isCollapsed}
				<Menu />
			{:else}
				<ArrowRightToLine />
			{/if}
		</button>
	</div>
	<div class="tools-list">
		{#each tools as tool}
			<button class="tool-item" title={isCollapsed ? tool.label : ''}>
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
		position: fixed;
		right: 1vw;
		top: 0.5vh;
		width: 13.75em;
		background-color: #1a1a1a;
		display: flex;
		flex-direction: column;
		color: #ffffff;
		transition: width 0.3s ease;
		height: auto;
		border-radius: 1em;
	}

	.component-tools.collapsed {
		width: 3.75em;
	}

	.tools-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.8em;
		border-bottom: 1px solid #2a2a2a;
		font-size: 1.2em;
	}

	.header-content {
		display: flex;
		flex: 1;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2em;
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2em;
		height: 2.2em;
	}

	.tools-list {
		padding: 1em 0;
		display: flex;
		flex-direction: column;
		/* gap: 0.8em; */
	}

	.tool-item {
		display: flex;
		align-items: center;
		padding: 0.75em 1em;
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
		padding-left: 0.5em;
		align-items: center;
		justify-content: center;
	}

	.tool-label {
		flex: 1;
		margin-left: 1em;
	}
</style>
