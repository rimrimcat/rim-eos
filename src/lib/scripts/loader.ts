// Types
export type AttributeItem = {
	name: string;
	icon: string;
	value: string;
	index: number;
};

export enum GearParts {
	HELMET = 'H',
	SPAULDERS = 'S',
	ARMOR = 'A',
	BRACERS = 'C',
	BELT = 'B',
	LEGGUARDS = 'L',
	//
	GLOVES = 'G',
	BOOTS = 'T',
	//
	VISOR = 'V',
	ENGINE = 'N',
	EXOSKELETON = 'X',
	REACTOR = 'R',
	//
	UNKNOWN = 'U'
}

export enum GearStat {
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
	CRIT_DMG = 'crit_dmg',
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

export type GearValidStats = {
	[key in GearStat]?: string;
};

type GearId = {
	id: number;
	part: (typeof GearParts)[keyof typeof GearParts];
};

export type GearStatItem = {
	stat: GearStat;
	stat_label: string;
	value: number;
	value_label: string;
	roll?: number;
};

export type Gear = GearId & GearValidStats;
export type GearView = GearId & {
	stats: GearStatItem[];
};

// Keys
export enum StorageKey {
	STATS = 'stats_main',
	GEARS_V1 = 'gears_v1',
	STYLES = 'styles'
}

// Templates
const TEMPLATE_USER_ATTRIBUTES = [
	{ name: 'HP', icon: './stat/hp.webp', index: 0 },
	{ name: 'Crit', icon: './stat/crit.webp', index: 1 },
	{ name: 'Crit Rate', icon: './stat/crit.webp', index: 2 },
	{ name: 'Physical Attack', icon: './stat/physatk.webp', index: 3 },
	{ name: 'Flame Attack', icon: './stat/flameatk.webp', index: 4 },
	{ name: 'Frost Attack', icon: './stat/frostatk.webp', index: 5 },
	{ name: 'Volt Attack', icon: './stat/voltatk.webp', index: 6 },
	{ name: 'Altered Attack', icon: './stat/placeholder.webp', index: 7 },
	{ name: 'Endurance', icon: './stat/placeholder.webp', index: 8 },
	{ name: 'Endurance Regen Speed', icon: './stat/placeholder.webp', index: 9 },
	{ name: 'Crit Damage', icon: './stat/placeholder.webp', index: 10 },
	{ name: 'Physical Resistance', icon: './stat/physres.webp', index: 11 },
	{ name: 'Flame Resistance', icon: './stat/flameres.webp', index: 12 },
	{ name: 'Frost Resistance', icon: './stat/frostres.webp', index: 13 },
	{ name: 'Volt Resistance', icon: './stat/voltres.webp', index: 14 },
	{ name: 'Altered Resistance', icon: './stat/placeholder.webp', index: 15 }
] as const;

// Defaults
export const DEFAULT_STATS_MAIN = [
	'989317',
	'11318',
	'1.372',
	'15544',
	'16976',
	'14452',
	'17489',
	'18793',
	'1300',
	'0',
	'64',
	'8621',
	'14666',
	'14013',
	'10518',
	'4892'
] as const;

export const DEFAULT_STYLES = {
	// Base colors
	'bg-color': '#1e1e2e',
	'text-color': '#cdd6f4',
	'title-color': '#cba6f7',
	'border-color': '#313244',

	// Button colors
	'button-bg': '#313244',
	'button-text': '#cdd6f4',
	'button-border': '#45475a',
	'button-hover-bg': '#45475a',

	// Primary button colors
	'button-primary-bg': '#89b4fa',
	'button-primary-text': '#1e1e2e',
	'button-primary-border': '#74c7ec',
	'button-primary-hover-bg': '#74c7ec',

	// Interactive elements
	'hover-bg': '#313244',
	'active-bg': '#45475a',
	'focus-outline': '#89b4fa',

	// Overlay and shadows
	'overlay-bg': 'rgba(0, 0, 0, 0.5)',
	'shadow-color': 'rgba(0, 0, 0, 0.4)',

	// Status colors
	'error-color': '#f38ba8',
	'success-color': '#a6e3a1',
	'warning-color': '#f9e2af',
	'info-color': '#89dceb'
} as const;

export function loadObject(key: typeof StorageKey.STATS, force_default?: boolean): AttributeItem[];
export function loadObject(key: typeof StorageKey.GEARS_V1, force_default?: boolean): Gear[];
export function loadObject(
	key: typeof StorageKey.STYLES,
	force_default?: boolean
): typeof DEFAULT_STYLES;
export function loadObject(
	key: StorageKey,
	force_default?: boolean
): string[] | AttributeItem[] | Gear[] | null | typeof DEFAULT_STYLES {
	let loadedObject: string[] | Gear[] | null | typeof DEFAULT_STYLES = null;

	if (typeof localStorage !== 'undefined' && localStorage && !force_default) {
		const savedObject = localStorage.getItem(key);
		if (savedObject) {
			loadedObject = JSON.parse(savedObject);
		}
	} else {
		// for ssr
	}

	switch (key) {
		case StorageKey.STATS: {
			loadedObject = loadedObject as string[];

			const processedObject = loadedObject ? loadedObject : DEFAULT_STATS_MAIN;
			const user_attributes: AttributeItem[] = TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
				return {
					...attr,
					value: processedObject[index]
				};
			});
			return user_attributes;
		}
		case StorageKey.GEARS_V1: {
			loadedObject = loadedObject as Gear[];
			return loadedObject ? loadedObject : [];
		}
		default:
			break;
	}
	console.error('Unknown key: ' + key);
	return [''];
}

export async function saveObject(
	key: typeof StorageKey.STATS,
	value: AttributeItem[]
): Promise<void>;
export async function saveObject(key: typeof StorageKey.GEARS_V1, value: Gear[]): Promise<void>;
export async function saveObject(key: StorageKey, value: AttributeItem[] | Gear[]): Promise<void> {
	switch (key) {
		case StorageKey.STATS: {
			value = value as AttributeItem[];
			const toSaveObject = value.map((attr) => attr.value);
			localStorage.setItem(key, JSON.stringify(toSaveObject));
			break;
		}
		case StorageKey.GEARS_V1: {
			localStorage.setItem(key, JSON.stringify(value));
			break;
		}

		default:
			break;
	}
}

export function cloneObject(obj: object) {
	return JSON.parse(JSON.stringify(obj));
}
