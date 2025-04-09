import type { GearPart } from './gears';

type EquippedGear = {
	[key in GearPart]: number | null;
};

// this should determine what element to optimize for
export type LoadoutType = 'flame' | 'frost' | 'volt' | 'phys' | 'alt' | 'atk';

export type Loadout = {
	name: string;
	description: string;
	icon: string;
	equipped_gear: EquippedGear;
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
