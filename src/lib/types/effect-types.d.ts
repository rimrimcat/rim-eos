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

export type BaseEffect = {
	id: string;
	target?: Target; // defaults to self
	duration?: number; // cooldown and duration only matter if not 100% uptime or if onfield
	cooldown?: number;

	require_reso?: ResoTriggers;
	require_reso_not?: ResoTriggers;
	require_reso_count?: number; // defaults to 2

	require_teamplay?: boolean; // defaults to false

	require_weapon?: WeaponsIds; // require weapon to be present to activated

	require_boss?: boolean; // effects that only activate against bosses

	require_combat?: boolean; // effects that only activate when in combat (using skill, after dealing damage...)

	notes?: string;
};

export type WeaponEffect = BaseEffect & {
	id: WeaponEffectsIds;
	stats: StatData;
	require_adv?: number; // required advancement (esp. for weapons)
	require_adv_not?: number; // for advancement that modifies original effects
	require_offhand?: boolean; // effects that only activate when offhand
};

export type ResoEffect = BaseEffect & {
	id: ResoEffectsIds;
	stats: StatData;
	require_reso: ResoTriggers;
};

export type MatrixEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: MatrixStatData | MatrixExprData;
};

export type FinalizedMatrixEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: StatData;
	advancement: number;
};

export type GearEffect = BaseEffect & {
	id: GearEffectsIds;
	stats: StatData;
};

export type RelicEffect = BaseEffect & {
	id: RelicEffectsIds;
	stats: StatData;

	require_adv?: number; // required advancement (esp. for weapons)
	require_adv_not_gt?: number; // for advancement that modifies original effects, only effective if adv < require_adv_not_gt

	require_onfield?: boolean; // for effects that only activate when onfield

	require_undamaged?: boolean; // for couant relic

	works_unequipped?: boolean; // for effects that work even when unequipped
};

export type TraitEffect = BaseEffect & {
	id: TraitEffectsIds;
	stats: StatData | ExprStatData;

	require_onfield_weapon?: WeaponsIds; // for effects that only activate when specific weapon is onfield
};

export type FinalizedTraitEffect = BaseEffect & {
	id: TraitEffectsIds;
	stats: StatData;
};

export type WeaponBaseEffect = BaseEffect & {
	id: WeaponBaseEffectIds;
	stats: StatData;
};

export type OtherEffect = BaseEffect & {
	id: OtherEffectIds;
	stats: StatData;
};

export type AllEffectTypes =
	| ResoEffect
	| WeaponEffect
	| WeaponBaseEffect
	| FinalizedMatrixEffect
	| GearEffect
	| RelicEffect
	| FinalizedTraitEffect
	| OtherEffect;

export type AllEffectIds =
	| ResoEffectsIds
	| WeaponEffectsIds
	| WeaponBaseEffectIds
	| MatrixEffectsIds
	| GearEffectsIds
	| RelicEffectsIds
	| TraitEffectsIds
	| OtherEffectIds;
