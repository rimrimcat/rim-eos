/*
 * Temporary typing for character stat screen
 */
export type AttributeItem = {
	name: string;
	icon: string;
	value: string;
};

/**
 * Gear stats that can be added by the user
 */
export type StatGearUser =
	| 'hp'
	| 'hp_percent'
	| 'atk'
	| 'flame_atk'
	| 'frost_atk'
	| 'volt_atk'
	| 'phys_atk'
	| 'alt_atk'
	| 'flame_atk_percent'
	| 'frost_atk_percent'
	| 'volt_atk_percent'
	| 'phys_atk_percent'
	| 'alt_atk_percent'
	| 'flame_dmg_percent'
	| 'frost_dmg_percent'
	| 'volt_dmg_percent'
	| 'phys_dmg_percent'
	| 'alt_dmg_percent'
	| 'crit'
	| 'crit_percent'
	| 'res'
	| 'flame_res'
	| 'frost_res'
	| 'volt_res'
	| 'alt_res'
	| 'phys_res'
	| 'res_percent'
	| 'flame_res_percent'
	| 'frost_res_percent'
	| 'volt_res_percent'
	| 'alt_res_percent'
	| 'phys_res_percent';

/**
 * Gear stats that are derived from the user's stats
 */
export type StatGearTitan =
	| 'titan_hp'
	| 'titan_hp_percent'
	| 'titan_atk'
	| 'titan_flame_atk'
	| 'titan_frost_atk'
	| 'titan_volt_atk'
	| 'titan_phys_atk'
	| 'titan_alt_atk'
	| 'titan_atk_percent'
	| 'titan_flame_atk_percent'
	| 'titan_frost_atk_percent'
	| 'titan_volt_atk_percent'
	| 'titan_phys_atk_percent'
	| 'titan_alt_atk_percent'
	| 'titan_flame_dmg_percent'
	| 'titan_frost_dmg_percent'
	| 'titan_volt_dmg_percent'
	| 'titan_phys_dmg_percent'
	| 'titan_alt_dmg_percent'
	| 'titan_crit'
	| 'titan_crit_percent'
	| 'titan_res'
	| 'titan_flame_res'
	| 'titan_frost_res'
	| 'titan_volt_res'
	| 'titan_alt_res'
	| 'titan_phys_res'
	| 'titan_res_percent'
	| 'titan_flame_res_percent'
	| 'titan_frost_res_percent'
	| 'titan_volt_res_percent'
	| 'titan_alt_res_percent'
	| 'titan_phys_res_percent';

/**
 * Stats that are finalized on character screen
 */
export type StatGearFinal =
	| 'hp'
	| 'crit'
	| 'crit_percent'
	| 'crit_damage'
	| 'phys_atk'
	| 'flame_atk'
	| 'frost_atk'
	| 'volt_atk'
	| 'alt_atk'
	| 'res'
	| 'phys_res'
	| 'flame_res'
	| 'frost_res'
	| 'volt_res'
	| 'alt_res';

/**
 * Stats that are not present on gear
 * TODO: subdivide dmg_percent to different multipliers
 */
export type StatNonGear =
	| 'atk_percent'
	| 'dmg_percent'
	| 'ele_atk'
	| 'ele_atk_percent'
	| 'ele_dmg_percent';

export type AllStats = StatGearUser | StatGearTitan | StatNonGear;

export const STAT_LABELS: Record<AllStats, string> = {
	hp: 'HP',
	hp_percent: 'HP',
	crit: 'Crit',
	crit_percent: 'Crit',
	res: 'Res',
	res_percent: 'Res',
	atk: 'ATK',
	atk_percent: 'ATK',
	ele_atk: 'Ele Atk',
	ele_atk_percent: 'Ele Atk',
	dmg_percent: 'Dmg',
	ele_dmg_percent: 'Ele Dmg',
	phys_atk: 'Phys Atk',
	phys_atk_percent: 'Phys Atk',
	phys_dmg_percent: 'Phys Dmg',
	phys_res: 'Phys Res',
	phys_res_percent: 'Phys Res',
	flame_atk: 'Flame Atk',
	flame_atk_percent: 'Flame Atk',
	flame_dmg_percent: 'Flame Dmg',
	flame_res: 'Flame Res',
	flame_res_percent: 'Flame Res',
	frost_atk: 'Frost Atk',
	frost_atk_percent: 'Frost Atk',
	frost_dmg_percent: 'Frost Dmg',
	frost_res: 'Frost Res',
	frost_res_percent: 'Frost Res',
	volt_atk: 'Volt Atk',
	volt_atk_percent: 'Volt Atk',
	volt_dmg_percent: 'Volt Dmg',
	volt_res: 'Volt Res',
	volt_res_percent: 'Volt Res',
	alt_atk: 'Alt Atk',
	alt_atk_percent: 'Alt Atk',
	alt_dmg_percent: 'Alt Dmg',
	alt_res: 'Alt Res',
	alt_res_percent: 'Alt Res',
	// Titan stats
	titan_hp: 'Titan HP',
	titan_hp_percent: 'Titan HP',
	titan_atk: 'Titan ATK',
	titan_flame_atk: 'Titan Flame Atk',
	titan_frost_atk: 'Titan Frost Atk',
	titan_volt_atk: 'Titan Volt Atk',
	titan_phys_atk: 'Titan Phys Atk',
	titan_alt_atk: 'Titan Alt Atk',
	titan_atk_percent: 'Titan ATK',
	titan_flame_atk_percent: 'Titan Flame Atk',
	titan_frost_atk_percent: 'Titan Frost Atk',
	titan_volt_atk_percent: 'Titan Volt Atk',
	titan_phys_atk_percent: 'Titan Phys Atk',
	titan_alt_atk_percent: 'Titan Alt Atk',
	titan_flame_dmg_percent: 'Titan Flame Dmg',
	titan_frost_dmg_percent: 'Titan Frost Dmg',
	titan_volt_dmg_percent: 'Titan Volt Dmg',
	titan_phys_dmg_percent: 'Titan Phys Dmg',
	titan_alt_dmg_percent: 'Titan Alt Dmg',
	titan_crit: 'Titan Crit',
	titan_crit_percent: 'Titan Crit',
	titan_res: 'Titan Res',
	titan_flame_res: 'Titan Flame Res',
	titan_frost_res: 'Titan Frost Res',
	titan_volt_res: 'Titan Volt Res',
	titan_alt_res: 'Titan Alt Res',
	titan_phys_res: 'Titan Phys Res',
	titan_res_percent: 'Titan Res',
	titan_flame_res_percent: 'Titan Flame Res',
	titan_frost_res_percent: 'Titan Frost Res',
	titan_volt_res_percent: 'Titan Volt Res',
	titan_alt_res_percent: 'Titan Alt Res',
	titan_phys_res_percent: 'Titan Phys Res'
};

type StatConstant = {
	base: number;
	low_roll: number;
	high_roll: number;
	titan_base: number;
	titan_multiplier: number;
};

/**
 * Constants for calculating stat values
 */
export const STAT_CONSTANTS: Record<StatGearUser, StatConstant> = {
	hp: {
		base: 4125,
		low_roll: 7480,
		high_roll: 18700,
		titan_base: 19937,
		titan_multiplier: 0.1
	},
	hp_percent: {
		base: 0.94,
		low_roll: 1.08,
		high_roll: 1.08,
		titan_base: 0.681,
		titan_multiplier: 0.05
	},
	atk: {
		base: 52,
		low_roll: 93,
		high_roll: 234,
		titan_base: 249,
		titan_multiplier: 0.1
	},
	crit: {
		base: 258,
		low_roll: 468,
		high_roll: 1169,
		titan_base: 1246,
		titan_multiplier: 0.1
	},
	crit_percent: {
		base: 1.05,
		low_roll: 1.19,
		high_roll: 1.19,
		titan_base: 0,
		titan_multiplier: 0
	},
	res: {
		base: 64,
		low_roll: 117,
		high_roll: 292,
		titan_base: 272,
		titan_multiplier: 0.1
	},
	alt_atk: {
		base: 137,
		low_roll: 249,
		high_roll: 623,
		titan_base: 0,
		titan_multiplier: 0
	},
	alt_res: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 0,
		titan_multiplier: 0
	},
	alt_res_percent: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 0,
		titan_multiplier: 0
	},
	flame_atk: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	frost_atk: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	volt_atk: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	phys_atk: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	flame_atk_percent: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	frost_atk_percent: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	volt_atk_percent: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	phys_atk_percent: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	alt_atk_percent: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0,
		titan_multiplier: 0
	},
	flame_dmg_percent: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	frost_dmg_percent: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	volt_dmg_percent: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	phys_dmg_percent: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	alt_dmg_percent: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0,
		titan_multiplier: 0
	},
	flame_res: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	frost_res: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	volt_res: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	phys_res: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	res_percent: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	flame_res_percent: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	frost_res_percent: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	volt_res_percent: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	phys_res_percent: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	}
};

export const USER_STATS_LIST: StatGearUser[] = [
	'hp',
	'hp_percent',
	'atk',
	'flame_atk',
	'frost_atk',
	'volt_atk',
	'phys_atk',
	'alt_atk',
	'flame_atk_percent',
	'frost_atk_percent',
	'volt_atk_percent',
	'phys_atk_percent',
	'alt_atk_percent',
	'flame_dmg_percent',
	'frost_dmg_percent',
	'volt_dmg_percent',
	'phys_dmg_percent',
	'alt_dmg_percent',
	'crit',
	'crit_percent',
	'res',
	'flame_res',
	'frost_res',
	'volt_res',
	'alt_res',
	'phys_res',
	'res_percent',
	'flame_res_percent',
	'frost_res_percent',
	'volt_res_percent',
	'alt_res_percent',
	'phys_res_percent'
];

export const ALL_STATS_LIST = [
	'hp',
	'hp_percent',
	'atk',
	'flame_atk',
	'frost_atk',
	'volt_atk',
	'phys_atk',
	'alt_atk',
	'atk_percent',
	'flame_atk_percent',
	'frost_atk_percent',
	'volt_atk_percent',
	'phys_atk_percent',
	'alt_atk_percent',
	'dmg_percent',
	'flame_dmg_percent',
	'frost_dmg_percent',
	'volt_dmg_percent',
	'phys_dmg_percent',
	'alt_dmg_percent',
	'crit',
	'crit_percent',
	'res',
	'flame_res',
	'frost_res',
	'volt_res',
	'alt_res',
	'phys_res',
	'res_percent',
	'flame_res_percent',
	'frost_res_percent',
	'volt_res_percent',
	'alt_res_percent',
	'phys_res_percent',
	'titan_hp',
	'titan_hp_percent',
	'titan_atk',
	'titan_flame_atk',
	'titan_frost_atk',
	'titan_volt_atk',
	'titan_phys_atk',
	'titan_alt_atk',
	'titan_atk_percent',
	'titan_flame_atk_percent',
	'titan_frost_atk_percent',
	'titan_volt_atk_percent',
	'titan_phys_atk_percent',
	'titan_alt_atk_percent',
	'titan_dmg_percent',
	'titan_flame_dmg_percent',
	'titan_frost_dmg_percent',
	'titan_volt_dmg_percent',
	'titan_phys_dmg_percent',
	'titan_alt_dmg_percent',
	'titan_crit',
	'titan_crit_percent',
	'titan_res',
	'titan_flame_res',
	'titan_frost_res',
	'titan_volt_res',
	'titan_alt_res',
	'titan_phys_res',
	'titan_res_percent',
	'titan_flame_res_percent',
	'titan_frost_res_percent',
	'titan_volt_res_percent',
	'titan_alt_res_percent',
	'titan_phys_res_percent'
];
