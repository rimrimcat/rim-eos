import type {
	GearAugment,
	GearView,
	GearViewStatLong,
	GearViewStatShort,
	StatGearExtra,
	StatGearTitan,
	StatGearUser,
	UserGear
} from '$lib/types';
import { get } from 'svelte/store';
import { STAT_CONSTANTS } from './json-loader';
import { ALL_STATS_LIST, STAT_LABELS } from './stats';
import { current_loadout, user_loadouts } from './stores';
import { formatValue } from './validation';

/**
 * Enum for different gear slots
 */
export enum GearPart {
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

export type ValidGearPart =
	| 'H'
	| 'S'
	| 'A'
	| 'C'
	| 'B'
	| 'L'
	| 'G'
	| 'T'
	| 'V'
	| 'N'
	| 'X'
	| 'R'
	| GearPart.SPAULDERS
	| GearPart.ARMOR
	| GearPart.BRACERS
	| GearPart.BELT
	| GearPart.LEGGUARDS
	| GearPart.GLOVES
	| GearPart.BOOTS
	| GearPart.VISOR
	| GearPart.ENGINE
	| GearPart.EXOSKELETON
	| GearPart.REACTOR;

export const VALID_GEAR_PARTS: ValidGearPart[] = [
	'H',
	'S',
	'A',
	'C',
	'B',
	'L',
	'G',
	'T',
	'V',
	'N',
	'X',
	'R'
];

const EXTRA_STATS_LIST: StatGearExtra[] = ['multiplier', 'multiplier_percent'];
const ALL_ALL_STATS_LIST = [...ALL_STATS_LIST, ...EXTRA_STATS_LIST];

export const ALL_STATS_REGEX = new RegExp(`\\b(${ALL_ALL_STATS_LIST.join('|')}|gear)\\b`, 'g');

const __allowedRegexLits = [
	'\\+',
	'\\(',
	'\\ ',
	'\\)',
	'\\<',
	'\\=',
	'\\>',
	'\\*',
	'\\d',
	'\\!',
	"'gear'",
	...Object.values(GearPart).map((value) => `'${value}'`)
].join('|');
const __allowedRegexVars = [...ALL_ALL_STATS_LIST].join('|');

export const ALLOWED_REGEX_VARS = new RegExp(`\\b(${__allowedRegexVars})\\b`, 'g');
export const ALLOWED_REGEX_OPS = new RegExp(`(${__allowedRegexLits})`, 'g');

// gear views
export const RAINBOW_TITAN_ATK: StatGearTitan[] = [
	'titan_flame_atk',
	'titan_frost_atk',
	'titan_volt_atk',
	'titan_phys_atk'
];
export const RAINBOW_TITAN_ATK_PERCENT: StatGearTitan[] = [
	'titan_flame_atk_percent',
	'titan_frost_atk_percent',
	'titan_volt_atk_percent',
	'titan_phys_atk_percent'
];

export function getRollValue(stat: StatGearUser, value: number): number {
	const stc = STAT_CONSTANTS[stat];
	return ((value - stc.base) * 2) / (stc.high_roll + stc.low_roll);
}

export function getTitanValue(stat: StatGearUser, value: number): number {
	const stc = STAT_CONSTANTS[stat];
	return stc.titan_base + stc.titan_multiplier * (value - stc.base);
}

export function reverseTitanValue(stat: StatGearUser, titanValue: number): number {
	const stc = STAT_CONSTANTS[stat];
	return (
		(titanValue - stc.titan_base + stc.titan_multiplier * stc.base) / (1 + stc.titan_multiplier)
	);
}

function applyRainbow(
	RAINBOW_STATS: StatGearTitan[],
	derived_: GearViewStatShort[],
	value: number,
	value_label: string
) {
	RAINBOW_STATS.forEach((rainbowStat) => {
		const statIdx = derived_.findIndex((der) => der.stat === rainbowStat);

		if (statIdx === -1) {
			// add rainbow stat if missing
			derived_.push({
				stat: rainbowStat,
				stat_label: STAT_LABELS[rainbowStat],
				value,
				value_label
			});
		} else {
			// replace value if rainbow is higher
			if (value > derived_[statIdx].value) {
				derived_[statIdx].value = value;
				derived_[statIdx].value_label = value_label;
			}
		}
	});
}

export async function createGearView(gear: UserGear, equip: boolean = false): Promise<GearView> {
	const stats: GearViewStatLong[] = [];
	const derived: GearViewStatShort[] = [];
	let id: number = -1;
	let part: GearPart = GearPart.UNKNOWN;
	let hash = '';
	let augment: [GearAugment, number] | undefined = undefined;

	Object.entries(gear).forEach(([key, value]) => {
		switch (key) {
			case 'id':
				id = value as number;
				break;
			case 'part':
				part = value as GearPart;
				hash += value;
				break;
			case 'dateAdded':
				break;
			case 'augment':
				augment = value as [GearAugment, number];
				break;
			default: {
				const isTitan = key.startsWith('titan_');
				const value_format = key.includes('_percent') ? 'float3d' : 'int';

				let _stat: StatGearUser;
				let _stat_value: number;
				let stat_label: string;
				let stat_value_label: string;

				let titan_key: StatGearTitan;
				let titan_label: string;
				let titan_value: number;
				let titan_value_label: string;

				if (isTitan) {
					// derive normal stat from corresponding titan stat
					titan_key = key as StatGearTitan;
					titan_label = STAT_LABELS[titan_key] ?? key;
					titan_value = Number(value);
					titan_value_label = formatValue(value_format, value as string);

					_stat = key.replace('titan_', '') as StatGearUser;
					_stat_value = reverseTitanValue(_stat, titan_value);
					stat_label = STAT_LABELS[_stat] ?? key;
					stat_value_label = formatValue(value_format, _stat_value.toString());
				} else {
					_stat = key as StatGearUser;
					_stat_value = Number(value);
					stat_label = STAT_LABELS[_stat] ?? key;
					stat_value_label = formatValue(value_format, _stat_value.toString());

					titan_key = 'titan_' + _stat;
					titan_label = 'Titan ' + stat_label;
					titan_value = getTitanValue(_stat, _stat_value) + _stat_value;
					titan_value_label = formatValue(value_format, titan_value.toString());
				}

				stats.push({
					stat: _stat,
					stat_label,
					value: _stat_value,
					value_label: stat_value_label,
					roll: getRollValue(_stat, _stat_value),
					titan_stat_label: titan_label,
					titan_value_label: titan_value_label
				});

				// normal stat
				derived.push({
					stat: _stat,
					stat_label,
					value: _stat_value,
					value_label: stat_value_label
				});

				// titan stat
				derived.push({
					stat: titan_key as StatGearTitan,
					stat_label: titan_label,
					value: titan_value,
					value_label: titan_value_label
				});

				hash += _stat + stat_value_label;

				break;
			}
		}
	});
	stats.sort((a, b) => (b.roll ?? 0) - (a.roll ?? 0));

	// if base_stats are defined, calculate contributions

	// get highest roll stat
	const bestRoll = stats[0];

	// FOR NOW, LENIENT MAX STAT DETECTION
	if (bestRoll.stat.includes('_atk') && !bestRoll.stat.includes('percent')) {
		const eleAtkStats = stats.filter(
			(stat) => stat.stat.includes('_atk') && !stat.stat.includes('percent')
		);

		if (eleAtkStats.length >= 1) {
			// rainbow gear!

			const rainbowTitanValue =
				getTitanValue(bestRoll.stat, bestRoll.value) * 0.95 + bestRoll.value;
			const rainbowTitanValueLabel = formatValue('int', rainbowTitanValue.toString());

			applyRainbow(RAINBOW_TITAN_ATK, derived, rainbowTitanValue, rainbowTitanValueLabel);
		}
	} else if (bestRoll.stat.includes('_atk') && bestRoll.stat.includes('percent')) {
		const eleAtkPercentStats = stats.filter(
			(stat) => stat.stat.includes('_atk') && stat.stat.includes('percent')
		);

		if (eleAtkPercentStats.length >= 1) {
			const rainbowTitanValue =
				getTitanValue(bestRoll.stat, bestRoll.value) * 0.95 + bestRoll.value;
			const rainbowTitanValueLabel = formatValue('float3d', rainbowTitanValue.toString());

			applyRainbow(RAINBOW_TITAN_ATK_PERCENT, derived, rainbowTitanValue, rainbowTitanValueLabel);
		}
	}

	const isEquipped =
		equip ||
		(part !== GearPart.UNKNOWN &&
			get(user_loadouts)[get(current_loadout)].equipped_gears[gear.part as ValidGearPart] ===
				gear.id);

	return {
		id,
		part,
		stats,
		hash,
		derived,
		isEquipped,
		augment
	};
}
