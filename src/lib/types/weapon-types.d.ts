import type { StatCollection } from '$lib/scripts/stats';
import type {
	MatrixEffectsIds,
	MatrixIds,
	ResoEffectsIds,
	WeaponEffectsIds,
	WeaponsIds
} from '../generated/ids';
import type { StatDebuffs, StatGearUser, StatNonGear } from './stat-types';

export type ResoElement = 'phys' | 'flame' | 'frost' | 'volt' | 'alt' | 'none';
export type ResoRole = 'atk' | 'fort' | 'bene' | 'none';
export type ResoExtra = 'armor-dissolve' | 'force-impact';
export type ResoTriggers = ResoElement | ResoRole | ResoExtra;
export type OrderedResoTriggers = [ResoElement, ResoRole, ...ResoTriggers[]];

export type Target = 'self' | 'ally' | 'team' | 'enemy';
export type ResoTriggerCounts = { [key in ResoTriggers]?: number };

export type MatrixStatData = {
	[key in StatGearUser | StatNonGear | StatDebuffs]?: [number, number, number, number];
};

export type BaseEffect = {
	id: string;
	target?: Target; // defaults to self
	duration?: number; // cooldown and duration only matter if not 100% uptime or if onfield
	cooldown?: number;

	require_reso?: ResoTriggers;
	require_reso_not?: ResoTriggers;
	require_reso_count?: number; // defaults to 2

	require_teamplay?: boolean;

	require_weapon?: WeaponsIds;

	notes?: string;
};

export type WeaponEffect = BaseEffect & {
	id: WeaponEffectsIds;
	stats: StatData;
	require_adv?: number; // required advancement (esp. for weapons)
};

export type ResoEffect = BaseEffect & {
	id: ResoEffectsIds;
	stats: StatData;
	require_reso: ResoTriggers;
};

export type MatrixEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: MatrixStatData;
};

export type MatrixFinalEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: StatData;
};

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
	[key in StatGearUser | StatNonGear]?: [number, number];
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
