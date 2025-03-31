import { writable } from 'svelte/store';

export const topZIndex = writable(1);

export function bringToFront() {
	let currentTop: number = 0;
	topZIndex.update((value) => {
		currentTop = value + 1;
		return currentTop;
	});
	return currentTop;
}
