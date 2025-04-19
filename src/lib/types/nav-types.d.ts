import type { Snippet } from 'svelte';
import type { Writable } from 'svelte/store';

export type GuideItem = {
	snippet?: Snippet; // snippet to render
	text?: string; // text to display

	move_to?: { x: number | string; y: number | string }; // move window position
	disable_next?: boolean; // disable next button
	proceed_on?: Writable<boolean>; // proceed when this writable is true
};
