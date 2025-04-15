import { writable } from 'svelte/store';
import type { AllLoadouts, GearView, UserGear } from '../types/index';

export const scroll_y = writable<number>(0);
export const is_mobile = writable<boolean>(false);
export const font_size = writable<number>(16);
export const inner_width = writable<number>(1000);

export const user_gears = writable<UserGear[]>([]);
export const user_loadouts = writable<AllLoadouts>({});

export const current_loadout = writable<string>('');
export const gear_views = writable<GearView[]>([]);
