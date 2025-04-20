import type { ValidGearPart } from '../scripts/gears';
import type { BaseStats14, Elements, StatData } from './stat-types';
import type { UserMatrix, UserRelic, UserWeapon } from './weapon-types';

export type EquippedGear = {
	[key in ValidGearPart]: number | null;
};

// this should determine what element to optimize for
export type LoadoutType = Elements | 'atk'; // for now, unused

export type StatAdjustments = {
	unaccounted: StatData; // buffs with unknown sources, added on top of base stat
	supercompute: number;
	use_blade_shot: boolean;
};

export type Loadout = {
	name: string;
	description: string;
	element: Elements;
	equipped_gears: EquippedGear;
	equipped_weapons: UserWeapon[];
	equipped_matrices: UserMatrix[];
	equipped_relics: UserRelic[];
	base_stats: BaseStats14; // NOT raw stat uploaded by user
	stat_adj?: StatAdjustments;
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
