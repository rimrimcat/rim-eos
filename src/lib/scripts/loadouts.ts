import type { ValidGearPart } from './gears';
import type { UserWeapon } from './weapons';

type EquippedGear = {
	[key in ValidGearPart]: number | null;
};

// this should determine what element to optimize for
export type LoadoutType = 'flame' | 'frost' | 'volt' | 'phys' | 'alt' | 'atk';

export type Loadout = {
	name: string;
	description: string;
	element: LoadoutType;
	equipped_gears: EquippedGear;
	equipped_weapons: [UserWeapon, UserWeapon, UserWeapon];
	base_stats: string[]; // raw stat uploaded by user
	stat_adj?: object;
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
