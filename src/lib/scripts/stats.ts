/*
 * Temporary typing for character stat screen
 */
export type AttributeItem = {
	name: string;
	icon: string;
	value: string;
	index: number;
};

/**
 * Gear stats that can be added by the user
 */
export enum StatGearUser {
	HP = 'hp',
	HP_PERCENT = 'hp_percent',
	// Attack
	ATK = 'atk',
	FLAME_ATK = 'flame_atk',
	FROST_ATK = 'frost_atk',
	VOLT_ATK = 'volt_atk',
	PHYS_ATK = 'phys_atk',
	ALT_ATK = 'alt_atk',
	ELE_ATK = 'ele_atk',
	// Attack percent
	ATK_PERCENT = 'atk_percent',
	FLAME_ATK_PERCENT = 'flame_atk_percent',
	FROST_ATK_PERCENT = 'frost_atk_percent',
	VOLT_ATK_PERCENT = 'volt_atk_percent',
	PHYS_ATK_PERCENT = 'phys_atk_percent',
	ALT_ATK_PERCENT = 'alt_atk_percent',
	ELE_ATK_PERCENT = 'ele_atk_percent',
	// Damage percent
	DMG_PERCENT = 'dmg_percent',
	FLAME_DMG_PERCENT = 'flame_dmg_percent',
	FROST_DMG_PERCENT = 'frost_dmg_percent',
	VOLT_DMG_PERCENT = 'volt_dmg_percent',
	PHYS_DMG_PERCENT = 'phys_dmg_percent',
	ALT_DMG_PERCENT = 'alt_dmg_percent',
	ELE_DMG_PERCENT = 'ele_dmg_percent',
	// Crit
	CRIT = 'crit',
	CRIT_PERCENT = 'crit_percent',
	// Resistance
	RES = 'res',
	FLAME_RES = 'flame_res',
	FROST_RES = 'frost_res',
	VOLT_RES = 'volt_res',
	ALT_RES = 'alt_res',
	PHYS_RES = 'phys_res',
	// Resistance percent
	RES_PERCENT = 'res_percent',
	FLAME_RES_PERCENT = 'flame_res_percent',
	FROST_RES_PERCENT = 'frost_res_percent',
	VOLT_RES_PERCENT = 'volt_res_percent',
	ALT_RES_PERCENT = 'alt_res_percent',
	PHYS_RES_PERCENT = 'phys_res_percent'
}

/**
 * Gear stats that are derived from the user's stats
 */
export enum StatGearTitan {
	TITAN_HP = 'titan_hp',
	TITAN_HP_PERCENT = 'titan_hp_percent',
	// Attack
	TITAN_ATK = 'titan_atk',
	TITAN_FLAME_ATK = 'titan_flame_atk',
	TITAN_FROST_ATK = 'titan_frost_atk',
	TITAN_VOLT_ATK = 'titan_volt_atk',
	TITAN_PHYS_ATK = 'titan_phys_atk',
	TITAN_ALT_ATK = 'titan_alt_atk',
	TITAN_ELE_ATK = 'titan_ele_atk',
	// Attack percent
	TITAN_ATK_PERCENT = 'titan_atk_percent',
	TITAN_FLAME_ATK_PERCENT = 'titan_flame_atk_percent',
	TITAN_FROST_ATK_PERCENT = 'titan_frost_atk_percent',
	TITAN_VOLT_ATK_PERCENT = 'titan_volt_atk_percent',
	TITAN_PHYS_ATK_PERCENT = 'titan_phys_atk_percent',
	TITAN_ALT_ATK_PERCENT = 'titan_alt_atk_percent',
	TITAN_ELE_ATK_PERCENT = 'titan_ele_atk_percent',
	// Damage percent
	TITAN_DMG_PERCENT = 'titan_dmg_percent',
	TITAN_FLAME_DMG_PERCENT = 'titan_flame_dmg_percent',
	TITAN_FROST_DMG_PERCENT = 'titan_frost_dmg_percent',
	TITAN_VOLT_DMG_PERCENT = 'titan_volt_dmg_percent',
	TITAN_PHYS_DMG_PERCENT = 'titan_phys_dmg_percent',
	TITAN_ALT_DMG_PERCENT = 'titan_alt_dmg_percent',
	TITAN_ELE_DMG_PERCENT = 'titan_ele_dmg_percent',
	// Crit
	TITAN_CRIT = 'titan_crit',
	TITAN_CRIT_PERCENT = 'titan_crit_percent',
	// Resistance
	TITAN_RES = 'titan_res',
	TITAN_FLAME_RES = 'titan_flame_res',
	TITAN_FROST_RES = 'titan_frost_res',
	TITAN_VOLT_RES = 'titan_volt_res',
	TITAN_ALT_RES = 'titan_alt_res',
	TITAN_PHYS_RES = 'titan_phys_res',
	// Resistance percent
	TITAN_RES_PERCENT = 'titan_res_percent',
	TITAN_FLAME_RES_PERCENT = 'titan_flame_res_percent',
	TITAN_FROST_RES_PERCENT = 'titan_frost_res_percent',
	TITAN_VOLT_RES_PERCENT = 'titan_volt_res_percent',
	TITAN_ALT_RES_PERCENT = 'titan_alt_res_percent',
	TITAN_PHYS_RES_PERCENT = 'titan_phys_res_percent'
}

export const STAT_LABELS = {
	[StatGearUser.HP]: 'HP',
	[StatGearUser.HP_PERCENT]: 'HP',
	[StatGearUser.CRIT]: 'Crit',
	[StatGearUser.CRIT_PERCENT]: 'Crit',
	[StatGearUser.RES]: 'Res',
	[StatGearUser.RES_PERCENT]: 'Res',
	[StatGearUser.ATK]: 'ATK',
	[StatGearUser.PHYS_ATK]: 'Phys Atk',
	[StatGearUser.PHYS_ATK_PERCENT]: 'Phys Atk',
	[StatGearUser.PHYS_DMG_PERCENT]: 'Phys Dmg',
	[StatGearUser.PHYS_RES]: 'Phys Res',
	[StatGearUser.PHYS_RES_PERCENT]: 'Phys Res',
	[StatGearUser.FLAME_ATK]: 'Flame Atk',
	[StatGearUser.FLAME_ATK_PERCENT]: 'Flame Atk',
	[StatGearUser.FLAME_DMG_PERCENT]: 'Flame Dmg',
	[StatGearUser.FLAME_RES]: 'Flame Res',
	[StatGearUser.FLAME_RES_PERCENT]: 'Flame Res',
	[StatGearUser.FROST_ATK]: 'Frost Atk',
	[StatGearUser.FROST_ATK_PERCENT]: 'Frost Atk',
	[StatGearUser.FROST_DMG_PERCENT]: 'Frost Dmg',
	[StatGearUser.FROST_RES]: 'Frost Res',
	[StatGearUser.FROST_RES_PERCENT]: 'Frost Res',
	[StatGearUser.VOLT_ATK]: 'Volt Atk',
	[StatGearUser.VOLT_ATK_PERCENT]: 'Volt Atk',
	[StatGearUser.VOLT_DMG_PERCENT]: 'Volt Dmg',
	[StatGearUser.VOLT_RES]: 'Volt Res',
	[StatGearUser.VOLT_RES_PERCENT]: 'Volt Res',
	[StatGearUser.ALT_ATK]: 'Alt Atk',
	[StatGearUser.ALT_ATK_PERCENT]: 'Alt Atk',
	[StatGearUser.ALT_DMG_PERCENT]: 'Alt Dmg',
	[StatGearUser.ALT_RES]: 'Alt Res',
	[StatGearUser.ALT_RES_PERCENT]: 'Alt Res'
} as const;

export type StatConstant = {
	base: number;
	low_roll: number;
	high_roll: number;
	titan_base: number;
	titan_multiplier: number;
};

export type StatConstants = {
	[key in StatGearUser]: StatConstant;
};

/**
 * Constants for calculating stat values
 */
export const STAT_CONSTANTS: StatConstants = {
	[StatGearUser.HP]: {
		base: 4125,
		low_roll: 7480,
		high_roll: 18700,
		titan_base: 19937,
		titan_multiplier: 0.1
	},
	[StatGearUser.HP_PERCENT]: {
		base: 0.94,
		low_roll: 1.08,
		high_roll: 1.08,
		titan_base: 0.681,
		titan_multiplier: 0.05
	},
	[StatGearUser.ATK]: {
		base: 52,
		low_roll: 93,
		high_roll: 234,
		titan_base: 249,
		titan_multiplier: 0.1
	},
	[StatGearUser.CRIT]: {
		base: 258,
		low_roll: 468,
		high_roll: 1169,
		titan_base: 1246,
		titan_multiplier: 0.1
	},
	[StatGearUser.CRIT_PERCENT]: {
		base: 1.05,
		low_roll: 1.19,
		high_roll: 1.19,
		titan_base: 0,
		titan_multiplier: 0
	},
	[StatGearUser.RES]: {
		base: 64,
		low_roll: 117,
		high_roll: 292,
		titan_base: 272,
		titan_multiplier: 0.1
	},
	[StatGearUser.ALT_ATK]: {
		base: 137,
		low_roll: 249,
		high_roll: 623,
		titan_base: 0,
		titan_multiplier: 0
	},
	[StatGearUser.ALT_RES]: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 0,
		titan_multiplier: 0
	},
	[StatGearUser.ALT_RES_PERCENT]: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 0,
		titan_multiplier: 0
	},
	[StatGearUser.FLAME_ATK]: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	[StatGearUser.FROST_ATK]: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	[StatGearUser.VOLT_ATK]: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	[StatGearUser.PHYS_ATK]: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	[StatGearUser.ELE_ATK]: {
		base: 69,
		low_roll: 125,
		high_roll: 312,
		titan_base: 332,
		titan_multiplier: 0.1
	},
	[StatGearUser.ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	[StatGearUser.FLAME_ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	[StatGearUser.FROST_ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	[StatGearUser.VOLT_ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	[StatGearUser.PHYS_ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	[StatGearUser.ALT_ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0,
		titan_multiplier: 0
	},
	[StatGearUser.ELE_ATK_PERCENT]: {
		base: 1.26,
		low_roll: 1.44,
		high_roll: 1.44,
		titan_base: 0.909,
		titan_multiplier: 0.05
	},
	[StatGearUser.DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	[StatGearUser.FLAME_DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	[StatGearUser.FROST_DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	[StatGearUser.VOLT_DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	[StatGearUser.PHYS_DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	[StatGearUser.ALT_DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0,
		titan_multiplier: 0
	},
	[StatGearUser.ELE_DMG_PERCENT]: {
		base: 0.65,
		low_roll: 0.72,
		high_roll: 0.72,
		titan_base: 0.422,
		titan_multiplier: 0.05
	},
	[StatGearUser.FLAME_RES]: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	[StatGearUser.FROST_RES]: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	[StatGearUser.VOLT_RES]: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	[StatGearUser.PHYS_RES]: {
		base: 215,
		low_roll: 390,
		high_roll: 974,
		titan_base: 1038,
		titan_multiplier: 0.1
	},
	[StatGearUser.RES_PERCENT]: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	[StatGearUser.FLAME_RES_PERCENT]: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	[StatGearUser.FROST_RES_PERCENT]: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	[StatGearUser.VOLT_RES_PERCENT]: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	},
	[StatGearUser.PHYS_RES_PERCENT]: {
		base: 7.87,
		low_roll: 9,
		high_roll: 9,
		titan_base: 5.681,
		titan_multiplier: 0.05
	}
};
