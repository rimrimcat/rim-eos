<script lang="ts">
	import type { UserGear } from '$lib/scripts/gears';
	import type { AllLoadouts } from '$lib/scripts/loadouts';
	import type { AttributeItem } from '$lib/scripts/stats';
	import { ShirtIcon, SlashIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	let {
		open = $bindable(false),
		attribute_view = $bindable([] as AttributeItem[]),
		user_gears = $bindable([] as UserGear[]),
		user_loadouts = $bindable({} as AllLoadouts),
		current_loadout = $bindable('')
	} = $props();

	//need to store raw attribute as seperate var on stat page

	let adjust_for_gear = $state(true);

	let attack_stats = $derived(
		attribute_view.filter((attr) => {
			return [
				'Physical Attack',
				'Flame Attack',
				'Frost Attack',
				'Volt Attack',
				'Altered Attack'
			].includes(attr.name);
		})
	);
</script>

<Dialog title="Stat Adjustment" bind:open>
	<div style="padding: 0.5rem;">
		<FlexGrid
			horizontal_gap="0.9rem"
			vertical_gap="1rem"
			min_cols={1}
			max_cols={1}
			prefer_divisible={false}
		>
			{#each attack_stats as attribute}
				<div class="item-flex">
					<div class="attribute-icon">
						<img src={attribute.icon} alt={attribute.name + ' icon'} />
					</div>
					<div class="vertical-left">
						<div class="stat-name">Base {attribute.name}</div>
						<div class="stat-value-text">{attribute.value} {adjust_for_gear ? '➜' : ''}</div>
					</div>
				</div>
			{/each}
		</FlexGrid>
	</div>

	<div class="horizontal center" style="margin-top: 1rem;">
		<button
			class="button border"
			id="raw-toggle"
			title={adjust_for_gear ? 'Adjust for gear' : "Don't adjust for gear"}
			onclick={() => (adjust_for_gear = !adjust_for_gear)}
		>
			<div style="position: relative; ">
				<ShirtIcon />
				{#if !adjust_for_gear}
					<div style="position: absolute; top: 0%; left: 0%;">
						<SlashIcon />
					</div>
				{/if}
			</div>
			<label class="in-button" for="raw-toggle"
				>{adjust_for_gear ? 'Adjust for gear' : "Don't adjust for gear"}</label
			>
		</button>
	</div>
</Dialog>

<style>
	.stat-name {
		font-size: 1rem;
		font-weight: bold;
		padding-left: 0.4rem;
		color: var(--text-color);
	}

	.stat-value-text {
		font-size: 1.25rem;
		padding-left: 0.4rem;
	}
</style>
