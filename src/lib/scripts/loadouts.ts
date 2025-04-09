import type { GearPart } from './gears';

type EquippedGear = {
	[key in GearPart]: number;
};

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
