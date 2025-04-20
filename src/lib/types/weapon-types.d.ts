import type {
	MatrixEffectsIds,
	MatrixIds,
	RelicEffectsIds,
	RelicIds,
	ResoEffectsIds,
	WeaponEffectsIds,
	WeaponsIds
} from '../generated/ids';
import type { StatCollection } from '../scripts/stats';
import type {
	MatrixFinalEffect,
	OrderedResoTriggers,
	RelicEffect,
	ResoTriggers
} from './effect-types';
import type { StatBuffs, StatGearUser } from './stat-types';

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
	resonances?: ResoTriggers[];
	effects?: WeaponEffectsIds[];
	reso_effects?: ResoEffectsIds[]; // would merge with weapon
	notes?: string;
};

export type WeaponSetting = {
	choices: {
		[key: string]: WeaponSettingStuff;
	};
	default: string[];
	type: 'element' | 'skill';
};

export type Weapon = {
	id: WeaponsIds;
	name: string;
	base_stat: BaseStatType;
	resonances: OrderedResoTriggers;
	onfieldness?: number; // priority for onfielding, need to determine this later on
	effects: WeaponEffectsIds[];
	reso_effects?: ResoEffectsIds[];

	setting?: WeaponSetting;
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
	setting: WeaponSettingStuff[];

	base_stat: StatCollection;
	effects: RelicEffect[];
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
