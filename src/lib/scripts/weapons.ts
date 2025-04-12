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

export type WeaponResonanceIds =
	| 'atk_reso'
	| 'fort_reso'
	| 'bene_reso'
	| 'phys_reso'
	| 'flame_reso'
	| 'frost_reso'
	| 'volt_reso'
	| 'fiona_reso'
	| 'nanyin_reso';

export const WEAPON_RESONANCES: Record<WeaponResonanceIds, Effect[]> = {
	atk_reso: [
		{
			id: 'atk_reso',
			stats: {
				final_dmg_percent: 10
			},
			target: 'self',
			required_reso: 'atk'
		},
		{
			id: 'atk_reso_teamplay',
			stats: {
				final_dmg_percent: 40
			},
			target: 'self',
			required_reso: 'atk',
			require_teamplay: true
		}
	],
	fort_reso: [],
	bene_reso: [],
	phys_reso: [
		{
			id: 'phys_reso',
			stats: {
				phys_atk_percent: 15,
				phys_dmg_percent: 25
			},
			target: 'self',
			required_reso: 'phys'
		}
	],
	flame_reso: [
		{
			id: 'flame_reso',
			stats: {
				flame_atk_percent: 15,
				flame_dmg_percent: 25
			},
			target: 'self',
			required_reso: 'flame'
		}
	],
	frost_reso: [
		{
			id: 'frost_reso',
			stats: {
				frost_atk_percent: 15,
				frost_dmg_percent: 25
			},
			target: 'self',
			required_reso: 'frost'
		}
	],
	volt_reso: [
		{
			id: 'volt_reso',
			stats: {
				volt_atk_percent: 15,
				volt_dmg_percent: 25
			},
			target: 'self',
			required_reso: 'volt'
		}
	],
	fiona_reso: [
		{
			id: 'fiona_reso',
			stats: {
				atk_percent: 20,
				alt_res_percent: 30
			},
			target: 'self',
			required_reso: 'alt'
		}
	],
	nanyin_reso: [
		{
			id: 'nanyin_reso',
			stats: {
				alt_atk_percent: 30
			},
			target: 'self',
			required_reso: 'alt',
			required_reso_count: 3
		}
	]
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
	id: string;
	name: string;
	base_stat: BaseStatType;
	resonances: Resonance[];
	onfieldness?: number; // priority for onfielding, need to determine this later on
	effects: Effect[];
	reso_effects?: WeaponResonanceIds[];
};

export type UserWeapon = {
	id: string;
	advancement?: number;
};

export type WeaponView = Weapon & {
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
		resonances: ['atk'],
		effects: []
	},
	grayfox: {
		id: 'grayfox',
		name: 'Grayfox',
		base_stat: 'crit-med',
		resonances: ['bene', 'frost', 'volt', 'frost-volt-fusion'],
		effects: [
			{
				id: 'gf-skill',
				stats: {
					frost_dmg_percent: 12
				},
				target: 'self'
			},
			{
				id: 'gf-a3-buff',
				stats: {
					final_dmg_percent: 25
				},
				target: 'team',
				required_adv: 3,
				required_reso: 'bene'
			},
			{
				id: 'gf-a3-debuff',
				stats: {
					crit_res_reduction_percent: 10
				},
				target: 'enemy',
				required_adv: 3,
				required_reso: 'bene',
				notes: 'Stacking effect'
			},
			{
				id: 'gf-a6',
				stats: {
					frost_dmg_percent: 30
				},
				required_adv: 6,
				target: 'self'
			}
		],
		reso_effects: ['frost_reso', 'volt_reso']
	},
	nola_frost: {
		id: 'nola_frost',
		name: 'Nola Frost',
		base_stat: 'crit-med',
		resonances: ['atk', 'frost', 'volt', 'frost-volt-fusion'],
		effects: [
			{
				id: 'nola-frost-skill',
				stats: {
					frost_dmg_percent: 6
				},
				target: 'self',
				notes: '100% uptime due to Liquid Nitrogen passive'
			},
			{
				id: 'nola-a3',
				stats: {
					res_ignore_percent: 15
				},
				required_adv: 3,
				target: 'enemy'
			},
			{
				id: 'nola-a6',
				stats: {
					final_dmg_percent: 35
				},
				required_adv: 6,
				target: 'self'
			}
		],
		reso_effects: ['frost_reso', 'volt_reso']
	},
	nanyin: {
		id: 'nanyin',
		name: 'Nan Yin',
		base_stat: 'crit-low',
		resonances: ['atk', 'ny-alt'],
		effects: [
			{
				id: 'nanyin-inhabit',
				stats: {
					normal_dmg_percent: 15
				},
				target: 'self',
				duration: 0
			},
			{
				id: 'nanyin-a5',
				stats: {
					res_ignore_percent: 30
				},
				target: 'enemy',
				required_adv: 5
			},
			{
				id: 'nanyin-a6',
				stats: {
					final_dmg_percent: 35
				},
				target: 'self',
				required_adv: 6
			}
		],
		reso_effects: ['nanyin_reso']
	}
};
