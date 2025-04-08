import { type UserGear } from '$lib/scripts/gears';
import { type AttributeItem } from '$lib/scripts/stats';
import { type AllLoadouts } from './loadouts';

// Keys
export type LocalStorageKey = 'stats_main' | 'gears_v1' | 'styles' | 'loadouts_v1';

const DB_NAME = 'tof-gear';
const IMAGE_STORE = 'images';

// Templates
const TEMPLATE_USER_ATTRIBUTES = [
	{ name: 'HP', icon: './stat/hp.webp', index: 0 },
	{ name: 'Crit', icon: './stat/crit.webp', index: 1 },
	{ name: 'Crit Rate', icon: './stat/crit.webp', index: 2 },
	{ name: 'Physical Attack', icon: './stat/physatk.webp', index: 3 },
	{ name: 'Flame Attack', icon: './stat/flameatk.webp', index: 4 },
	{ name: 'Frost Attack', icon: './stat/frostatk.webp', index: 5 },
	{ name: 'Volt Attack', icon: './stat/voltatk.webp', index: 6 },
	{ name: 'Altered Attack', icon: './stat/placeholder.webp', index: 7 },
	{ name: 'Endurance', icon: './stat/placeholder.webp', index: 8 },
	{ name: 'Endurance Regen Speed', icon: './stat/placeholder.webp', index: 9 },
	{ name: 'Crit Damage', icon: './stat/placeholder.webp', index: 10 },
	{ name: 'Physical Resistance', icon: './stat/physres.webp', index: 11 },
	{ name: 'Flame Resistance', icon: './stat/flameres.webp', index: 12 },
	{ name: 'Frost Resistance', icon: './stat/frostres.webp', index: 13 },
	{ name: 'Volt Resistance', icon: './stat/voltres.webp', index: 14 },
	{ name: 'Altered Resistance', icon: './stat/placeholder.webp', index: 15 }
];

// Defaults
export const DEFAULT_STATS_MAIN = [
	'989317',
	'11318',
	'1.372',
	'15544',
	'16976',
	'14452',
	'17489',
	'18793',
	'1300',
	'0',
	'64',
	'8621',
	'14666',
	'14013',
	'10518',
	'4892'
];

export const DEFAULT_STYLES = {
	// Base colors
	'bg-color': '#1e1e2e',
	'text-color': '#cdd6f4',
	'title-color': '#cba6f7',
	'border-color': '#313244',

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

async function createDB() {
	const request = indexedDB.open(DB_NAME, 2);

	request.onerror = (event) => {
		console.error('Error opening IndexedDB database:', event);
	};

	request.onupgradeneeded = () => {
		const db = request.result;

		const imageStore = db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });

		imageStore.transaction.oncomplete = () => {
			console.log('Database created and ready for use.');
		};
	};
}

async function addImageToDB(id: string, image: string) {
	const request = indexedDB.open(DB_NAME, 2);

	request.onsuccess = (event) => {
		const db = request.result;

		const transaction = db.transaction(IMAGE_STORE, 'readwrite');
		const imageStore = transaction.objectStore(IMAGE_STORE);

		const imageObject = { id, image };
		imageStore.add(imageObject);

		transaction.oncomplete = () => {
			console.log('Image added to IndexedDB.');
		};
	};
}

function getImageFromDB(id: string) {
	const request = indexedDB.open(DB_NAME, 2);

	request.onsuccess = (event) => {
		const db = request.result;

		const transaction = db.transaction(IMAGE_STORE, 'readonly');
		const imageStore = transaction.objectStore(IMAGE_STORE);

		const getRequest = imageStore.get(id);

		getRequest.onsuccess = () => {
			const imageObject = getRequest.result;
			if (imageObject) {
				return imageObject.image;
			} else {
				console.log('Image not found in IndexedDB.');
				return null;
			}
		};
	};
}

type LoadOutputs =
	| string[]
	| AttributeItem[]
	| UserGear[]
	| AllLoadouts
	| null
	| typeof DEFAULT_STYLES;

export function loadObject(key: 'stats_main', force_default?: boolean): AttributeItem[];
export function loadObject(key: 'gears_v1', force_default?: boolean): UserGear[];
export function loadObject(key: 'styles', force_default?: boolean): typeof DEFAULT_STYLES;
export function loadObject(key: 'loadouts_v1', force_default?: boolean): AllLoadouts;
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
		case 'stats_main': {
			loadedObject = loadedObject as string[];

			const processedObject = loadedObject ? loadedObject : DEFAULT_STATS_MAIN;
			const user_attributes: AttributeItem[] = TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
				return {
					...attr,
					value: processedObject[index]
				};
			});
			return user_attributes;
		}
		case 'gears_v1': {
			loadedObject = loadedObject as UserGear[];
			return loadedObject ? loadedObject : [];
		}

		case 'loadouts_v1': {
			loadedObject = loadedObject as AllLoadouts;

			if (!loadedObject) {
				return {};
			}

			// iterate through Loadouts, then load image_url from database
			const request = indexedDB.open(DB_NAME, 2);

			request.onsuccess = (event) => {
				const db = request.result;

				for (const loadout in loadedObject) {
					const transaction = db.transaction(IMAGE_STORE, 'readonly');
					const imageStore = transaction.objectStore(IMAGE_STORE);

					const getRequest = imageStore.get(loadout);

					getRequest.onsuccess = () => {
						const imageObject = getRequest.result;
						if (imageObject) {
							// @ts-expect-error : its oke
							loadedObject[loadout].image_url = imageObject.image;
						} else {
							console.log('Image not found in IndexedDB.');
						}
					};
				}
			};

			return loadedObject;
		}

		default:
			break;
	}
	console.error('Unknown key: ' + key);
	return [''];
}

export async function saveObject(key: 'stats_main', value: AttributeItem[]): Promise<void>;
export async function saveObject(key: 'gears_v1', value: UserGear[]): Promise<void>;

export async function saveObject(
	key: LocalStorageKey,
	value: AttributeItem[] | UserGear[]
): Promise<void> {
	switch (key) {
		case 'stats_main': {
			value = value as AttributeItem[];
			const toSaveObject = value.map((attr) => attr.value);
			localStorage.setItem(key, JSON.stringify(toSaveObject));
			break;
		}
		case 'gears_v1': {
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
