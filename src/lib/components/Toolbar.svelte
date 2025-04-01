<script>
	import { createEventDispatcher } from 'svelte';
	import { navItems, activeComponent, isCollapsed } from '$lib/scripts/navigation.ts';

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
					<polyline points="13 17 18 12 13 7"></polyline>
					<polyline points="6 17 11 12 6 7"></polyline>
				</svg>
			{:else}
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
					<polyline points="11 17 6 12 11 7"></polyline>
					<polyline points="18 17 13 12 18 7"></polyline>
				</svg>
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
						{#if item.icon === 'grid'}
							<!-- Grid icon -->
							<rect x="3" y="3" width="7" height="7"></rect>
							<rect x="14" y="3" width="7" height="7"></rect>
							<rect x="14" y="14" width="7" height="7"></rect>
							<rect x="3" y="14" width="7" height="7"></rect>
						{:else if item.icon === 'bar-chart'}
							<!-- Bar chart icon -->
							<line x1="18" y1="20" x2="18" y2="10"></line>
							<line x1="12" y1="20" x2="12" y2="4"></line>
							<line x1="6" y1="20" x2="6" y2="14"></line>
						{:else if item.icon === 'settings'}
							<!-- Settings icon -->
							<circle cx="12" cy="12" r="3"></circle>
							<path
								d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
							></path>
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
