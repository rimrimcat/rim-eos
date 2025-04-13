import type {
	MatrixEffectsIds,
	MatrixIds,
	ResoEffectsIds,
	WeaponEffectsIds,
	WeaponsIds
} from '../generated/ids';
import type { StatCollection, StatData } from './stat-ops';
import type { StatDebuffs, StatGearUser, StatNonGear } from './stats';

export type ResoTriggers = 'atk' | 'fort' | 'bene' | 'phys' | 'flame' | 'frost' | 'volt' | 'alt';
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
type BaseStatType = 'crit-low' | 'crit-med' | 'crit-high' | 'res-low' | 'res-med' | 'res-high';
type BaseStatValue = {
	[key in StatGearUser | StatNonGear]?: [number, number];
};

/**
 * A0 LVL 200 values taken from toweroffantasy.info. Need someone to verify.
 */
export const WEAPON_BASE_STATS: Record<BaseStatType, BaseStatValue> = {
	'crit-high': {
		atk: [656, 1627],
		crit: [468, 937],
		hp: [39999, 79999]
	},
	'crit-med': {
		atk: [650, 1612],
		crit: [499, 998],
		hp: [39999, 79999]
	},
	'crit-low': {
		atk: [650, 1611],
		crit: [499, 1000],
		hp: [39999, 79999]
	},
	'res-high': {
		atk: [500, 1160],
		res: [312, 624],
		hp: [39999, 86400]
	},
	'res-med': {
		atk: [500, 1080],
		res: [312, 624],
		hp: [39999, 92800]
	},
	'res-low': {
		atk: [531, 1062],
		res: [273, 546],
		hp: [39999, 99200]
	}
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
	}; // must be greater than length of default!
	default: string[];
};

export type Weapon = {
	id: WeaponsIds;
	name: string;
	base_stat: BaseStatType;
	resonances: ResoTriggers[];
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
	resonances: ResoTriggers[];
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
