import { AllMatrixIds, AllRelicIds, AllWeaponIds } from '$lib/generated/all-ids';
import type { AllLoadouts, BaseStats14, CharacterStat, UserGear } from '$lib/types/index';
import { GearPart } from './gears';

// States to avoid loading the same stuff twice
export let gear_images_loaded = false;
export let stat_icons_loaded = false;
export let weapon_images_loaded = false;
export let matrix_images_loaded = false;
export let relic_images_loaded = false;

// Keys
export type LocalStorageKey = 'gears_v1' | 'loadouts_v1' | 'styles';

const DB_NAME = 'tof-gear';
const DB_VERSION = 2;
const IMAGE_STORE = 'images';

// Defaults
// TODO: replace this
export const DEFAULT_STATS_RIM: BaseStats14 = [
	'1579827',
	'8081',
	'0',
	'18903',
	'18725',
	'17762',
	'19071',
	'0',
	'50',
	'18712',
	'14455',
	'13262',
	'9677',
	'9746'
];
export const DEFAULT_STYLES: Record<string, string> = {
	'main-bg-color': '#2F2F37',
	// Base colors
	'bg-color': '#38383E',
	// 'bg-color': '#1e1e2e',
	'text-color': '#cdd6f4',
	'title-color': '#cba6f7',
	'border-color': '#7A7B84',

	// Button colors
	'button-bg': '#313244',
	'button-text': '#cdd6f4',
	'button-border': '#45475a',
	'button-hover-bg': '#45475a',

	// Primary button colors
	'button-primary-bg': '#89b4fa',
	'button-primary-text': '#1e1e2e',
	'button-primary-border': '#74c7ec',
	'button-primary-hover-bg': '#74c7ec',

	// Interactive elements
	'toolbar-border': '#FFFFFFA5',
	'hover-bg': '#313244',
	'active-bg': '#45475a',
	'focus-outline': '#89b4fa',

	// Overlay and shadows
	'overlay-bg': 'rgba(0, 0, 0, 0.5)',
	'shadow-color': 'rgba(0, 0, 0, 0.4)',

	// Status colors
	'error-color': '#f38ba8',
	'success-color': '#a6e3a1',
	'warning-color': '#f9e2af',
	'info-color': '#89dceb'
};
export const DEFAULT_LOADOUTS_RIM: AllLoadouts = {
	RimExampleLoadout: {
		name: 'Rim Example Loadout',
		description: 'f2p frost loadout',
		element: 'frost',
		equipped_gears: {
			H: 3,
			S: 11,
			A: 9,
			C: 10,
			B: 8,
			L: 2,
			G: 4,
			T: 0,
			V: 5,
			N: 7,
			X: 6,
			R: 1
		},
		base_stats: DEFAULT_STATS_RIM,
		equipped_weapons: [
			{ id: 'grayfox' },
			{ id: 'nola', setting: ['nola-frost'] },
			{ id: 'nanyin' }
		],
		equipped_matrices: [{ id: 'grayfox-4p' }, { id: 'nola-4p' }, { id: 'nanyin-4p' }],
		equipped_relics: [{ id: 'none' }, { id: 'none' }],
		equipped_trait: 'none'
	}
};
export const DEFAULT_GEARS_RIM: UserGear[] = [
	{
		id: 0,
		part: 'T',
		dateAdded: '2025-04-09T07:45:22.880Z',
		titan_crit: '6026',
		titan_hp: '22261',
		titan_atk: '399',
		titan_res: '371'
	},
	{
		id: 1,
		part: 'R',
		dateAdded: '2025-04-09T07:45:35.108Z',
		titan_phys_atk: '1544',
		titan_hp: '22652',
		titan_phys_atk_percent: '3.655',
		titan_volt_res: '1162'
	},
	{
		id: 2,
		part: 'L',
		dateAdded: '2025-04-09T07:45:51.823Z',
		titan_hp: '22659',
		titan_flame_atk: '1235',
		titan_volt_atk: '1332',
		titan_atk: '483'
	},
	{
		id: 3,
		part: 'H',
		dateAdded: '2025-04-09T07:45:57.175Z',
		titan_hp: '22558',
		titan_atk: '721',
		titan_flame_atk: '1075',
		titan_phys_atk: '1140'
	},
	{
		id: 4,
		part: 'G',
		dateAdded: '2025-04-09T07:46:01.635Z',
		titan_crit: '3281',
		titan_volt_atk: '1231',
		titan_atk: '293',
		titan_flame_res: '1225'
	},
	{
		id: 5,
		part: 'V',
		dateAdded: '2025-04-09T07:46:06.321Z',
		titan_phys_atk_percent: '8.199',
		titan_frost_res_percent: '13.055',
		titan_phys_res: '1207',
		titan_flame_atk: '700'
	},
	{
		id: 6,
		part: 'X',
		dateAdded: '2025-04-09T07:46:16.277Z',
		titan_atk: '276',
		titan_phys_atk_percent: '6.662',
		titan_res: '345',
		titan_phys_res: '2736'
	},
	{
		id: 7,
		part: 'N',
		dateAdded: '2025-04-09T07:46:22.049Z',
		titan_frost_atk_percent: '6.614',
		titan_volt_dmg_percent: '2.574',
		titan_res: '345',
		titan_volt_atk_percent: '6.271'
	},
	{
		id: 8,
		part: 'B',
		dateAdded: '2025-04-09T07:46:26.301Z',
		titan_atk: '635',
		titan_frost_atk: '989',
		titan_volt_atk: '1093',
		titan_hp: '22396'
	},
	{
		id: 9,
		part: 'A',
		dateAdded: '2025-04-09T07:46:30.870Z',
		titan_frost_atk: '1322',
		titan_atk: '446',
		titan_res: '346',
		titan_phys_atk: '1238'
	},
	{
		id: 10,
		part: 'C',
		dateAdded: '2025-04-09T07:46:35.729Z',
		titan_phys_atk: '1012',
		titan_atk: '944',
		titan_flame_atk: '914',
		titan_volt_atk: '959'
	},
	{
		id: 11,
		part: 'S',
		dateAdded: '2025-04-09T07:47:18.251Z',
		titan_hp: '23382',
		titan_volt_atk: '1248',
		titan_atk: '692',
		titan_frost_atk: '1169'
	}
];

export function openImageDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => {
			console.error('Error opening IndexedDB database:', request.error);
			reject(`Database error: ${request.error}`);
		};

		request.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			console.log('Upgrading database...');
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains(IMAGE_STORE)) {
				db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
				console.log(`Object store "${IMAGE_STORE}" created.`);
			}
		};
	});
}

export async function addImageToDB(id: string, image: File): Promise<void> {
	// console.log('Attempting to add/update file:', image);

	return new Promise((resolve, reject) => {
		try {
			// read before doing transaction
			const reader = new FileReader();
			reader.readAsArrayBuffer(image);

			reader.onerror = () => {
				console.error('Error reading file:', reader.error);
				reject(`Error reading file: ${reader.error}`);
			};

			reader.onload = async (event) => {
				try {
					const arrayBuffer = event.target?.result;
					if (!arrayBuffer) {
						throw new Error('Failed to read file data');
					}

					const dataToAdd = { id, image: arrayBuffer };
					const db = await openImageDB();

					const transaction = db.transaction(IMAGE_STORE, 'readwrite');
					const imageStore = transaction.objectStore(IMAGE_STORE);

					// Set up transaction event handlers
					transaction.oncomplete = () => {
						// console.log(`Transaction completed: Image added/updated successfully for ID: ${id}.`);
						resolve();
					};

					transaction.onerror = () => {
						console.error('Transaction error adding/updating image:', transaction.error);
						reject(`Transaction error: ${transaction.error}`);
					};

					const putRequest = imageStore.put(dataToAdd);

					putRequest.onsuccess = () => {
						// console.log(`Put request successful for ID: ${id}`);
					};

					putRequest.onerror = () => {
						console.error('Error adding/updating image data:', putRequest.error);
					};
				} catch (innerError) {
					console.error('Error in file read callback:', innerError);
					reject(innerError);
				}
			};
		} catch (error) {
			console.error('Failed to initiate image addition/update:', error);
			reject(error);
		}
	});
}

export async function getImageFromDB(id: string): Promise<File | null> {
	// console.log(`Attempting to retrieve image with ID: ${id}`);

	try {
		const db = await openImageDB();

		return new Promise((resolve, reject) => {
			try {
				const transaction = db.transaction(IMAGE_STORE, 'readonly');
				const imageStore = transaction.objectStore(IMAGE_STORE);

				const getRequest = imageStore.get(id);

				getRequest.onsuccess = () => {
					const imageObject = getRequest.result;
					if (imageObject) {
						// console.log(`Successfully retrieved image for ID: ${id}`);
						// Convert ArrayBuffer to File
						const blob = new Blob([imageObject.image], { type: 'image/jpeg' });
						const file = new File([blob], `${id}.jpg`, { type: 'image/jpeg' });
						resolve(file);
					} else {
						// console.log(`Image not found in IndexedDB for ID: ${id}`);
						resolve(null);
					}
				};

				getRequest.onerror = () => {
					const errorMsg = `Error retrieving image with ID ${id}: ${getRequest.error}`;
					console.error(errorMsg);
					reject(new Error(errorMsg));
				};

				transaction.onerror = () => {
					const errorMsg = `Transaction error while retrieving image with ID ${id}: ${transaction.error}`;
					console.error(errorMsg);
					reject(new Error(errorMsg));
				};
			} catch (innerError) {
				console.error('Error in transaction setup:', innerError);
				reject(innerError);
			}
		});
	} catch (error) {
		console.error('Failed to open database for image retrieval:', error);
		throw error;
	}
}

export async function getImageUrlFromDB(id: string): Promise<string> {
	try {
		const imageFile = await getImageFromDB(id);

		if (imageFile) {
			const imageUrl = URL.createObjectURL(imageFile);
			// console.log(`Successfully created URL for image with ID: ${id}`);
			return imageUrl;
		} else {
			// console.log(`No image found for ID: ${id}`);
			return '';
		}
	} catch (error) {
		console.error(`Error creating URL for image with ID ${id}:`, error);
		return '';
	}
}

export async function deleteImageFromDB(id: string): Promise<void> {
	// console.log(`Attempting to delete image with ID: ${id}`);

	try {
		const db = await openImageDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(IMAGE_STORE, 'readwrite');
			const imageStore = transaction.objectStore(IMAGE_STORE);

			const deleteRequest = imageStore.delete(id);

			deleteRequest.onsuccess = () => {
				// console.log(`Successfully deleted image with ID: ${id}`);
				resolve();
			};

			deleteRequest.onerror = () => {
				const errorMsg = `Error deleting image with ID ${id}: ${deleteRequest.error}`;
				console.error(errorMsg);
				reject(new Error(errorMsg));
			};

			transaction.onerror = () => {
				const errorMsg = `Transaction error while deleting image with ID ${id}: ${transaction.error}`;
				console.error(errorMsg);
				reject(new Error(errorMsg));
			};
		});
	} catch (error) {
		console.error('Failed to open database for image deletion:', error);
		throw error;
	}
}

type LoadOutputs = string[] | UserGear[] | AllLoadouts | null | typeof DEFAULT_STYLES;

export function loadObject(key: 'gears_v1', force_default?: boolean): UserGear[];
export function loadObject(key: 'loadouts_v1', force_default?: boolean): AllLoadouts;
export function loadObject(key: 'styles', force_default?: boolean): typeof DEFAULT_STYLES;
export function loadObject(key: LocalStorageKey, force_default?: boolean): LoadOutputs {
	let loadedObject: LoadOutputs = null;

	if (typeof localStorage !== 'undefined' && localStorage && !force_default) {
		const savedObject = localStorage.getItem(key);
		if (savedObject) {
			loadedObject = JSON.parse(savedObject);
		}
	} else {
		// for ssr
	}

	switch (key) {
		case 'gears_v1': {
			loadedObject = loadedObject as UserGear[];
			return loadedObject ?? DEFAULT_GEARS_RIM;
		}

		case 'loadouts_v1': {
			const all_loadouts = loadedObject as AllLoadouts;

			if (!all_loadouts || Object.keys(all_loadouts ?? {}).length === 0) {
				return DEFAULT_LOADOUTS_RIM;
			}
			Object.entries(all_loadouts ?? {}).forEach(([loadout_key, loadout_data]) => {
				if (!loadout_data.equipped_gears) {
					all_loadouts[loadout_key].equipped_gears = {
						H: null,
						S: null,
						A: null,
						C: null,
						B: null,
						L: null,
						G: null,
						T: null,
						V: null,
						N: null,
						X: null,
						R: null
					};
				}
				if (!loadout_data.equipped_weapons) {
					all_loadouts[loadout_key].equipped_weapons = [
						{ id: 'none' },
						{ id: 'none' },
						{ id: 'none' }
					];
				}
				if (!loadout_data.equipped_matrices) {
					all_loadouts[loadout_key].equipped_matrices = [
						{ id: 'none' },
						{ id: 'none' },
						{ id: 'none' }
					];
				}
				if (!loadout_data.equipped_relics) {
					all_loadouts[loadout_key].equipped_relics = [{ id: 'none' }, { id: 'none' }];
				}
				if (!loadout_data.equipped_trait) {
					all_loadouts[loadout_key].equipped_trait = 'none';
				}
				if (!loadout_data.base_stats) {
					all_loadouts[loadout_key].base_stats = DEFAULT_STATS_RIM;
				}
			});

			try {
				const request = indexedDB.open(DB_NAME, DB_VERSION);

				request.onerror = () => {
					console.error('Error opening database:', request.error);
				};

				request.onsuccess = () => {
					const db = request.result;

					// Process each loadout one at a time with separate transactions
					Object.keys(all_loadouts).forEach((loadout) => {
						try {
							const transaction = db.transaction(IMAGE_STORE, 'readonly');
							const imageStore = transaction.objectStore(IMAGE_STORE);
							const getRequest = imageStore.get(loadout);

							getRequest.onsuccess = () => {
								const imageObject = getRequest.result;
								if (imageObject && all_loadouts) {
									const blob = new Blob([imageObject.image], { type: 'image/jpeg' });
									const imageUrl = URL.createObjectURL(blob);
									all_loadouts[loadout].image_url = imageUrl;
								} else {
									console.log(`Image not found in IndexedDB for loadout: ${loadout}`);
								}
							};

							getRequest.onerror = () => {
								console.error(`Error getting image for loadout ${loadout}:`, getRequest.error);
							};

							transaction.onerror = () => {
								console.error(`Transaction error for loadout ${loadout}:`, transaction.error);
							};
						} catch (err) {
							console.error(`Error processing loadout ${loadout}:`, err);
						}
					});
				};
			} catch (err) {
				console.error('Error in loadouts_v1 processing:', err);
			}

			return all_loadouts;
		}

		case 'styles': {
			loadedObject = loadedObject as typeof DEFAULT_STYLES;
			return loadedObject ? loadedObject : DEFAULT_STYLES;
		}

		default:
			break;
	}
	console.error('Unknown key: ' + key);
	return null;
}

export async function saveObject(key: 'gears_v1', value: UserGear[]): Promise<void>;
export async function saveObject(key: 'loadouts_v1', value: AllLoadouts): Promise<void>;
export async function saveObject(
	key: LocalStorageKey,
	value: CharacterStat[] | UserGear[] | AllLoadouts
): Promise<void> {
	switch (key) {
		case 'gears_v1': {
			localStorage.setItem(key, JSON.stringify(value));
			break;
		}
		case 'loadouts_v1': {
			localStorage.setItem(key, JSON.stringify(value));
			break;
		}

		default:
			break;
	}
}

export function cloneObject(obj: object) {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Loads gear images by fetching them
 */
export async function loadGearImages() {
	if (gear_images_loaded) return;
	const gear_parts = Object.values(GearPart).filter((part) => part !== GearPart.UNKNOWN);
	const dirs = ['./gear/', './gear/titan/'];

	const imgs_to_load = gear_parts.flatMap((part) => dirs.map((dir) => `${dir}${part}.png`));

	gear_images_loaded = true;
	return await Promise.all(
		imgs_to_load.map(async (img) => {
			return await fetch(img);
		})
	);
}

/**
 * Loads stat icons by fetching them
 */
export async function loadStatIcons() {
	if (stat_icons_loaded) return;
	const icons = [
		'alt',
		'crit',
		'flame',
		'gatk',
		'phys',
		'res_flame',
		'res_phys',
		'res',
		'atk',
		'dmg',
		'frost',
		'hp',
		'res_alt',
		'res_frost',
		'res_volt',
		'volt'
	];

	stat_icons_loaded = true;
	return await Promise.all(
		icons.map(async (icon) => {
			return await fetch(`./stat_icon/${icon}.webp`);
		})
	);
}

/**
 * Loads all weapon images
 */
export async function loadWeaponImages() {
	if (weapon_images_loaded) return;
	weapon_images_loaded = true;
	return await Promise.all(
		AllWeaponIds.filter((weapon) => weapon !== 'none').map(async (weapon) => {
			await fetch(`./weapon/${weapon}.webp`);
		})
	);
}

/**
 * Loads all matrix images
 */
export async function loadMatrixImages() {
	if (matrix_images_loaded) return;
	matrix_images_loaded = true;
	return await Promise.all(
		AllMatrixIds.filter((matrix) => matrix !== 'none').map(async (matrix) => {
			await fetch(`./matrix/${matrix.replace('-4p', '')}.webp`);
		})
	);
}

/**
 * Loads all relic images
 */
export async function loadRelicImages() {
	if (relic_images_loaded) return;
	relic_images_loaded = true;
	return await Promise.all(
		AllRelicIds.filter((relic) => relic !== 'none').map(async (relic) => {
			await fetch(`./relic/${relic}.webp`);
		})
	);
}
