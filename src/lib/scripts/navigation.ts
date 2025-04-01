import { writable } from 'svelte/store';

// Initialize stores for navigation
export const navItems = writable([
	{ id: 'dashboard', label: 'Dashboard', icon: 'grid' },
	{ id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
	{ id: 'settings', label: 'Settings', icon: 'settings' }
]);

export const activeComponent = writable('dashboard');
export const isCollapsed = writable(false);
