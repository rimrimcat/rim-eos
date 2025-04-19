import type { Snippet } from 'svelte';
import type { Writable } from 'svelte/store';

export type GuideItem = {
	snippet?: Snippet; // snippet to render
	text?: string; // text to display

	move_to?: { x: number | string; y: number | string }; // move window position

	proceed_on?: Writable<boolean>; // proceed when this writable is true
	require_false?: boolean; // if to proceed when store is false

	preload?: string[]; // resources to preload

	make_glow?: string[]; // element ids to make glow
};
