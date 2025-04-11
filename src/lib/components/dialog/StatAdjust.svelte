<script lang="ts">
	import type { GearView, UserGear, ValidGearPart } from '$lib/scripts/gears';
	import { TEMPLATE_USER_ATTRIBUTES } from '$lib/scripts/loader';
	import type { AllLoadouts } from '$lib/scripts/loadouts';
	import { StatCollection } from '$lib/scripts/stat_ops';
	import { STAT_LABELS, type CharacterStat } from '$lib/scripts/stats';
	import { ShirtIcon, SlashIcon, TextCursorInputIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	let {
		open = $bindable(false),
		raw_attributes = $bindable([] as string[]),
		// TODO: variable that controls adjustment
		user_gears = $bindable([] as UserGear[]),
		gear_views = $bindable([] as GearView[]),
		user_loadouts = $bindable({} as AllLoadouts),
		current_loadout = $bindable('')
	} = $props();

	// raw user-uploaded attribute
	let raw_attribute_view: CharacterStat[] = $derived(
		TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
			return {
				...attr,
				name: STAT_LABELS[attr.key],
				value: raw_attributes[index]
			};
		})
	);

	// all adjusted stats
	let adj_raw_attributes: number[] = $state([]);
	let adj_raw_attributes_view: string[] = $derived(
		adj_raw_attributes.map((value) => value.toFixed(0).toString())
	);

	// adjustment only for base atk!
	let manual_base_atk = $state(true);
	let manual_base_atk_inputs: string[] = $state([]);

	let adjust_for_gear = $state(true);

	function getGearTotal() {
		let stat_col = new StatCollection();

		const equipped_gears = user_loadouts[current_loadout].equipped_gear;
		for (const part in equipped_gears) {
			const gear_id = equipped_gears[part as ValidGearPart];
			if (gear_id !== null && gear_id !== -1) {
				const new_stat = new StatCollection(gear_views[gear_id]);
				stat_col = stat_col.add(new_stat);
			}
		}
		return stat_col;
	}

	$effect(() => {
		manual_base_atk_inputs = adj_raw_attributes_view.slice(3, 7);
	});

	$effect(() => {
		if (!current_loadout) {
			return;
		}

		let stat_col = new StatCollection();

		if (adjust_for_gear) {
			stat_col = stat_col.add(getGearTotal());
		}

		adj_raw_attributes = stat_col.calc_base_from(raw_attributes);
	});
</script>

<Dialog title="Stat Adjustment" bind:open buttons={['Finalize', 'Cancel']} primary="Finalize">
	<div style="padding: 0.5rem;">
		<FlexGrid
			horizontal_gap="0.9rem"
			vertical_gap="1rem"
			min_cols={1}
			max_cols={1}
			prefer_divisible={false}
		>
			{#each raw_attribute_view.slice(3, 8) as attribute, index}
				<div class="item-flex">
					<div class="attribute-icon">
						<img src={attribute.icon} alt={attribute.name + ' icon'} />
					</div>
					<div class="vertical-left">
						<div class="stat-name">Base {attribute.name}</div>
						<div class="stat-value-text">
							{attribute.value}

							{#if manual_base_atk && index <= 3}
								{'➜ '}
								<input
									type="text"
									class="stat-value"
									bind:value={manual_base_atk_inputs[index]}
									style="width: 8ch"
								/>
							{:else if manual_base_atk && index === 4}
								{'➜ '}
								{Math.max(
									...manual_base_atk_inputs.map((value) => {
										return parseInt(value) ?? 0;
									})
								)}
							{:else if adjust_for_gear}
								{'➜ ' + adj_raw_attributes_view[index + 3]}
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</FlexGrid>
	</div>

	<div class="horizontal" style="margin-top: 1rem;">
		<button
			class="button border"
			id="manual-toggle"
			onclick={() => (manual_base_atk = !manual_base_atk)}
		>
			<div style="position: relative; ">
				<TextCursorInputIcon />
				{#if !manual_base_atk}
					<div style="position: absolute; top: 0%; left: 0%;">
						<SlashIcon />
					</div>
				{/if}
			</div>
			<label class="in-button" for="manual-toggle"
				>{manual_base_atk ? 'Input base stats manually' : 'Only calculate base stats'}</label
			>
		</button>

		<button
			class="button border"
			id="raw-toggle"
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

	.attribute-icon img {
		/* make smaller */
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
