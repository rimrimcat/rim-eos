import type { Component } from '@lucide/svelte';
import { writable } from 'svelte/store';

// Define types for better type checking
export type ComponentTool = {
	id: string;
	label: string;
	icon: string;
};

export type ComponentMetadata = {
	id?: string;
	label: string;
	lucide?: Component;
	showInNav?: boolean;
	order?: number;
	tools?: ComponentTool[];
	[key: string]: any; // Allow additional component-specific metadata
};

// Initialize stores with proper typing
export const navItems = writable<ComponentMetadata[]>([]);
export const activeComponent = writable<string>('stat-panel');
export const isCollapsed = writable<boolean>(false);
export const componentRegistry = writable<Record<string, ComponentMetadata>>({});

export function registerComponent(id: string, metadata: ComponentMetadata) {
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
			const newItem = {
				id,
				label: metadata.label,
				lucide: metadata.lucide ? metadata.lucide : undefined,
				order: metadata.order ?? items.length
			};

			// Add new item and sort by order
			const newItems = [...items, newItem];
			return newItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		}

		return items;
	});
}

export function getComponentMetadata(id: string): ComponentMetadata | null {
	let result = null;
	const unsubscribe = componentRegistry.subscribe((registry) => {
		result = registry[id] || null;
	});
	unsubscribe();
	return result;
}

export function getAllComponents(): Record<string, ComponentMetadata> {
	let result = {};
	const unsubscribe = componentRegistry.subscribe((registry) => {
		result = registry;
	});
	unsubscribe();
	return result;
}
