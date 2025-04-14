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
	import { BarChartStacked } from '@carbon/charts-svelte';
	import '@carbon/charts-svelte/styles.css';

	let {
		all_effects = $bindable([] as (ResoEffect | WeaponEffect | MatrixFinalEffect)[]),
		max_width = $bindable(500),
		bar_width = 15
	} = $props();

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

	// sort stat_col_data.data accoridng to values and get only the keys
	let sortedKeys = $derived(
		Object.entries(stat_col_totals.data)
			.filter(([key, _]) => !key.includes('_res'))
			.sort((a, b) => a[1] - b[1])
			.map(([key, _]) => STAT_LABELS[key as StatKey])
	);

	// Filter out keys containing '_res'
	let data = $derived(
		tagged_effects.reduce(
			(acc, eff) => {
				const group = eff.is_weapon ? 'Weapon' : eff.is_matrix ? 'Matrix' : 'Reso';

				Object.keys(eff.stats)
					.filter((key) => !key.includes('_res'))
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
</script>

<BarChartStacked
	{data}
	options={{
		theme: 'g90',
		title: 'Stat Contributions',
		axes: {
			left: {
				// @ts-expect-error
				scaleType: 'labels',
				mapsTo: 'key',
				domain: sortedKeys
			},
			bottom: {
				stacked: true,
				mapsTo: 'value'
			}
		},
		height: '400px'
	}}
/>
