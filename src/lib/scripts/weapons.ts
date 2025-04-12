import type { EffectsIds, ResoEffectsIds, WeaponsIds } from '../generated/ids';
import type { StatCollection, StatData } from './stat-ops';
import type { StatGearUser, StatNonGear } from './stats';

export type ResoTriggers = 'atk' | 'fort' | 'bene' | 'phys' | 'flame' | 'frost' | 'volt' | 'alt';
type Target = 'self' | 'ally' | 'team' | 'enemy';
export type ResoTriggerCounts = Record<ResoTriggers, number>;

export type Effect = {
	id: string;
	stats: StatData;
	duration?: number; // cooldown and duration only matter if not 100% uptime or if onfield
	cooldown?: number;
	target: Target;
	required_reso?: ResoTriggers;
	required_reso_count?: number; // defaults to 2
	required_adv?: number;
	require_teamplay?: boolean;
	notes?: string;
};

export type Resonance =
	| 'atk'
	| 'fort'
	| 'bene'
	| 'phys'
	| 'flame'
	| 'frost'
	| 'volt'
	| 'alt'
	| 'frost-volt-fusion'
	| 'flame-phys-fusion'
	| 'ny-alt';

export const RESONANCE_SOLO: Record<Resonance, StatData> = {
	atk: {
		atk_percent: 10
	},
	fort: {},
	bene: {},
	phys: {
		phys_atk_percent: 15
	},
	flame: {
		flame_atk_percent: 15
	},
	frost: {
		frost_atk_percent: 15
	},
	volt: {
		volt_atk_percent: 15
	},
	alt: {},
	'frost-volt-fusion': {},
	'flame-phys-fusion': {},
	'ny-alt': {}
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

export type Weapon = {
	id: WeaponsIds;
	name: string;
	base_stat: BaseStatType;
	resonances: Resonance[];
	onfieldness?: number; // priority for onfielding, need to determine this later on
	effects: EffectsIds[];
	reso_effects?: ResoEffectsIds[];
};

export type UserWeapon = {
	id: WeaponsIds;
	advancement?: number;
};

export type WeaponView = {
	id: WeaponsIds;
	name: string;
	base_stat: BaseStatType;
	resonances: Resonance[];
	onfieldness?: number;

	effects: Effect[];
	reso_effects?: Effect[];

	advancement: number;
	stats: StatCollection;
};

export const ALL_WEAPONS: {
	[key: string]: Weapon;
} = {
	invalid: {
		id: 'invalid',
		name: 'Invalid',
		base_stat: 'crit-med',
		resonances: [],
		effects: []
	},
	grayfox: {
		id: 'grayfox',
		name: 'Grayfox',
		base_stat: 'crit-med',
		resonances: ['bene', 'frost', 'volt', 'frost-volt-fusion'],
		effects: ['grayfox-skill', 'grayfox-a3-buff', 'grayfox-a3-debuff', 'grayfox-a6'],
		reso_effects: ['frost-reso', 'volt-reso']
	},
	nola_frost: {
		id: 'nola-frost',
		name: 'Nola Frost',
		base_stat: 'crit-med',
		resonances: ['atk', 'frost', 'volt', 'frost-volt-fusion'],
		effects: ['nola-frost-skill', 'nola-a3', 'nola-a6'],
		reso_effects: ['frost-reso', 'volt-reso']
	},
	nanyin: {
		id: 'nanyin',
		name: 'Nan Yin',
		base_stat: 'crit-low',
		resonances: ['atk', 'ny-alt'],
		effects: ['nanyin-inhabit', 'nanyin-a5', 'nanyin-a6'],
		reso_effects: ['nanyin-reso']
	}
};
