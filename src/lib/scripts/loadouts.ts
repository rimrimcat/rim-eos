export type Loadout = {
	name: string;
	description: string;
	icon: string;
	image_url?: string;
};

export type AllLoadouts = {
	[key: string]: Loadout;
};
