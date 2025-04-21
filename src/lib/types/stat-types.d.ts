/**
 * Pretty self explanatory
 */
export type Elements = 'phys' | 'flame' | 'frost' | 'volt' | 'alt';

/**
 * Gear stats that can be added by the user
 */
export type StatGearUser =
	| 'hp'
	| 'hp_percent'
	| 'atk'
	| `${Elements}_atk`
	| `${Elements}_atk_percent`
	| `${Elements}_dmg_percent`
	| 'crit'
	| 'crit_percent'
	| 'res'
	| `${Elements}_res`
	| 'res_percent'
	| `${Elements}_res_percent`;

/**
 * Gear stats that are derived from the user's stats
 */
export type StatGearTitan = `titan_${StatGearUser}`;

/**
 * Stats that are finalized on character screen, except endurance
 */
export type StatGearFinalUseful =
	| 'hp'
	| 'crit'
	| 'crit_percent'
	| `${Elements}_atk`
	| 'crit_dmg_percent'
	| `${Elements}_res`;

/**
 * Stats that are finalized on character screen
 */
export type StatGearFinal = StatGearFinalUseful | 'end' | 'end_regen';

/*
 * Temporary typing for character stat screen
 */
export type CharacterStat = {
	key: StatGearFinal;
	name: string;
	value: string;
};

/**
 * Stats that are not present on gear
 */
export type StatBuffs =
	| 'atk_percent'
	| 'final_dmg_percent'
	| 'ele_dmg_percent'
	| 'crit_dmg_percent'
	| 'healing_percent'
	| `relic_${Elements}_dmg_percent`
	| 'shatter'
	| 'coco_base_atk_percent';

/**
 * Debuffs
 */
export type StatDebuffs =
	// res ignores
	| 'res_ignore_percent' // all elements
	| `${Elements}_res_ignore_percent`

	// dmg increase debuff
	| 'final_dmg_taken_percent' // separate from ele

	// ele dmg increase debuffs
	| 'ele_dmg_taken_percent'
	| `${Elements}_dmg_taken_percent`

	// others
	| 'res_reduction_percent'
	| 'crit_res_reduction_percent'
	| 'shield_dmg_reduction_ignore_percent';

/**
 * Allows for quantification of base atk stats as percent
 */
export type StatAtkImprovement =
	| 'base_atk_improvement_percent'
	| `base_${Elements}_atk_improvement_percent`;

export type StatKey = StatGearUser | StatBuffs | StatDebuffs | StatAtkImprovement;

/**
 *  Only used to type STAT_LABELS
 */
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

export type MultiplierTypes = 'base_atk' | 'atk_percent' | 'final_dmg_percent' | 'ele_dmg_percent';

/**
 * For use with LumpedCollection
 */
export type LumpedKey =
	| `${Elements}_atk`
	| `${Elements}_atk_percent`
	| `${Elements}_dmg_percent`
	| `relic_${Elements}_dmg_percent`
	| 'crit'
	| 'crit_percent'
	| 'crit_dmg_percent'
	| 'final_dmg_percent';

/**
 * For use with LumpedCollection
 */
export type LumpedStatData = {
	[key in LumpedKey]?: number;
};
