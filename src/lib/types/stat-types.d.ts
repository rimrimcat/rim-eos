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
export type StatGearFinalUseful =
	| 'hp'
	| 'crit'
	| 'crit_percent'
	| 'phys_atk'
	| 'flame_atk'
	| 'frost_atk'
	| 'volt_atk'
	| 'alt_atk'
	| 'crit_dmg_percent'
	| 'phys_res'
	| 'flame_res'
	| 'frost_res'
	| 'volt_res'
	| 'alt_res';

/**
 * Stats that are finalized on character screen
 */
export type StatGearFinal =
	| 'hp'
	| 'crit'
	| 'crit_percent'
	| 'phys_atk'
	| 'flame_atk'
	| 'frost_atk'
	| 'volt_atk'
	| 'alt_atk'
	| 'end'
	| 'end_regen'
	| 'crit_dmg_percent'
	| 'phys_res'
	| 'flame_res'
	| 'frost_res'
	| 'volt_res'
	| 'alt_res';

/*
 * Temporary typing for character stat screen
 */
export type CharacterStat = {
	key: StatGearFinal;
	name: string;
	icon: string;
	value: string;
};

/**
 * Stats that are not present on gear
 * TODO: subdivide dmg_percent to different multipliers
 * Elemental atk === Atk
 */
export type StatNonGear =
	| 'atk_percent'
	| 'dmg_percent'
	| 'final_dmg_percent'
	| 'ele_dmg_percent'
	| 'crit_dmg_percent'
	| 'healing_percent'
	| 'shatter';

export type StatDebuffs =
	// res ignores
	| 'res_ignore_percent' // all elements
	| 'phys_res_ignore_percent'
	| 'flame_res_ignore_percent'
	| 'frost_res_ignore_percent'
	| 'volt_res_ignore_percent'
	| 'alt_res_ignore_percent'
	// dmg increase debuff
	| 'final_dmg_increase_percent' // separate from ele
	// ele dmg increase debuffs
	| 'ele_dmg_taken_percent'
	| 'phys_dmg_taken_percent'
	| 'flame_dmg_taken_percent'
	| 'frost_dmg_taken_percent'
	| 'volt_dmg_taken_percent'
	| 'alt_dmg_taken_percent'
	// others
	| 'res_reduction_percent'
	| 'crit_res_reduction_percent'
	| 'shield_dmg_reduction_ignore_percent';

export type StatKey = StatGearUser | StatNonGear | StatDebuffs;
export type AllStats = StatKey | StatGearTitan | StatGearFinal;

export type StatConstant = {
	base: number;
	low_roll: number;
	high_roll: number;
	titan_base: number;
	titan_multiplier: number;
};

export type StatConstants = Record<StatGearUser, StatConstant>;

export type StatData = {
	[key in StatKey]?: number;
};

// still thinking where to move these
export type BaseStats14 = [
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string
];

export type BaseStats14Number = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

export type BaseStats16 = [
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string
];

export type BaseStats16Number = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

export type AtkStats5 = [string, string, string, string, string];
export type AtkStats5Number = [number, number, number, number, number];
