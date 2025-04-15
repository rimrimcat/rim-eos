import type {
	BaseEffect,
	MatrixEffect,
	MatrixEffectsIds,
	MatrixFinalEffect,
	ResoEffect,
	ResoEffectsIds,
	ResoTriggerCounts,
	WeaponEffect,
	WeaponEffectsIds
} from '../types/index';
import { getMatrixEffect, getResoEffects, getWeaponEffect } from './json-loader';
import { StatCollection } from './stats';

function checkValidEffect(
	eff: WeaponEffect,
	reso_counts_: ResoTriggerCounts,
	advancement: number
): boolean;
function checkValidEffect(
	eff: MatrixEffect,
	reso_counts_: ResoTriggerCounts,
	advancement: number
): boolean;
function checkValidEffect(
	eff: WeaponEffect | MatrixEffect | BaseEffect,
	reso_counts_: ResoTriggerCounts,
	advancement?: number
): boolean {
	// check if required reso is fulfilled
	if (eff.require_reso) {
		const required_reso_count = eff.require_reso_count ?? 2;
		if (reso_counts_[eff.require_reso] ?? 0 < required_reso_count) {
			return false;
		}
	}

	// check if required adv is fulfilled
	if (advancement && 'require_adv' in eff && eff.require_adv && advancement < eff.require_adv) {
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
	stat_: StatCollection[]
) {
	await Promise.all(
		effs.map(async (eff_) => {
			const eff = await getMatrixEffect(eff_);

			if (!checkValidEffect(eff, reso_counts_, advancement)) {
				return;
			}

			const keys = Object.keys(eff.stats);
			const finalEffect = {
				...eff,
				stats: {},
				advancement
			};
			keys.forEach((key) => {
				// @ts-expect-error : its oke
				finalEffect.stats[key] = eff.stats[key][advancement];
			});

			effects_.push(finalEffect);
			stat_[0] = stat_[0].add(new StatCollection(finalEffect.stats));
		})
	);
}
