import { browser } from '$app/environment';
import type {
	Matrix,
	MatrixEffect,
	MatrixEffectsIds,
	MatrixIds,
	ResoEffect,
	ResoEffectsIds,
	StatConstants,
	Weapon,
	WeaponEffect,
	WeaponEffectsIds,
	WeaponsIds
} from '../types/index';

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
const RESO_EFFECTS: { [key in ResoEffectsIds]?: ResoEffect } = {};
const WEAPON_EFFECTS: { [key in WeaponEffectsIds]?: WeaponEffect } = {};
const MATRIX_EFFECTS: { [key in MatrixEffectsIds]?: MatrixEffect } = {};
const WEAPONS: { [key in WeaponsIds]?: Weapon } = {};
const MATRIX: { [key in MatrixIds]?: Matrix } = {};

export async function getResoEffects(reso: ResoEffectsIds): Promise<ResoEffect> {
	if (RESO_EFFECTS[reso]) {
		return RESO_EFFECTS[reso];
	}

	try {
		const response = await fetch(`./json/reso_effect/${reso}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load resonance effects for ${reso}: ${response.statusText}`);
		}

		const data = await response.json();
		RESO_EFFECTS[reso] = data as ResoEffect;
		return RESO_EFFECTS[reso];
	} catch (error) {
		console.error(`Error loading resonance effects for ${reso}:`, error);
		throw error;
	}
}

export async function getWeaponEffect(effect: WeaponEffectsIds): Promise<WeaponEffect> {
	if (WEAPON_EFFECTS[effect]) {
		return WEAPON_EFFECTS[effect];
	}

	try {
		const response = await fetch(`./json/weapon_effect/${effect}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load effect ${effect}: ${response.statusText}`);
		}

		const data = await response.json();
		WEAPON_EFFECTS[effect] = data as WeaponEffect;
		return WEAPON_EFFECTS[effect];
	} catch (error) {
		console.error(`Error loading effect ${effect}:`, error);
		throw error;
	}
}

export async function getMatrixEffect(effect: MatrixEffectsIds): Promise<MatrixEffect> {
	if (MATRIX_EFFECTS[effect]) {
		return MATRIX_EFFECTS[effect];
	}

	try {
		const response = await fetch(`./json/matrix_effect/${effect}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load effect ${effect}: ${response.statusText}`);
		}

		const data = await response.json();
		MATRIX_EFFECTS[effect] = data as MatrixEffect;
		return MATRIX_EFFECTS[effect];
	} catch (error) {
		console.error(`Error loading effect ${effect}:`, error);
		throw error;
	}
}

export async function getWeapon(weapon: WeaponsIds): Promise<Weapon> {
	if (WEAPONS[weapon]) {
		return WEAPONS[weapon];
	}

	try {
		const response = await fetch(`./json/weapon/${weapon}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load weapon ${weapon}: ${response.statusText}`);
		}

		const data = await response.json();
		WEAPONS[weapon] = data as Weapon;
		return WEAPONS[weapon];
	} catch (error) {
		console.error(`Error loading weapon ${weapon}:`, error);
		throw error;
	}
}

export async function getMatrix(matrix: MatrixIds): Promise<Matrix> {
	if (MATRIX[matrix]) {
		return MATRIX[matrix];
	}

	try {
		const response = await fetch(`./json/matrix/${matrix}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load matrix ${matrix}: ${response.statusText}`);
		}

		const data = await response.json();
		MATRIX[matrix] = data as Matrix;
		return MATRIX[matrix];
	} catch (error) {
		console.error(`Error loading matrix ${matrix}:`, error);
		throw error;
	}
}
