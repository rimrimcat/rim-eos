import type {
	GearEffectsIds,
	MatrixEffectsIds,
	OtherEffectIds,
	RelicEffectsIds,
	ResoEffectsIds,
	TraitEffectsIds,
	WeaponBaseEffectIds,
	WeaponEffectsIds,
	WeaponsIds
} from '../generated/ids';
import type { Elements, StatData, StatKey } from './stat-types';

export type CompoundElements = 'phys-flame' | 'flame-phys' | 'frost-volt' | 'volt-frost';
export type ResoElement = Elements | CompoundElements | 'none';
export type ResoRole = 'atk' | 'fort' | 'bene' | 'none';
export type ResoExtra = 'armor-dissolve' | 'force-impact';
export type ResoTriggers = ResoElement | ResoRole | ResoExtra;
export type OrderedResoTriggers = [ResoElement, ResoRole];

export type Target = 'self' | 'ally' | 'team' | 'enemy';
export type ResoTriggerCounts = { [key in ResoTriggers]?: number };

export type ResoTriggerDependentExpression = ResoTriggers | string;

export type ExprStatData = {
	[key in StatKey]?: ResoTriggerDependentExpression;
};

export type MatrixStatData = {
	[key in StatKey]?: [number, number, number, number];
};
export type MatrixExprData = {
	[key in StatKey]?: [
		ResoTriggerDependentExpression,
		ResoTriggerDependentExpression,
		ResoTriggerDependentExpression,
		ResoTriggerDependentExpression
	];
};

export type EffectSupportingAdvancement = {
	/** For effects that require certain advancement (weapon, relics) */
	require_adv?: number;
	/** For advancements that modify original effects */
	require_adv_not_gt?: number;
};

export type BaseEffect = {
	id: string;

	/** Target of effect (defaults to self) */
	target?: Target;

	duration?: number; // cooldown and duration only matter if not 100% uptime or if onfield
	cooldown?: number;

	require_reso?: ResoTriggers;
	require_reso_not?: ResoTriggers;
	require_reso_count?: number; // defaults to 2

	/** For effects that only activate when onfield (matrices) */
	require_onfield?: boolean;
	/** For effects that only activate when specific weapon is onfield (relics) */
	require_onfield_weapon?: WeaponsIds;
	/** For effects that only activate when offhand (e.g. brevey buff) */
	require_offhand?: boolean;

	/** If effect only triggers in teamplay */
	require_teamplay?: boolean;

	/** If effect only activates if certain weapon is present */
	require_weapon?: WeaponsIds;

	/** If effect only activates against bosses */
	require_boss?: boolean;

	/** If effect only activates in combat (after using skill, after dealing damage) */
	require_combat?: boolean;

	/** For couant relic */
	require_undamaged?: boolean;

	/** For effects that work even when unequipped (for relics) */
	works_unequipped?: boolean;

	/** For effects that only activate when enemy hp is less than a certain percentage */
	require_hp_less_than?: number;
	/** For effects that only activate when enemy hp is greater than a certain percentage */
	require_hp_greater_than?: number;

	notes?: string;
};
export type IdAndStats<T> = {
	id: T;
	stats: StatData;
};

export type WeaponEffect = BaseEffect & EffectSupportingAdvancement & IdAndStats<WeaponEffectsIds>;
export type ResoEffect = BaseEffect & IdAndStats<ResoEffectsIds>;
export type MatrixEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: MatrixStatData | MatrixExprData;
};
export type FinalizedMatrixEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: StatData;
	advancement: number;
};
export type GearEffect = BaseEffect & IdAndStats<GearEffectsIds>;
export type RelicEffect = BaseEffect & EffectSupportingAdvancement & IdAndStats<RelicEffectsIds>;
export type TraitEffect = BaseEffect & {
	id: TraitEffectsIds;
	stats: StatData | ExprStatData;
};
export type FinalizedTraitEffect = BaseEffect & IdAndStats<TraitEffectsIds>;
export type WeaponBaseEffect = BaseEffect & IdAndStats<WeaponBaseEffectIds>;
export type OtherEffect = BaseEffect & IdAndStats<OtherEffectIds>;

export type UnfinalEffectTypes =
	| ResoEffect
	| WeaponEffect
	| WeaponBaseEffect
	| MatrixEffect
	| GearEffect
	| RelicEffect
	| TraitEffect
	| OtherEffect;

export type AllEffectTypes =
	| ResoEffect
	| WeaponEffect
	| WeaponBaseEffect
	| FinalizedMatrixEffect
	| GearEffect
	| RelicEffect
	| FinalizedTraitEffect
	| OtherEffect
	| FinalizedEffect;

export type AllEffectIds =
	| ResoEffectsIds
	| WeaponEffectsIds
	| WeaponBaseEffectIds
	| MatrixEffectsIds
	| GearEffectsIds
	| RelicEffectsIds
	| TraitEffectsIds
	| OtherEffectIds;

export type FinalizedEffect = BaseEffect &
	EffectSupportingAdvancement & {
		id: AllEffectIds;
		stats: StatData;

		advancement?: number;
	};
