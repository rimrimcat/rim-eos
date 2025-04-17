import { eval as evil, parse } from '@casbin/expression-eval';
import { get } from 'svelte/store';
import type {
	BaseEffect,
	BaseStats14,
	BaseStats16,
	CharacterStat,
	MatrixEffect,
	MatrixEffectsIds,
	MatrixFinalEffect,
	MatrixView,
	ResoEffect,
	ResoEffectsIds,
	ResoTriggerCounts,
	StatKey,
	UserWeapon,
	ValidGearPart,
	WeaponEffect,
	WeaponEffectsIds,
	WeaponSettingStuff,
	WeaponView
} from '../types/index';
import {
	getMatrix,
	getMatrixEffect,
	getResoEffects,
	getWeapon,
	getWeaponEffect
} from './json-loader';
import { STAT_LABELS, StatCollection, TEMPLATE_USER_ATTRIBUTES } from './stats';
import {
	base_weapons,
	current_loadout,
	gear_views,
	matrix_views,
	reso_counts,
	reso_effects,
	reso_stat,
	user_loadouts,
	weapon_views
} from './stores';
import { formatValue } from './validation';
import { WEAPON_BASE_STATS } from './weapons';
// import { user_loadouts, current_loadout, base_weapons, reso_counts, reso_effects, reso_stat, weapon_views, matrix_views } from './stores';

function checkValidEffect(
	eff: WeaponEffect,
	reso_counts_: ResoTriggerCounts,
	advancement: number,
	user_weapons_?: UserWeapon[]
): boolean;
function checkValidEffect(
	eff: MatrixEffect,
	reso_counts_: ResoTriggerCounts,
	advancement: number,
	user_weapons_: UserWeapon[]
): boolean;
function checkValidEffect(
	eff: WeaponEffect | MatrixEffect | BaseEffect,
	reso_counts_: ResoTriggerCounts,
	advancement?: number,
	user_weapons_?: UserWeapon[]
): boolean {
	// check if required reso is fulfilled
	if (eff.require_reso) {
		const required_reso_count = eff.require_reso_count ?? 2;
		if (reso_counts_[eff.require_reso] ?? 0 < required_reso_count) {
			return false;
		}
	}

	// check if required adv is fulfilled
	if (
		advancement !== undefined &&
		'require_adv' in eff &&
		eff.require_adv &&
		advancement < eff.require_adv
	) {
		return false;
	}

	if (
		eff.require_weapon &&
		user_weapons_ &&
		!user_weapons_.some((weapon) => weapon.id === eff.require_weapon)
	) {
		return false;
	}

	// TEMPORARILY DISABLE ONFIELD EFFECTS
	if (eff.duration !== undefined && eff.duration === 0) {
		return false;
	}

	// TEMPORARILY DISABLE TEAMPLAY EFFECTS
	if (eff.require_teamplay) {
		return false;
	}

	return true;
}

// helper function for updateResoEffects
export async function pushValidResoEffect(
	effectIds: ResoEffectsIds[],
	reso_effects_: ResoEffect[]
) {
	await Promise.all(
		effectIds.map(async (eff) => {
			const effect = await getResoEffects(eff);
			if (effect && effect.id && !reso_effects_.some((eff2) => eff2.id === effect.id)) {
				reso_effects_.push(effect);
			}
		})
	);
}

// helper function for weapon views
export async function pushAllValidWeaponEffects(
	effs: WeaponEffectsIds[],
	advancement: number,
	reso_counts_: ResoTriggerCounts,
	effects_: WeaponEffect[],
	stat_: StatCollection[]
) {
	await Promise.all(
		effs.map(async (eff_) => {
			const eff = await getWeaponEffect(eff_);

			if (!checkValidEffect(eff, reso_counts_, advancement)) {
				return;
			}

			effects_.push(eff);
			stat_[0] = stat_[0].add(new StatCollection(eff.stats));
		})
	);
}

// helper function for matrix views
export async function pushAllValidMatrixEffects(
	effs: MatrixEffectsIds[],
	advancement: number,
	reso_counts_: ResoTriggerCounts,
	effects_: MatrixFinalEffect[],
	stat_: StatCollection[],
	user_weapons_: UserWeapon[]
) {
	await Promise.all(
		effs.map(async (eff_) => {
			const eff = await getMatrixEffect(eff_);

			if (!checkValidEffect(eff, reso_counts_, advancement, user_weapons_ ?? [])) {
				return;
			}

			const keys = Object.keys(eff.stats);
			const finalEffect = {
				...eff,
				stats: {},
				advancement
			};
			keys.forEach((key) => {
				// @ts-expect-error: key is guaranteed to exist
				const expr_or_number: string | number = eff.stats[key][advancement];

				if (typeof expr_or_number === 'string') {
					// @ts-expect-error: key is guaranteed to exist
					finalEffect.stats[key] = evil(parse(expr_or_number), reso_counts_);
				} else {
					// @ts-expect-error: key is guaranteed to exist
					finalEffect.stats[key] = expr_or_number;
				}
			});

			effects_.push(finalEffect);
			stat_[0] = stat_[0].add(new StatCollection(finalEffect.stats));
		})
	);
}

export function dedupeMatEffs(effects: MatrixFinalEffect[]) {
	return effects.reduce((acc, effect) => {
		const existing_eff = acc.find((eff) => eff.id === effect.id);

		if (!existing_eff) {
			acc.push(effect);
		} else if (effect.advancement > existing_eff.advancement) {
			acc.splice(acc.indexOf(existing_eff), 1);
			acc.push(effect);
		}

		return acc;
	}, [] as MatrixFinalEffect[]);
}

export async function updateBaseWeapons() {
	base_weapons.set(
		await Promise.all(
			get(user_loadouts)[get(current_loadout)].equipped_weapons.map((weapon) =>
				getWeapon(weapon.id)
			)
		)
	);
}

export async function updateResoCounts() {
	reso_counts.set(
		get(base_weapons).reduce((counts, weapon, index) => {
			weapon.resonances.forEach((resonance) => {
				counts[resonance] = (counts[resonance] ?? 0) + 1;
			});

			if (weapon.setting) {
				const selected_settings =
					get(user_loadouts)[get(current_loadout)].equipped_weapons[index].setting ??
					weapon.setting.default;

				selected_settings.forEach((setting) => {
					// @ts-expect-error: its oke
					const setting_data = weapon.setting.choices[setting];
					if (setting_data.resonances) {
						setting_data.resonances.forEach((resonance) => {
							counts[resonance] = (counts[resonance] ?? 0) + 1;
						});
					}
				});
			}

			return counts;
		}, {} as ResoTriggerCounts)
	);
}

export async function updateResoEffects() {
	console.log('Updating reso effects...');
	const _reso_effects_list: ResoEffect[] = [];

	await Promise.all(
		get(base_weapons).map(async (weapon, index) => {
			if (weapon.reso_effects) {
				await pushValidResoEffect(weapon.reso_effects, _reso_effects_list);
			}

			if (weapon.setting) {
				const selected_settings =
					get(user_loadouts)[get(current_loadout)].equipped_weapons[index].setting ??
					weapon.setting.default;

				await Promise.all(
					selected_settings.map(async (setting) => {
						// @ts-expect-error : its oke
						const setting_data = weapon.setting.choices[setting];
						if (setting_data.reso_effects) {
							await pushValidResoEffect(setting_data.reso_effects, _reso_effects_list);
						}
					})
				);
			}
		})
	);
	// add default reso
	_reso_effects_list.push(await getResoEffects('atk'));
	_reso_effects_list.push(await getResoEffects('atk-teamplay'));
	_reso_effects_list.push(await getResoEffects('bene'));
	_reso_effects_list.push(await getResoEffects('bene-teamplay'));
	_reso_effects_list.push(await getResoEffects('armor-dissolve'));
	_reso_effects_list.push(await getResoEffects('armor-dissolve-teamplay'));
	_reso_effects_list.push(await getResoEffects('force-impact'));
	_reso_effects_list.push(await getResoEffects('force-impact-teamplay'));

	let loadout_resonance_stat = new StatCollection();
	const _reso_effects: ResoEffect[] = [];
	const _reso_counts = get(reso_counts);
	_reso_effects_list.forEach((eff) => {
		if (eff.require_reso) {
			const required_reso_count = eff.require_reso_count ?? 2;
			if ((_reso_counts[eff.require_reso] ?? 0) < required_reso_count) {
				return;
			}

			if (eff.require_teamplay) {
				return;
			}

			loadout_resonance_stat = loadout_resonance_stat.add(new StatCollection(eff.stats));
			_reso_effects.push(eff);
		}
	});

	reso_effects.set(_reso_effects);
	reso_stat.set(loadout_resonance_stat);
}

export async function updateWeaponViews() {
	const user_weapons = get(user_loadouts)[get(current_loadout)].equipped_weapons;
	const loadout_reso_counts = get(reso_counts);

	weapon_views.set(
		await Promise.all(
			get(base_weapons).map(async (weapon, index) => {
				const advancement = user_weapons[index].advancement ?? 0;

				// get base stat of weapon
				const _base_stat: { [key in StatKey]?: number } = {};
				Object.entries(WEAPON_BASE_STATS[weapon.base_stat]).forEach(([stat, value]) => {
					_base_stat[stat as StatKey] = value[0] + ((value[1] - value[0]) * advancement) / 6;
				});
				const base_stat = new StatCollection(_base_stat);

				// active effects
				const effects: WeaponEffect[] = [];
				const stat_ = [new StatCollection()];

				await pushAllValidWeaponEffects(
					weapon.effects ?? [],
					advancement,
					loadout_reso_counts,
					effects,
					stat_
				);
				const setting_ids = user_weapons[index].setting ?? weapon.setting?.default ?? [];
				const setting: WeaponSettingStuff[] = setting_ids.map((setting_) => {
					// @ts-expect-error : it oke
					return weapon.setting.choices[setting_];
				});

				if (weapon.setting) {
					await Promise.all(
						setting_ids.map(async (setting_) => {
							// @ts-expect-error: it oke
							const setting_data = weapon.setting.choices[setting_];
							if (setting_data.effects) {
								return await pushAllValidWeaponEffects(
									setting_data.effects,
									advancement,
									loadout_reso_counts,
									effects,
									stat_
								);
							}
						})
					);
				}
				const stat = stat_[0];

				return {
					id: weapon.id,
					name: weapon.name,
					resonances: weapon.resonances,
					onfieldness: weapon.onfieldness,
					advancement,
					setting,

					base_stat,
					effects,
					stat
				} as WeaponView;
			})
		)
	);
}

export async function updateMatrixViews() {
	const selected_loadout = get(user_loadouts)[get(current_loadout)];

	matrix_views.set(
		await Promise.all(
			selected_loadout.equipped_matrices.map(async (matrix) => {
				const advancement = matrix.advancement ?? 0;

				const effects: MatrixFinalEffect[] = [];
				const stat_ = [new StatCollection()];
				const matrix_ = await getMatrix(matrix.id);

				await pushAllValidMatrixEffects(
					matrix_.effects,
					advancement,
					get(reso_counts),
					effects,
					stat_,
					selected_loadout.equipped_weapons
				);
				const stat = stat_[0];

				return {
					id: matrix_.id,
					name: matrix_.name,
					advancement,
					effects,
					stat
				} as MatrixView;
			})
		)
	);
}

export async function updateSingleWeaponView(index: number) {
	const weapon = get(base_weapons)[index];
	const user_weapons = get(user_loadouts)[get(current_loadout)].equipped_weapons;
	const loadout_reso_counts = get(reso_counts);
	const advancement = user_weapons[index].advancement ?? 0;

	console.log('THIS WEAP ADV:', advancement);

	// get base stat of weapon
	const _base_stat: { [key in StatKey]?: number } = {};
	Object.entries(WEAPON_BASE_STATS[weapon.base_stat]).forEach(([stat, value]) => {
		_base_stat[stat as StatKey] = value[0] + ((value[1] - value[0]) * advancement) / 6;
	});
	const base_stat = new StatCollection(_base_stat);

	// active effects
	const effects: WeaponEffect[] = [];
	const stat_ = [new StatCollection()];

	await pushAllValidWeaponEffects(
		weapon.effects ?? [],
		advancement,
		loadout_reso_counts,
		effects,
		stat_
	);

	const setting_ids = user_weapons[index].setting ?? weapon.setting?.default ?? [];
	const setting: WeaponSettingStuff[] = setting_ids.map((setting_) => {
		// @ts-expect-error: it oke
		return weapon.setting.choices[setting_];
	});

	if (weapon.setting) {
		await Promise.all(
			setting_ids.map(async (setting) => {
				// @ts-expect-error: it oke
				const setting_data = weapon.setting.choices[setting];
				if (setting_data.effects) {
					return await pushAllValidWeaponEffects(
						setting_data.effects,
						advancement,
						loadout_reso_counts,
						effects,
						stat_
					);
				}
			})
		);
	}
	const stat = stat_[0];

	const loadout_weapon_views = get(weapon_views);
	loadout_weapon_views[index] = {
		id: weapon.id,
		name: weapon.name,
		resonances: weapon.resonances,
		onfieldness: weapon.onfieldness,
		advancement,
		setting,

		base_stat,
		effects,
		stat
	} as WeaponView;
	weapon_views.set(loadout_weapon_views);
}

export async function updateSingleMatrixView(index: number) {
	const selected_loadout = get(user_loadouts)[get(current_loadout)];
	const user_matrices = selected_loadout.equipped_matrices;
	const matrix = user_matrices[index];
	const advancement = matrix.advancement ?? 0;

	const effects: MatrixFinalEffect[] = [];
	const stat_ = [new StatCollection()];
	const matrix_ = await getMatrix(matrix.id);

	await pushAllValidMatrixEffects(
		matrix_.effects,
		advancement,
		get(reso_counts),
		effects,
		stat_,
		selected_loadout.equipped_weapons
	);
	const stat = stat_[0];

	const loadout_matrix_views = get(matrix_views);
	loadout_matrix_views[index] = {
		id: matrix_.id,
		name: matrix_.name,
		advancement,
		effects,
		stat
	} as MatrixView;
	matrix_views.set(loadout_matrix_views);
}

// creates gearView and updates loadout_resonance_stat
export async function updateWeaponMatrix() {
	// update base weapons
	await updateBaseWeapons();

	// create counts of resonance triggers
	await updateResoCounts();

	// apply resonance effects
	await updateResoEffects();

	// iterate through weapons
	await updateWeaponViews();

	// ... and matrices
	await updateMatrixViews();
}

export function getGearTotal() {
	let stat_col = new StatCollection();

	const equipped_gears = get(user_loadouts)[get(current_loadout)].equipped_gears;
	for (const part in equipped_gears) {
		const gear_id = equipped_gears[part as ValidGearPart];
		if (gear_id !== null && gear_id !== -1) {
			const new_stat = new StatCollection(get(gear_views)[gear_id]);
			stat_col = stat_col.add(new_stat);
		}
	}

	return stat_col;
}

export function getWeaponTotal() {
	let stat_col = new StatCollection();

	const all_effects = [
		...get(weapon_views).flatMap((weapon) => weapon.effects),
		...dedupeMatEffs(get(matrix_views).flatMap((matrix) => matrix.effects)),
		...get(reso_effects)
	];
	all_effects.forEach((eff) => {
		stat_col = stat_col.add(new StatCollection(eff.stats));
	});

	// add base stats
	get(weapon_views).forEach((weapon) => {
		stat_col = stat_col.add(weapon.base_stat);
	});

	return stat_col;
}

export function createAttributeView(base_stats_14: BaseStats14): CharacterStat[] {
	const stat_adj = get(user_loadouts)[get(current_loadout)].stat_adj;

	console.log('BASE14', base_stats_14);

	const total_base_stats = new StatCollection(base_stats_14 as BaseStats14) // base stats
		.add(new StatCollection(stat_adj ? stat_adj.unaccounted : {})) // unaccounted
		.add(new StatCollection('atk_percent', stat_adj ? stat_adj.supercompute : 0)) // supercompute
		.add(new StatCollection('atk_percent', stat_adj && stat_adj.use_blade_shot ? 3.5 : 0)) // blade shot
		.add(getGearTotal()) // gear
		.add(getWeaponTotal()) // weapon + matrix + reso
		.to_displayed_stats();
	const base_stats_ = [
		...total_base_stats.slice(0, 8),
		'1400',
		'0',
		...total_base_stats.slice(8, 14)
	] as BaseStats16;

	if (base_stats_.length !== 16) {
		throw new Error('Invalid base stats length!');
	}

	return TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
		const __val = base_stats_[index];
		const __use_percent = index === 2 || index === 10;

		return {
			...attr,
			name: STAT_LABELS[attr.key],
			value: __use_percent ? formatValue('float3d', __val) : formatValue('int', __val)
		};
	});
}
