<script lang="ts">
	import type { StatGearUser } from '$lib/scripts/stats';
	import { user_loadouts } from '$lib/scripts/stores';
	import { ArrowRightIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';
	import StatIcon from '../StatIcon.svelte';

	let {
		open = $bindable(false),
		selected_loadout = $bindable(''),
		onSwitchLoadout = (loadoutKey: string) => {}
	} = $props();

	function handleLoadoutClick(loadoutKey: string) {
		onSwitchLoadout(loadoutKey);
		open = false;
	}
</script>

<Dialog title="Switch Loadout" bind:open>
	<div class="switch-loadout-dialog">
		<FlexGrid max_cols={3} horizontal_gap="1rem" vertical_gap="1rem">
			{#if Object.keys($user_loadouts).length > 0}
				{#each Object.entries($user_loadouts) as [loadoutKey, loadout]}
					<div
						class="loadout-item"
						class:selected={loadoutKey === selected_loadout}
						onclick={() => handleLoadoutClick(loadoutKey)}
						onkeydown={(e) => e.key === 'Enter' && handleLoadoutClick(loadoutKey)}
						tabindex="0"
						role="button"
						aria-pressed={loadoutKey === selected_loadout}
					>
						<div class="loadout-icon">
							<StatIcon stat={loadout.element as StatGearUser} size="2rem" />
						</div>
						<div class="loadout-details">
							<div class="loadout-name">{loadout.name}</div>
							<div class="loadout-description">{loadout.description}</div>
						</div>
						{#if loadoutKey === selected_loadout}
							<div class="current-indicator">
								<ArrowRightIcon size="1.2rem" />
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<div class="no-loadouts">
					<p>No loadouts available</p>
				</div>
			{/if}
		</FlexGrid>
	</div>
</Dialog>

<style>
	.switch-loadout-dialog {
		width: 100%;
		min-height: 200px;
	}

	.loadout-item {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
		gap: 1rem;
		position: relative;
		max-width: 80%;
	}

	.loadout-item:hover {
		background-color: var(--hover-bg);
	}

	.loadout-item.selected {
		background-color: var(--selected-bg, rgba(0, 0, 0, 0.1));
	}

	.loadout-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.loadout-details {
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.loadout-name {
		font-weight: bold;
		margin-bottom: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.loadout-description {
		font-size: 0.9rem;
		color: var(--text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.current-indicator {
		position: absolute;
		right: 1rem;
		color: var(--accent-color);
	}

	.no-loadouts {
		width: 100%;
		text-align: center;
		padding: 2rem;
		color: var(--text-secondary);
	}
</style>
