import type { ValidGearPart } from '../scripts/gears';
import type { UserMatrix, UserWeapon } from '../scripts/weapons';

export type EquippedGear = {
	[key in ValidGearPart]: number | null;
};

// this should determine what element to optimize for
export type LoadoutType = 'flame' | 'frost' | 'volt' | 'phys' | 'alt' | 'atk';

export type Loadout = {
	name: string;
	description: string;
	element: LoadoutType;
	equipped_gears: EquippedGear;
	equipped_weapons: UserWeapon[];
	equipped_matrices: UserMatrix[];
	base_stats: string[]; // NOT raw stat uploaded by user
	stat_adj?: object;
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
