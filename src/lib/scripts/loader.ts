// Imports
import { onMount } from 'svelte';

// Types
export type AttributeItem = {
	name: string;
	icon: string;
	value: string;
	index?: number;
};

// Constants
export const LOCAL_STATS_MAIN = 'stats_main' as const;

// Templates
const TEMPLATE_USER_ATTRIBUTES = [
	{ name: 'HP', icon: './stat/hp.webp' },
	{ name: 'Crit', icon: './stat/crit.webp' },
	{ name: 'Crit Rate', icon: './stat/crit.webp' },
	{ name: 'Physical Attack', icon: './stat/physatk.webp' },
	{ name: 'Flame Attack', icon: './stat/flameatk.webp' },
	{ name: 'Frost Attack', icon: './stat/frostatk.webp' },
	{ name: 'Volt Attack', icon: './stat/voltatk.webp' },
	{ name: 'Altered Attack', icon: './stat/placeholder.webp' },
	{ name: 'Endurance', icon: './stat/placeholder.webp' },
	{ name: 'Endurance Regen Speed', icon: './stat/placeholder.webp' },
	{ name: 'Crit Damage', icon: './stat/placeholder.webp' },
	{ name: 'Physical Resistance', icon: './stat/physres.webp' },
	{ name: 'Flame Resistance', icon: './stat/flameres.webp' },
	{ name: 'Frost Resistance', icon: './stat/frostres.webp' },
	{ name: 'Volt Resistance', icon: './stat/voltres.webp' },
	{ name: 'Altered Resistance', icon: './stat/placeholder.webp' }
] as const;
const DEFAULT_STATS_MAIN = [
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
] as const;

// Maps

export function loadObject(key: typeof LOCAL_STATS_MAIN): AttributeItem[];
export function loadObject(key: string): string[] | AttributeItem[] {
	let loadedObject: string[] | null = null;
	onMount(() => {
		const savedObject = localStorage.getItem(key);
		if (savedObject) {
			console.error('got saved object');
			loadedObject = JSON.parse(savedObject);
		}
	});

	switch (key) {
		case LOCAL_STATS_MAIN: {
			const processedObject = loadedObject ? loadedObject : DEFAULT_STATS_MAIN;

			const user_attributes: AttributeItem[] = TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
				return {
					...attr,
					value: processedObject[index]
				};
			});
			return user_attributes;
		}

		default:
			break;
	}
	console.error('Unknown key: ' + key);
	return [''];
}

export async function saveObject(
	key: typeof LOCAL_STATS_MAIN,
	value: AttributeItem[]
): Promise<void>;
export async function saveObject(key: string, value: AttributeItem[]): Promise<void> {
	switch (key) {
		case LOCAL_STATS_MAIN: {
			const toSaveObject = value.map((attr) => attr.value);
			localStorage.setItem(key, JSON.stringify(toSaveObject));
			break;
		}

		default:
			break;
	}
}
