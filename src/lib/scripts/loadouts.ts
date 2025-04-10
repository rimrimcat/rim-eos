import type { ValidGearPart } from './gears';

type EquippedGear = {
	[key in ValidGearPart]: number | null;
};

// this should determine what element to optimize for
export type LoadoutType = 'flame' | 'frost' | 'volt' | 'phys' | 'alt' | 'atk';

export type Loadout = {
	name: string;
	description: string;
	icon: string;
	equipped_gear: EquippedGear;
	base_stats: string[]; // base stat without gear
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
