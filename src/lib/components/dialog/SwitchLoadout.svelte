<script module>
	export const DEFAULT_LOADOUT: Loadout = {
		name: 'New Loadout',
		description: 'New loadout',
		element: 'phys',
		equipped_gears: {
			H: null,
			S: null,
			A: null,
			C: null,
			B: null,
			L: null,
			G: null,
			T: null,
			V: null,
			N: null,
			X: null,
			R: null
		},
		base_stats: [
			'1579827',
			'8081',
			'0',
			'18903',
			'18725',
			'17762',
			'19071',
			'0',
			'50',
			'18712',
			'14455',
			'13262',
			'9677',
			'9746'
		],
		equipped_weapons: [{ id: 'none' }, { id: 'none' }, { id: 'none' }],
		equipped_matrices: [{ id: 'none' }, { id: 'none' }, { id: 'none' }],
		equipped_relics: [{ id: 'none' }, { id: 'none' }],
		equipped_trait: 'none'
	};
</script>

<script lang="ts">
	import { user_loadouts } from '$lib/scripts/stores';
	import type { Loadout, StatGearUser } from '$lib/types/index';
	import { ArrowRightIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';
	import StatIcon from '../StatIcon.svelte';

	let {
		open = $bindable(false),
		selected_loadout = $bindable(''),
		duplicate_or_new = false,
		onSwitchLoadout = (loadoutKey: string) => {}
	} = $props();

	function handleLoadoutClick(loadoutKey: string) {
		onSwitchLoadout(loadoutKey);
		open = false;
	}

	function dupeNewChoiceView(loadoutArr: [string, Loadout][]) {
		const CREATE_DEFAULT_LOADOUT = { ...DEFAULT_LOADOUT };
		CREATE_DEFAULT_LOADOUT.name = 'Create New Loadout';
		CREATE_DEFAULT_LOADOUT.description = 'Create a new loadout';

		const newView = [['__NEW__', CREATE_DEFAULT_LOADOUT] as [string, Loadout]];

		loadoutArr.forEach((loadout) => {
			const DUPLICATE_LOADOUT = { ...loadout[1] };
			DUPLICATE_LOADOUT.name = `Duplicate ${loadout[1].name}`;

			newView.push([loadout[0], DUPLICATE_LOADOUT] as [string, Loadout]);
			console.log('pushing key', loadout[0]);
		});

		return newView;
	}

	let choices = $derived(
		!duplicate_or_new
			? Object.entries($user_loadouts)
			: dupeNewChoiceView(Object.entries($user_loadouts))
	);
</script>

<Dialog title={duplicate_or_new ? 'New or Duplicate Loadout' : 'Switch Loadout'} bind:open>
	<div class="switch-loadout-dialog">
		<FlexGrid max_cols={3} horizontal_gap="1rem" vertical_gap="1rem">
			{#if Object.keys($user_loadouts).length > 0}
				{#each choices as [loadoutKey, loadout]}
					<div
						class="loadout-item"
						id={`switch-to-${loadoutKey}`}
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
