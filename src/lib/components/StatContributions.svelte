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
	import { DiffIcon, GroupIcon, PinIcon, PinOffIcon, SlashIcon } from '@lucide/svelte';

	let {
		all_effects = $bindable([] as (ResoEffect | WeaponEffect | MatrixFinalEffect)[]),
		chart_width = $bindable(500)
	} = $props();

	// options
	let grouping_type: 'source' | 'character' = $state('source');
	const SOURCE_GROUPING = (eff: TaggedEffect) =>
		eff.is_weapon ? 'Weapon' : eff.is_matrix ? 'Matrix' : 'Reso';
	const CHARACTER_GROUPING = (eff: TaggedEffect) => eff.character ?? 'none';

	let pin_axis = $state(false);
	let curr_axis = $state([0, 0]);

	let compare_stats = $state(false);
	let prev_tagged_effects = $state([] as TaggedEffect[]);

	// stuff
	let key_filter = $state((key: StatKey) => !key.includes('_res_percent'));
	let grouping_fcn: (eff: TaggedEffect) => string = $state(CHARACTER_GROUPING);

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

	function createData(eff_list: TaggedEffect[], _grouping_fcn: (eff: TaggedEffect) => string) {
		return eff_list.reduce(
			(acc, eff) => {
				const group = _grouping_fcn(eff);

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
		).list;
	}

	function invertEffect(eff: TaggedEffect) {
		return {
			...eff,
			stats: Object.fromEntries(
				Object.entries(eff.stats).map(([key, value]) => [key, -value])
			) as StatData
		};
	}

	function updateGrouping() {
		if (grouping_type === 'character') {
			grouping_fcn = CHARACTER_GROUPING;
		} else {
			grouping_fcn = SOURCE_GROUPING;
		}
	}

	function getDiff(prev_eff: TaggedEffect[], curr_eff: TaggedEffect[]): TaggedEffect[] {
		type DiffIdMap = {
			id: ResoEffectsIds | WeaponEffectsIds | MatrixEffectsIds;
			eff_in_prev?: TaggedEffect;
			eff_in_curr?: TaggedEffect;
		};

		const present_ids: DiffIdMap[] = [];
		curr_eff.forEach((eff) => {
			if (prev_eff.some((eff2) => eff2.id === eff.id)) {
				present_ids.push({
					id: eff.id,
					eff_in_prev: prev_eff.find((eff2) => eff2.id === eff.id),
					eff_in_curr: eff
				});
			} else {
				present_ids.push({
					id: eff.id,
					eff_in_curr: eff
				});
			}
		});
		prev_eff.forEach((eff) => {
			if (!present_ids.some((eff2) => eff2.id === eff.id)) {
				present_ids.push({
					id: eff.id,
					eff_in_prev: eff
				});
			}
		});

		return present_ids.map((eff) => {
			if (eff.eff_in_curr && !eff.eff_in_prev) {
				return eff.eff_in_curr;
			} else if (eff.eff_in_prev && !eff.eff_in_curr) {
				return invertEffect(eff.eff_in_prev);
			} else if (eff.eff_in_prev && eff.eff_in_curr) {
				return {
					...eff.eff_in_curr,
					stats: new StatCollection(eff.eff_in_curr.stats).subtract(
						new StatCollection(eff.eff_in_prev.stats)
					).data
				};
			} else {
				console.log('wtf????');
				throw new Error('Something went wrong!');
			}
		});
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

	let diff_tagged_effects = $derived(getDiff(prev_tagged_effects, tagged_effects));

	let current_processed_effects = $derived(compare_stats ? diff_tagged_effects : tagged_effects);

	let stat_col_totals = $derived(
		current_processed_effects.reduce(
			(col, eff) => col.add(new StatCollection(eff.stats)),
			new StatCollection()
		)
	);

	let data = $derived(createData(current_processed_effects, grouping_fcn));
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

	let max_domain = $derived(stat_col_totals.data[sortedKeys[0] as StatKey] ?? 0);
	let min_domain = $derived(
		stat_col_totals.data[sortedKeys[sortedKeys.length - 1] as StatKey] ?? 0
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
				domain: pin_axis ? curr_axis : undefined
			}
		},
		width: `${chart_width}px`,
		height: `${sortedKeyLabels.length * 40 + 100}px`
	});
</script>

<div class="horizontal chart-actions">
	<button
		class="border"
		id="stat-grouping"
		onclick={() => {
			grouping_type = grouping_type === 'character' ? 'source' : 'character';
			updateGrouping();
		}}
	>
		<GroupIcon />
		<label class="in-button" for="stat-grouping">Grouping: {grouping_type}</label>
	</button>
	<button
		class="border"
		id="pin-axis"
		onclick={() => {
			pin_axis = !pin_axis;
			if (pin_axis) {
				curr_axis = [min_domain, max_domain];
			}
		}}
	>
		{#if pin_axis}
			<PinOffIcon />
			<label class="in-button" for="pin-axis">Unpin</label>
		{:else}
			<PinIcon />
			<label class="in-button" for="pin-axis">Pin Axis</label>
		{/if}
	</button>
	<button
		class="border"
		id="compare-stats"
		onclick={() => {
			// disable pinning
			pin_axis = false;

			compare_stats = !compare_stats;
			if (!compare_stats) {
				return;
			}

			prev_tagged_effects = [...tagged_effects];
		}}
	>
		<div class="compose below lucide">
			<DiffIcon />

			<div class="compose above lucide">
				{#if compare_stats}
					<SlashIcon />
				{/if}
			</div>
		</div>
		<label class="in-button" for="compare-stats"
			>{compare_stats ? 'Stop Compare' : 'Compare Stats'}</label
		>
	</button>
</div>

<BarChartStacked {data} {options} />
