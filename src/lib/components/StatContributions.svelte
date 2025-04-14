<script module>
</script>

<script lang="ts">
	import { AllMatrixEffectIds, AllResoEffectIds, AllWeaponEffectIds } from '$lib/generated/all-ids';
	import type {
		MatrixEffectsIds,
		ResoEffectsIds,
		WeaponEffectsIds,
		WeaponsIds
	} from '$lib/generated/ids';
	import { StatCollection, type StatData, type StatKey } from '$lib/scripts/stat-ops';
	import { STAT_LABELS } from '$lib/scripts/stats';
	import type {
		BaseEffect,
		MatrixFinalEffect,
		ResoEffect,
		WeaponEffect
	} from '$lib/scripts/weapons';
	import { BarChartStacked, ScaleTypes, type BarChartOptions } from '@carbon/charts-svelte';
	import '@carbon/charts-svelte/styles.css';
	import { PinIcon, PinOffIcon } from '@lucide/svelte';

	let {
		all_effects = $bindable([] as (ResoEffect | WeaponEffect | MatrixFinalEffect)[]),
		chart_width = $bindable(500)
	} = $props();

	// options
	let pin_highest = $state(false);

	// stuff
	let key_filter = $state((key: StatKey) => !key.includes('_res_percent'));
	let grouping_fcn = $state((eff: TaggedEffect) =>
		eff.is_weapon ? 'Weapon' : eff.is_matrix ? 'Matrix' : 'Reso'
	);

	type ETags = {
		character?: WeaponsIds;
		is_matrix?: boolean;
		is_weapon?: boolean;
		is_reso?: boolean;
	};

	type TaggedEffect = BaseEffect &
		ETags & {
			id: ResoEffectsIds | WeaponEffectsIds | MatrixEffectsIds;
			stats: StatData;
		};

	function tagEffect(eff: ResoEffect | WeaponEffect | MatrixFinalEffect) {
		const tags: ETags = {};

		if (AllWeaponEffectIds.includes(eff.id as WeaponEffectsIds)) {
			tags.is_weapon = true;
			tags.character = eff.id.split('-')[0] as WeaponsIds;
		} else if (AllMatrixEffectIds.includes(eff.id as MatrixEffectsIds)) {
			tags.is_matrix = true;
			tags.character = eff.id.split('-')[0] as WeaponsIds;
		} else if (AllResoEffectIds.includes(eff.id as ResoEffectsIds)) {
			tags.is_reso = true;
		} else {
			console.log('FAILED TO TAG!');
		}

		return tags;
	}

	let tagged_effects = $derived(
		all_effects.map((eff) => {
			const tagged_eff: TaggedEffect = {
				...eff,
				...tagEffect(eff)
			};
			return tagged_eff;
		})
	);

	let stat_col_totals = $derived(
		all_effects.reduce((col, eff) => col.add(new StatCollection(eff.stats)), new StatCollection())
	);

	let sortedKeys = $derived(
		Object.entries(stat_col_totals.data)
			.filter(([key, _]) => key_filter(key as StatKey))
			.sort((a, b) => b[1] - a[1])
			.map(([key, _]) => key)
	);

	// NOTE: REVERSE ORDER!!!!
	let sortedKeyLabels = $derived(
		Object.entries(stat_col_totals.data)
			.filter(([key, _]) => key_filter(key as StatKey))
			.sort((a, b) => a[1] - b[1])
			.map(([key, _]) => STAT_LABELS[key as StatKey])
	);

	let highest_so_far = $state(0);
	$effect(() => {
		highest_so_far = Math.max(stat_col_totals.data[sortedKeys[0] as StatKey] ?? 0, highest_so_far);
	});
	let max_domain = $derived(
		pin_highest ? (highest_so_far ?? 0) : (stat_col_totals.data[sortedKeys[0] as StatKey] ?? 0)
	);
	let data = $derived(
		tagged_effects.reduce(
			(acc, eff) => {
				const group = grouping_fcn(eff);

				Object.keys(eff.stats)
					.filter((key) => key_filter(key as StatKey))
					.forEach((key) => {
						const combinedKey = `${group}:${key}`;

						if (!acc.map.has(combinedKey)) {
							const entry = {
								group,
								key: STAT_LABELS[key as StatKey],
								value: eff.stats[key as StatKey]
							};

							acc.map.set(combinedKey, entry);
							// @ts-expect-error
							acc.list.push(entry);
						} else {
							acc.map.get(combinedKey).value += eff.stats[key as StatKey];
						}
					});

				return acc;
			},
			{ map: new Map(), list: [] }
		).list
	);

	let options: BarChartOptions = $derived({
		theme: 'g90',
		title: 'Stat Contributions',
		axes: {
			left: {
				scaleType: 'labels' as ScaleTypes,
				mapsTo: 'key',
				domain: sortedKeyLabels
			},
			bottom: {
				stacked: true,
				mapsTo: 'value',
				domain: [0, max_domain]
			}
		},
		width: `${chart_width}px`,
		height: `${sortedKeyLabels.length * 40 + 100}px`
	});
</script>

<div class="chart-actions">
	<button class="border" id="pin-highest" onclick={() => (pin_highest = !pin_highest)}>
		{#if pin_highest}
			<PinOffIcon />
			<label class="in-button" for="pin-highest">Unpin</label>
		{:else}
			<PinIcon />
			<label class="in-button" for="pin-highest">Pin Highest</label>
		{/if}
	</button>
</div>

<BarChartStacked {data} {options} />
