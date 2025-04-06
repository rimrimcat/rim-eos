<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Dialog from '../Dialog.svelte';

	let { open = $bindable(false), onConfirmSearch = (query: string) => {} } = $props();

	let advancedOptions = $state(false);

	let selectedElement = $state<string | null>(null);
	let selectedStat = $state('ATK');
	let selectedOthers = $state(new SvelteSet());

	// [TITAN_][ELEMENT_]<STAT>[_PERCENT]
	let query = $derived(
		(selectedOthers.has('Titan') ? 'titan_' : '') +
			(selectedElement ? selectedElement.toLowerCase() + '_' : '') +
			selectedStat.toLowerCase() +
			(selectedOthers.has('Percent') ? '_percent' : '')
	);

	const ELEMENTS = ['Flame', 'Frost', 'Volt', 'Phys', 'Alt'];
	const STATS = ['ATK', 'DMG', 'RES', 'CRIT'];
	const OTHERS = ['Titan', 'Percent'];

	function selectElement(element: string) {
		if (selectedElement === element) {
			selectedElement = null;
		} else {
			selectedElement = element;
		}
	}

	function selectStat(stat: string) {
		if (selectedStat !== stat) {
			selectedStat = stat;
		}
	}

	function selectOthers(option: string) {
		if (selectedOthers.has(option)) {
			selectedOthers.delete(option);
		} else {
			selectedOthers.add(option);
		}
	}

	function isSelected(type: string, value: string): boolean {
		switch (type) {
			case 'element':
				return selectedElement === value;
			case 'stat':
				return selectedStat === value;
			case 'other':
				return selectedOthers.has(value);
			default:
				return false;
		}
	}

	function onButtonPress(button: string) {
		if (button === 'Search!') {
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
		<label for="search">Search Query:</label>
		<div class="search-bar">
			<input id="search" type="text" readonly value={query} placeholder="Search Query" />
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

	.search-bar {
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
		justify-content: flex-start;
	}

	.element-icon {
		width: 20px;
		height: 20px;
		margin-right: 0.5rem;
		vertical-align: middle;
	}
</style>
