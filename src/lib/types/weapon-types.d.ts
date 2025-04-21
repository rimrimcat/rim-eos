import type {
	MatrixEffectsIds,
	MatrixIds,
	RelicEffectsIds,
	RelicIds,
	ResoEffectsIds,
	TraitEffectsIds,
	TraitsIds,
	WeaponEffectsIds,
	WeaponsIds
} from '../generated/ids';
import type { StatCollection } from '../scripts/stats';
import type {
	FinalizedTraitEffect,
	MatrixFinalEffect,
	OrderedResoTriggers,
	RelicEffect,
	WeaponEffect
} from './effect-types';
import type { Elements, StatBuffs, StatGearUser } from './stat-types';

/**
 * BaseStatType naming convetion:
 *   [third stat]-[atk value]
 *   third stat: crit, res
 *   atk value: low, med, high
 */
export type BaseStatType =
	| 'crit-low'
	| 'crit-med'
	| 'crit-high'
	| 'res-low'
	| 'res-med'
	| 'res-high';
export type BaseStatValue = {
	[key in StatGearUser | StatBuffs]?: [number, number];
};

export type WeaponSettingStuff = {
	id: string;
	icon: string;
	resonances?: OrderedResoTriggers;
	effects?: WeaponEffectsIds[];
	reso_effects?: ResoEffectsIds[]; // would merge with weapon
	notes?: string;
};

export type SettingSkill = {
	choices: {
		[key: string]: WeaponSettingStuff;
	};
	default: string[];
	type: 'skill';
};

export type SettingElement = {
	choices: {
		[key in Elements]: WeaponSettingStuff;
	};
	default: Elements;
	manual: boolean;
	type: 'element';
};

export type Weapon = {
	id: WeaponsIds;
	name: string;
	base_stat: BaseStatType;
	resonances: OrderedResoTriggers;
	onfieldness?: number; // priority for onfielding, need to determine this later on
	effects: WeaponEffectsIds[];
	reso_effects?: ResoEffectsIds[];

	settings?: SettingElement[];
};

export type UserWeapon = {
	id: WeaponsIds;
	advancement?: number;
	setting?: string[]; // must refer to ids
};

export type WeaponView = {
	id: WeaponsIds;
	name: string;
	resonances: OrderedResoTriggers;
	onfieldness?: number;
	settings: WeaponSettingStuff[];

	base_stat: StatCollection;
	effects: WeaponEffect[];
	stat: StatCollection;

	advancement: number;
};

export type Matrix = {
	id: MatrixIds;
	name: string;
	effects: MatrixEffectsIds[];
};

export type UserMatrix = {
	id: MatrixIds;
	advancement?: number;
};

export type MatrixView = {
	id: MatrixIds;
	name: string;

	effects: MatrixFinalEffect[];
	stat: StatCollection;

	advancement: number;
};

export type Relic = {
	id: RelicIds;
	name: string;
	effects: RelicEffectsIds[];
};

export type UserRelic = {
	id: RelicIds;
	advancement?: number;
};

export type RelicView = {
	id: RelicIds;
	name: string;
	effects: RelicEffect[];
	stat: StatCollection;

	advancement: number;
};

export type Trait = {
	id: TraitIds;
	name: string;
	effects: TraitEffectsIds[];
};

export type UserTrait = TraitIds;

export type TraitView = {
	id: TraitsIds;
	name: string;
	effects: FinalizedTraitEffect[];
	stat: StatCollection;
};
