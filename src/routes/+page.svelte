<script>
	import GearTable from '$lib/components/GearTable.svelte';
	import FloatingWindow from '$lib/components/FloatingWindow.svelte';

	let columns = [
		{ id: 'id', label: 'ID', hidden: true, editable: false },
		{ id: 'part', label: 'Part', editable: false },
		// Attack
		{ id: 'atk', label: 'Atk' },
		{ id: 'flame_atk', label: 'Flame Atk', hidden: true },
		{ id: 'frost_atk', label: 'Frost Atk', hidden: true },
		{ id: 'volt_atk', label: 'Volt Atk', hidden: true },
		{ id: 'phys_atk', label: 'Phys Atk', hidden: true },
		{ id: 'ele_atk', label: 'Ele Atk' },
		{ id: 'alt_atk', label: 'Alt Atk', hidden: true },
		// Attack Percent
		{ id: 'flame_atk_percent', label: 'Flame Atk %', hidden: true },
		{ id: 'frost_atk_percent', label: 'Frost Atk %', hidden: true },
		{ id: 'volt_atk_percent', label: 'Volt Atk %', hidden: true },
		{ id: 'phys_atk_percent', label: 'Phys Atk %', hidden: true },
		{ id: 'ele_atk_percent', label: 'Ele Atk %' },
		{ id: 'alt_atk_percent', label: 'Alt Atk %', hidden: true },
		// Damage Percent
		{ id: 'dmg_percent', label: 'Dmg %', hidden: true },
		{ id: 'flame_dmg_percent', label: 'Flame Dmg %', hidden: true },
		{ id: 'frost_dmg_percent', label: 'Frost Dmg %', hidden: true },
		{ id: 'volt_dmg_percent', label: 'Volt Dmg %', hidden: true },
		{ id: 'phys_dmg_percent', label: 'Phys Dmg %', hidden: true },
		{ id: 'ele_dmg_percent', label: 'Ele Dmg %', hidden: true },
		{ id: 'alt_dmg_percent', label: 'Alt Dmg %', hidden: true },
		// Crit
		{ id: 'crit', label: 'Crit' },
		{ id: 'crit_percent', label: 'Crit %', hidden: true }
	];

	// Define your data
	let data = [
		{ id: 'main_helmet', part: 'Helmet' },
		{ id: 'main_spaulders', part: 'Spaulders' },
		{ id: 'main_armor', part: 'Armor' },
		{ id: 'main_armbands', part: 'Armbands' },
		{ id: 'main_belt', part: 'Belt' },
		{ id: 'main_legguards', part: 'Legguards' },
		{ id: 'main_gloves', part: 'Gloves' },
		{ id: 'main_boots,', part: 'Boots' },
		{ id: 'main_visor', part: 'Visor' },
		{ id: 'main_engine', part: 'Engine' },
		{ id: 'main_exoskeleton', part: 'Exoskeleton' },
		{ id: 'main_reactor', part: 'Reactor' }
	];
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->

<FloatingWindow
	title="Main Gear"
	initialX={150}
	initialY={100}
	initialWidth={780}
	initialHeight={810}
	startMinimized={true}
>
	<GearTable {data} {columns} fixed_row={true} />
</FloatingWindow>

<!-- <SyncedTables/> -->
