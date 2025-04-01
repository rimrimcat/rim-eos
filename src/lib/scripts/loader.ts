// Types
export type AttributeItem = {
	name: string;
	icon: string;
	value: string;
	index: number;
};

export type GearColumn = {
	id: string;
	label: string;
	width?: number;
	hidden?: boolean;
	editable?: boolean;
};
export type GearRowData = {
	id: string;
	part: string;
	atk?: string;
	ele_atk?: string;
	total_atk?: string;
	ele_atk_percent?: string;
	ele_dmg_percent?: string;
	crit?: string;
	crit_percent?: string;
	// TODO: Add other stuff here
	validationErrors?: Record<string, boolean>;
};
export type GearSaveObject = {
	columns: GearColumn[];
	data: GearRowData[];
};

// Constants
export const LOCAL_STATS_MAIN = 'stats_main' as const;
export const LOCAL_GEAR_MAIN = 'gear_main' as const;

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
const TEMPLATE_GEAR_ROW_DATA: GearRowData[] = [
	{ id: 'main_helmet', part: 'Helmet' },
	{ id: 'main_spaulders', part: 'Spaulders' },
	{ id: 'main_armor', part: 'Armor' },
	{ id: 'main_armbands', part: 'Armbands' },
	{ id: 'main_belt', part: 'Belt' },
	{ id: 'main_legguards', part: 'Legguards' },
	{ id: 'main_gloves', part: 'Gloves' },
	{ id: 'main_boots,', part: 'Boots' },
	{ id: 'main_visor', part: 'Visor' },
	{ id: 'main_engine', part: 'Engine' },
	{ id: 'main_exoskeleton', part: 'Exoskeleton' },
	{ id: 'main_reactor', part: 'Reactor' }
] as const;

// Defaults
const DEFAULT_STATS_MAIN = [
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

export const DEFAULT_GEAR_MAIN_COLUMNS: GearColumn[] = [
	{ id: 'id', label: 'ID', hidden: true, editable: false },
	{ id: 'part', label: 'Part', editable: false },
	// Attack
	{ id: 'atk', label: 'Atk' },
	{ id: 'flame_atk', label: 'Flame Atk', hidden: true },
	{ id: 'frost_atk', label: 'Frost Atk', hidden: true },
	{ id: 'volt_atk', label: 'Volt Atk', hidden: true },
	{ id: 'phys_atk', label: 'Phys Atk', hidden: true },
	{ id: 'ele_atk', label: 'Ele Atk' },
	{ id: 'alt_atk', label: 'Alt Atk', hidden: true },
	// Attack Percent
	{ id: 'flame_atk_percent', label: 'Flame Atk %', hidden: true },
	{ id: 'frost_atk_percent', label: 'Frost Atk %', hidden: true },
	{ id: 'volt_atk_percent', label: 'Volt Atk %', hidden: true },
	{ id: 'phys_atk_percent', label: 'Phys Atk %', hidden: true },
	{ id: 'ele_atk_percent', label: 'Ele Atk %' },
	{ id: 'alt_atk_percent', label: 'Alt Atk %', hidden: true },
	// Damage Percent
	{ id: 'dmg_percent', label: 'Dmg %', hidden: true },
	{ id: 'flame_dmg_percent', label: 'Flame Dmg %', hidden: true },
	{ id: 'frost_dmg_percent', label: 'Frost Dmg %', hidden: true },
	{ id: 'volt_dmg_percent', label: 'Volt Dmg %', hidden: true },
	{ id: 'phys_dmg_percent', label: 'Phys Dmg %', hidden: true },
	{ id: 'ele_dmg_percent', label: 'Ele Dmg %', hidden: true },
	{ id: 'alt_dmg_percent', label: 'Alt Dmg %', hidden: true },
	// Crit
	{ id: 'crit', label: 'Crit' },
	{ id: 'crit_percent', label: 'Crit %', hidden: true }
];

export const DEFAULT_GEAR_MAIN_DATA: GearRowData[] = [
	{ id: 'main_helmet', part: 'Helmet' },
	{ id: 'main_spaulders', part: 'Spaulders' },
	{ id: 'main_armor', part: 'Armor' },
	{ id: 'main_armbands', part: 'Armbands' },
	{ id: 'main_belt', part: 'Belt' },
	{ id: 'main_legguards', part: 'Legguards' },
	{ id: 'main_gloves', part: 'Gloves' },
	{ id: 'main_boots,', part: 'Boots' },
	{ id: 'main_visor', part: 'Visor' },
	{ id: 'main_engine', part: 'Engine' },
	{ id: 'main_exoskeleton', part: 'Exoskeleton' },
	{ id: 'main_reactor', part: 'Reactor' }
];
// Maps

export function loadObject(key: typeof LOCAL_STATS_MAIN): AttributeItem[];
export function loadObject(key: typeof LOCAL_GEAR_MAIN): GearSaveObject;
export function loadObject(key: string): string[] | AttributeItem[] | GearSaveObject | null {
	let loadedObject: string[] | GearSaveObject | null = null;

	if (typeof localStorage !== 'undefined' && localStorage) {
		const savedObject = localStorage.getItem(key);
		if (savedObject) {
			loadedObject = JSON.parse(savedObject);
		}
	} else {
		// for ssr
	}

	switch (key) {
		case LOCAL_STATS_MAIN: {
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
		case LOCAL_GEAR_MAIN: {
			const _column_ = DEFAULT_GEAR_MAIN_COLUMNS;
			const _data_ = DEFAULT_GEAR_MAIN_DATA;

			return {
				columns: _column_,
				data: _data_
			};
		}

		default:
			break;
	}
	console.error('Unknown key: ' + key);
	return [''];
}

export async function saveObject(
	key: typeof LOCAL_STATS_MAIN,
	value: AttributeItem[]
): Promise<void>;
export async function saveObject(key: typeof LOCAL_GEAR_MAIN, value: GearSaveObject): Promise<void>;
export async function saveObject(
	key: string,
	value: AttributeItem[] | GearSaveObject
): Promise<void> {
	switch (key) {
		case LOCAL_STATS_MAIN: {
			value = value as AttributeItem[];
			const toSaveObject = value.map((attr) => attr.value);
			localStorage.setItem(key, JSON.stringify(toSaveObject));
			break;
		}

		case LOCAL_GEAR_MAIN: {
			localStorage.setItem(key, JSON.stringify(value));
			break;
		}

		default:
			break;
	}
}
