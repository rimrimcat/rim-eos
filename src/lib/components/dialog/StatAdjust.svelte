<script lang="ts">
	import { TEMPLATE_USER_ATTRIBUTES } from '$lib/scripts/loader';
	import { STAT_LABELS, StatCollection } from '$lib/scripts/stats';
	import { current_loadout, gear_views, user_loadouts } from '$lib/scripts/stores';
	import type { CharacterStat, ValidGearPart } from '$lib/types/index';
	import { ShirtIcon, SlashIcon, SwordIcon } from '@lucide/svelte';
	import type { Component } from 'svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	let {
		open = $bindable(false),
		unadjusted_stats = $bindable([] as string[])
		// TODO: variable that controls adjustment
	} = $props();

	// raw user-uploaded attribute
	let raw_attribute_view: CharacterStat[] = $derived(
		TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
			return {
				...attr,
				name: STAT_LABELS[attr.key],
				value: unadjusted_stats[index]
			};
		})
	);

	// all adjusted stats
	let adj_raw_attributes: number[] = $state([]);
	let adj_raw_attributes_view: string[] = $derived(
		adj_raw_attributes.map((value) => value.toFixed(0).toString())
	);

	// adjustment only for base atk!
	let manual_base_atk_inputs: string[] = $state([]);

	// other adjustments
	let adjust_for_gear = $state(true);
	let adjust_for_weapon = $state(true);

	function getGearTotal() {
		let stat_col = new StatCollection();

		const equipped_gears = $user_loadouts[$current_loadout].equipped_gears;
		for (const part in equipped_gears) {
			const gear_id = equipped_gears[part as ValidGearPart];
			if (gear_id !== null && gear_id !== -1) {
				const new_stat = new StatCollection($gear_views[gear_id]);
				stat_col = stat_col.add(new_stat);
			}
		}
		return stat_col;
	}

	function onButtonPress(btn: string | 'Finalize' | 'Cancel') {
		if (btn === 'Finalize') {
			// save adjusted stats
			// lets see what was calculated
			const extra_stat = getGearTotal().calc_extra_atk_from(
				unadjusted_stats,
				manual_base_atk_inputs.map((value) => {
					return parseInt(value) || 0;
				})
			);

			console.log('Calculated extra_stat:', extra_stat);
		} else {
			open = false;
		}
	}

	$effect(() => {
		manual_base_atk_inputs = adj_raw_attributes_view.slice(3, 8);
	});

	$effect(() => {
		if (!$current_loadout) {
			return;
		}

		let stat_col = new StatCollection();

		if (adjust_for_gear) {
			stat_col = stat_col.add(getGearTotal());
		}

		adj_raw_attributes = stat_col.calc_base_from(unadjusted_stats);
	});

	$inspect('unadjusted stats', unadjusted_stats);
</script>

{#snippet make_button(
	toggle: boolean,
	onclick: () => void,
	Lucide: Component,
	id: string,
	txt1: string,
	txt2: string
)}
	<button class="toggle" class:selected={toggle} {id} {onclick}>
		<div class="button-content">
			<div style="position: relative;">
				<Lucide />
				{#if !toggle}
					<div style="position: absolute; top: 0%; left: 0%;">
						<SlashIcon />
					</div>
				{/if}
			</div>
			<label class="in-button" for={id}>{toggle ? txt1 : txt2}</label>
		</div>
	</button>
{/snippet}

<Dialog
	title="Stat Adjustment"
	bind:open
	buttons={unadjusted_stats.length > 0 ? ['Finalize', 'Cancel'] : ['Cancel']}
	primary="Finalize"
	{onButtonPress}
>
	{#if unadjusted_stats.length > 0}
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

								{#if index <= 3}
									{'➜ '}
									<input
										type="text"
										class="stat-value"
										bind:value={manual_base_atk_inputs[index]}
										onblur={() => {
											manual_base_atk_inputs[4] = Math.max(
												...manual_base_atk_inputs.slice(0, 4).map((value) => {
													return parseInt(value) || 0;
												})
											).toString();
										}}
										style="width: 8ch"
									/>
								{:else if index === 4}
									{'➜ '}
									{manual_base_atk_inputs[4]}
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</FlexGrid>
		</div>

		<h3>Adjustments</h3>

		<div class="horizontal" style="margin-top: 1rem;">
			{@render make_button(
				adjust_for_gear,
				() => {
					adjust_for_gear = !adjust_for_gear;
				},
				ShirtIcon,
				'adjust-for-weapon',
				'Adjust for weapon',
				"Don't adjust for weapon"
			)}
			{@render make_button(
				adjust_for_weapon,
				() => {
					adjust_for_weapon = !adjust_for_weapon;
				},
				SwordIcon,
				'adjust-for-weapon',
				'Adjust for weapon',
				"Don't adjust for weapon"
			)}
		</div>
	{:else}
		<p>No stat to adjust, upload a screenshot first!</p>
	{/if}
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

	button.toggle {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: 1px solid var(--border-color);
		background-color: var(--button-bg);
		cursor: pointer;
		transition: all 0.2s ease;
		display: block;

		width: fit-content;
	}

	button.toggle:hover {
		background-color: var(--button-hover-bg);
	}

	button.toggle.selected {
		background-color: violet;
		color: var(--button-primary-text);
		border-color: var(--button-primary-border);
	}

	div.button-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
</style>
