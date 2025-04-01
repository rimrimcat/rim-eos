import { writable } from 'svelte/store';
import { navItems } from './navigation.ts';

// Use writable store for component registry
export const componentRegistry = writable({});

export function registerComponent(id, metadata) {
	// Update the registry store
	componentRegistry.update((registry) => ({
		...registry,
		[id]: { id, ...metadata }
	}));

	// Update navItems if this component should be added to navigation
	navItems.update((items) => {
		// Check if this component already exists in navItems
		const exists = items.some((item) => item.id === id);

		if (!exists && metadata.showInNav !== false) {
			return [
				...items,
				{
					id,
					label: metadata.label,
					icon: metadata.icon
				}
			];
		}

		return items;
	});
}

export function getComponentMetadata(id) {
	let result = null;
	const unsubscribe = componentRegistry.subscribe((registry) => {
		result = registry[id] || null;
	});
	unsubscribe(); // Clean up subscription
	return result;
}

export function getAllComponents() {
	let result = {};
	const unsubscribe = componentRegistry.subscribe((registry) => {
		result = registry;
	});
	unsubscribe(); // Clean up subscription
	return result;
}
