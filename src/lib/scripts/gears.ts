import { ALL_STATS_LIST } from './stats';

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

export const ALL_STATS_REGEX = new RegExp(`\\b(${ALL_STATS_LIST.join('|')}|gear)\\b`, 'g');

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
const __allowedRegexVars = [...ALL_STATS_LIST].join('|');

export const ALLOWED_REGEX_VARS = new RegExp(`\\b(${__allowedRegexVars})\\b`, 'g');
export const ALLOWED_REGEX_OPS = new RegExp(`(${__allowedRegexLits})`, 'g');
