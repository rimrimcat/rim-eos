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
	| 'phys_atk'
	| 'flame_atk'
	| 'frost_atk'
	| 'volt_atk'
	| 'alt_atk'
	| 'end'
	| 'end_regen'
	| 'crit_dmg'
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
	| 'crit_dmg'
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

export type AllStats = StatGearUser | StatGearTitan | StatNonGear | StatDebuffs | StatGearFinal;

export const STAT_LABELS: Record<AllStats, string> = {
	hp: 'HP',
	hp_percent: 'HP',
	crit: 'Crit',
	crit_percent: 'Crit',
	res: 'Res',
	res_percent: 'Res',
	atk: 'ATK',
	atk_percent: 'ATK',
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
	titan_phys_res_percent: 'Titan Phys Res',
	// other stat screen stuff
	end: 'Endurance',
	end_regen: 'Endurance Regen',
	crit_dmg: 'Crit Dmg',
	final_dmg_percent: 'Final Dmg',
	crit_res_reduction_percent: 'Crit Res Red',
	res_reduction_percent: 'Res Reduction',
	healing_percent: 'Healing',
	shield_dmg_reduction_ignore_percent: 'Shield Red Ignore',
	shatter: 'Shatter',
	// Resistance affecting
	res_ignore_percent: 'Res Ignore',
	phys_res_ignore_percent: 'Phys Res Ignore',
	flame_res_ignore_percent: 'Flame Res Ignore',
	frost_res_ignore_percent: 'Frost Res Ignore',
	volt_res_ignore_percent: 'Volt Res Ignore',
	alt_res_ignore_percent: 'Alt Res Ignore',
	final_dmg_increase_percent: 'Final Dmg Increase',
	ele_dmg_taken_percent: 'Ele Dmg Taken',
	phys_dmg_taken_percent: 'Phys Dmg Taken',
	flame_dmg_taken_percent: 'Flame Dmg Taken',
	frost_dmg_taken_percent: 'Frost Dmg Taken',
	volt_dmg_taken_percent: 'Volt Dmg Taken',
	alt_dmg_taken_percent: 'Alt Dmg Taken'
};

export type StatConstant = {
	base: number;
	low_roll: number;
	high_roll: number;
	titan_base: number;
	titan_multiplier: number;
};

export type StatConstants = Record<StatGearUser, StatConstant>;

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
