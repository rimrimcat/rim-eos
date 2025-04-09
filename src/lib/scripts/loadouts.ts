import type { GearPart } from './gears';

type EquippedGear = {
	[key in GearPart]: number | null;
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
