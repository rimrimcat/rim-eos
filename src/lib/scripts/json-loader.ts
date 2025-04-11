import type { StatConstants } from './stats';

export let STAT_CONSTANTS: StatConstants;

export async function loadStatConstants(): Promise<void> {
	if (STAT_CONSTANTS) {
		console.log('Stat constants already loaded!');
		return;
	}

	try {
		const response = await fetch('./json/stat-constants.json');
		if (!response.ok) {
			throw new Error(`Failed to load stat constants: ${response.statusText}`);
		}

		const data = await response.json();
		STAT_CONSTANTS = data as StatConstants;
		console.log('Stat constants loaded!');
	} catch (error) {
		console.error('Error loading stat constants:', error);
		throw error;
	}
}
