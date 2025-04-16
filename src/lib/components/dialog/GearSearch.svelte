<script lang="ts">
	import { ALLOWED_REGEX_OPS, ALLOWED_REGEX_VARS, GearPart } from '$lib/scripts/gears.ts';
	import { is_mobile } from '$lib/scripts/stores';
	import { SvelteSet } from 'svelte/reactivity';
	import Dialog from '../Dialog.svelte';

	let { open = $bindable(false), onConfirmSearch = (query: string) => {} } = $props();

	let advancedOptions = $state(false);

	let selectedElement = $state<string | null>(null);
	let selectedStat = $state('ATK');
	let selectedOthers = $state<SvelteSet<string>>(new SvelteSet());
	let selectedSlot = $state<string | null>(null);

	let query = $derived(getQuery(selectedElement, selectedStat, selectedOthers, selectedSlot));

	const ELEMENTS = ['Flame', 'Frost', 'Volt', 'Phys', 'Alt'] as const;
	const STATS = ['ATK', 'TOTAL ATK', 'DMG', 'RES', 'CRIT'] as const;
	const OTHERS = ['Titan', 'Percent', 'Rainbow'] as const;
	const PARTS = [
		'Helmet',
		'Spaulders',
		'Armor',
		'Bracers',
		'Belt',
		'Legguards',
		'Gloves',
		'Boots',
		'Visor',
		'Engine',
		'Exoskeleton',
		'Reactor'
	] as const;
	const PART_GROUPS: Record<string, string[]> = {
		'Group 1': ['Helmet', 'Spaulders', 'Armor', 'Bracers', 'Belt', 'Legguards'],
		'Group 2': ['Gloves', 'Boots'],
		'Group 3': ['Visor', 'Engine', 'Exoskeleton', 'Reactor']
	};

	function getQuery(
		_selectedElement: string | null,
		_selectedStat: string,
		_selectedOthers: SvelteSet<string>,
		_selectedGear: string | null
	) {
		const rainbow = _selectedOthers.has('Rainbow')
			? '(( !flame_atk + !frost_atk + !volt_atk + !phys_atk ) <= 2 ) * '
			: '';
		const gear = _selectedGear // @ts-expect-error
			? `( 'gear' == '${GearPart[_selectedGear.toUpperCase()]}' ) * `
			: '';
		const titan = selectedOthers.has('Titan') ? 'titan_' : '';
		const stat = _selectedStat.toLowerCase();
		const element = _selectedElement ? _selectedElement.toLowerCase() + '_' : '';
		const percent = selectedOthers.has('Percent') ? '_percent' : '';

		if (_selectedStat !== 'TOTAL ATK') {
			return rainbow + gear + titan + element + stat + percent;
		} else {
			return rainbow + gear + '( ' + titan + element + 'atk' + ' + ' + titan + 'atk )';
		}
	}

	function getSlotGroup(slot: string): string | null {
		for (const [group, slots] of Object.entries(PART_GROUPS)) {
			if (slots.includes(slot)) {
				return group;
			}
		}
		return null;
	}

	function selectElement(element: (typeof ELEMENTS)[number]) {
		if (selectedElement === element) {
			selectedElement = null;
		} else {
			selectedElement = element;
		}
	}

	function selectStat(stat: (typeof STATS)[number]) {
		if (selectedStat !== stat) {
			selectedStat = stat;
		}
	}

	function selectOthers(option: (typeof OTHERS)[number]) {
		if (selectedOthers.has(option)) {
			selectedOthers.delete(option);
		} else {
			selectedOthers.add(option);
		}
	}

	function selectSlot(slot: (typeof PARTS)[number]) {
		if (selectedSlot === slot) {
			selectedSlot = null;
		} else {
			selectedSlot = slot;
		}
	}

	function isSelected(type: 'element' | 'stat' | 'other' | 'slot', value: string): boolean {
		switch (type) {
			case 'element':
				return selectedElement === value;
			case 'stat':
				return selectedStat === value;
			case 'other':
				return selectedOthers.has(value);
			case 'slot':
				return selectedSlot === value;
			default:
				return false;
		}
	}

	function onButtonPress(button: string) {
		if (button === 'Search!') {
			// check if query is safe
			const invalid = query.replaceAll(ALLOWED_REGEX_VARS, '').replaceAll(ALLOWED_REGEX_OPS, '');
			if (invalid) {
				console.error('bad stuff in query!!!:', invalid);
				return;
			}

			onConfirmSearch(query);
		} else {
			open = false;
		}
	}

	// validate query
	$effect(() => {
		console.log('validating query:', query);

		if (selectedStat === 'CRIT') {
			selectedElement = null;
		} else if (selectedStat === 'DMG') {
			selectedOthers.add('Percent');
			selectedOthers.delete('Total');
		} else if (selectedStat == 'TOTAL ATK') {
			selectedOthers.delete('Percent');

			if (selectedElement === null || selectedElement === 'Alt') {
				selectedElement = 'Flame';
			}
		}

		const invalid = query.replaceAll(ALLOWED_REGEX_VARS, '').replaceAll(ALLOWED_REGEX_OPS, '');
		if (invalid) {
			console.error('bad query!!!:', invalid);
		} else {
			console.log('query looks safe!');
		}
	});
</script>

<Dialog
	title="Gear Search"
	buttons={['Search!', 'Cancel']}
	primary={'Search!'}
	{onButtonPress}
	bind:open
>
	<div class="search-dialog">
		<!-- {#if !isMobile}
			<label for="search">Search Query:</label>
			<div class="search-bar">
				<input id="search" type="text" readonly value={query} placeholder="Search Query" />
			</div>
		{/if} -->

		<div class="slot-section">
			<h3>Slot</h3>
			<div class="slot-grid">
				{#each PARTS as slot}
					<button
						class:selected={isSelected('slot', slot)}
						class:group1={getSlotGroup(slot) === 'Group 1'}
						class:group2={getSlotGroup(slot) === 'Group 2'}
						class:group3={getSlotGroup(slot) === 'Group 3'}
						onclick={() => selectSlot(slot)}
						title={slot}
					>
						<div class="slot-button-content">
							<img
								src={`./gear_icon/${slot.toLowerCase()}.png`}
								alt={`${slot} icon`}
								class="slot-icon"
								width="30px"
								height="30px"
							/>
							{#if !is_mobile}
								<span class="slot-label">{slot}</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="search-params-simple">
			<div class="column">
				<h3>Element</h3>
				{#each ELEMENTS as element}
					<button
						class:selected={isSelected('element', element)}
						onclick={() => selectElement(element)}
					>
						<div class="btn-content">
							<img
								src={`./stat_icon/${element.toLowerCase()}.webp`}
								alt={`${element} icon`}
								class="element-icon"
							/>
							<span>{element}</span>
						</div>
					</button>
				{/each}
			</div>
			<div class="column">
				<h3>Stat</h3>

				{#each STATS as stat}
					<button class:selected={isSelected('stat', stat)} onclick={() => selectStat(stat)}
						>{stat}</button
					>
				{/each}
			</div>
			<div class="column">
				<h3>Others</h3>

				{#each OTHERS as other}
					<button class:selected={isSelected('other', other)} onclick={() => selectOthers(other)}
						>{other}</button
					>
				{/each}
			</div>
		</div>
	</div>
</Dialog>

<style>
	.search-dialog {
		width: 100%;
	}

	/* .search-bar {
		margin-top: 0.5rem;
		margin-bottom: 1rem;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.search-bar input {
		width: 80%;
		padding: 0.75rem;
		border-radius: 0.25rem;
		border: 1px solid var(--border-color);
		font-size: 1rem;
		background-color: var(--input-bg);
		color: var(--input-text, #fff);
	} */

	/* Slot section styling */
	.slot-section {
		margin-bottom: 1.5rem;
	}

	.slot-section h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.slot-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	/* Group styling for slot buttons */
	.slot-grid button {
		padding: 0.5rem;
		height: auto;
	}

	.slot-button-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.slot-icon {
		/* Fixed size of 40x40px */
		width: 30px;
		height: 30px;
		object-fit: contain;
	}

	.slot-label {
		margin-top: 0.25rem;
		font-size: 0.8rem;
		text-align: center;
		word-break: break-word;
	}

	.slot-grid button.group1 {
		border-left: 3px solid #ff7700;
	}

	.slot-grid button.group2 {
		border-left: 3px solid #00aaff;
	}

	.slot-grid button.group3 {
		border-left: 3px solid #44cc44;
	}

	/* Highlight the group borders when selected */
	.slot-grid button.selected.group1 {
		border: 1px solid var(--border-color);
		border-left: 3px solid #ff7700;
	}

	.slot-grid button.selected.group2 {
		border: 1px solid var(--border-color);
		border-left: 3px solid #00aaff;
	}

	.slot-grid button.selected.group3 {
		border: 1px solid var(--border-color);
		border-left: 3px solid #44cc44;
	}

	.search-params-simple {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		margin: 0 0.5rem;
	}

	.column:first-child {
		margin-left: 0;
	}

	.column:last-child {
		margin-right: 0;
	}

	h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	button {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: 1px solid var(--border-color);
		background-color: var(--button-bg);
		cursor: pointer;
		transition: all 0.2s ease;
		display: block;
		width: 100%;
	}

	button:hover {
		background-color: var(--button-hover-bg);
	}

	button.selected {
		background-color: violet;
		color: var(--button-primary-text);
		border-color: var(--button-primary-border);
	}

	.btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.element-icon {
		width: 20px;
		height: 20px;
		margin-right: 0.5rem;
		vertical-align: middle;
	}
</style>
