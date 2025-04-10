import type { ValidGearPart } from './gears';

type EquippedGear = {
	[key in ValidGearPart]: number | null;
};

// this should determine what element to optimize for
export type LoadoutType = 'flame' | 'frost' | 'volt' | 'phys' | 'alt' | 'atk';

export type Loadout = {
	name: string;
	description: string;
	element: LoadoutType;
	equipped_gear: EquippedGear;
	raw_stats: string[]; // raw stat uploaded by user
	stat_adj?: object;
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
