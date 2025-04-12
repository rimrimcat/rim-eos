import { browser } from '$app/environment';
import type { ResoEffectsIds } from '../generated/ids';
import type { StatConstants } from './stats';
import type { Effect } from './weapons';

// load once before using
export let STAT_CONSTANTS: StatConstants;

export async function loadStatConstants(): Promise<void> {
	if (STAT_CONSTANTS) {
		console.log('Stat constants already loaded!');
		return;
	}

	if (!browser) {
		console.log('Not in browser environment, skipping stat constants loading.');
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

// loaded when needed
const RESO_EFFECTS: { [key in ResoEffectsIds]?: Effect[] } = {};

export async function getResoEffects(reso: ResoEffectsIds): Promise<Effect[]> {
	if (RESO_EFFECTS[reso]) {
		return RESO_EFFECTS[reso];
	}

	try {
		const response = await fetch(`./json/reso_effects/${reso}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load resonance effects for ${reso}: ${response.statusText}`);
		}

		const data = await response.json();
		RESO_EFFECTS[reso] = data as Effect[];
		return RESO_EFFECTS[reso];
	} catch (error) {
		console.error(`Error loading resonance effects for ${reso}:`, error);
		throw error;
	}
}
