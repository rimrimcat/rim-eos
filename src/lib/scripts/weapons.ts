import type { StatData } from './stat-ops';
import type { StatGearUser, StatNonGear } from './stats';

type Resonance =
	| 'atk'
	| 'fort'
	| 'bene'
	| 'phys'
	| 'phys'
	| 'flame'
	| 'frost'
	| 'volt'
	| 'alt'
	| 'frost-volt-fusion'
	| 'flame-phys-fusion'
	| 'ny-alt';
type Advancement = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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

type Target = 'self' | 'ally' | 'team' | 'enemy';

type Effect = {
	id: string;
	stats: StatData;
	duration?: number; // cooldown and duration only matter if not 100% uptime or if onfield
	cooldown?: number;
	target: Target;
	required_reso?: Resonance[];
	required_adv?: Advancement;
	notes?: string;
};

export type Weapon = {
	name: string;
	base_stat: BaseStatType;
	resonances: Resonance[];
	onfieldness?: number; // priority for onfielding, need to determine this later on
	effects: Effect[];
};

export type UserWeapon = {
	id: string;
	advancement?: Advancement;
};

export type WeaponView = Weapon & {
	advancement: Advancement;
};

export const ALL_WEAPONS: {
	[key: string]: Weapon;
} = {
	invalid: {
		name: 'Invalid',
		base_stat: 'crit-med',
		resonances: ['atk'],
		effects: []
	},
	grayfox: {
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
				required_reso: ['bene']
			},
			{
				id: 'gf-a3-debuff',
				stats: {
					crit_res_reduction_percent: 10
				},
				target: 'enemy',
				required_adv: 3,
				required_reso: ['bene'],
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
		]
	},
	nola_frost: {
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
		]
	},
	nanyin: {
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
		]
	}
};
