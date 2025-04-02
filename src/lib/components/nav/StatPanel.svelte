<script lang="ts">
	// Imports
	import { validateValue, FLOAT_PERCENT_3D, INTEGER } from '$lib/scripts/validation.ts';
	import { LOCAL_STATS_MAIN, loadObject, saveObject } from '$lib/scripts/loader.ts';
	import { type AttributeItem } from '$lib/scripts/loader.ts';
	import { registerComponent, type ComponentMetadata } from '$lib/scripts/navMetadata.svelte.ts';

	import { ChartNoAxesColumn, Trash2, Download, FilePlus2, ImagePlus } from '@lucide/svelte';
	import NavTools from '../NavTools.svelte';
	import { onMount } from 'svelte';
	import Dialog from '../Dialog.svelte';

	// Properties
	let { n_rows = 8, n_columns = 2, size_factor = 1.25 } = $props();

	// State
	let user_attributes: AttributeItem[] = $state(loadObject(LOCAL_STATS_MAIN));
	let editValue: string = $state('');
	let editingIndex: number | null = $state(null);
	let grid: AttributeItem[][] = $state([]);

	function startEditCell(index: number) {
		editingIndex = index;

		const user_value = user_attributes[index].value;
		editValue = user_value !== undefined ? user_value : '';

		// Automatically select all content when starting to edit the cell
		setTimeout(() => {
			const input = document.getElementsByClassName('stat-value')[0] as HTMLInputElement;
			if (input) {
				input.select();
			}
		}, 0);
	}

	function saveEditCell(index: number) {
		// Update the source attributes array
		user_attributes[index].value = editValue;

		saveObject(LOCAL_STATS_MAIN, user_attributes).then(() => {
			console.log('Saved key: ' + LOCAL_STATS_MAIN);
		});

		// Update grid
		const flatIndex = index;
		const col = Math.floor(flatIndex / n_rows);
		const row = flatIndex % n_rows;

		if (grid[row] && grid[row][col]) {
			//  2 -> crit rate
			// 10 -> crit dmg
			if (index === 2 || index === 10) {
				grid[row][col].value = validateValue(FLOAT_PERCENT_3D, editValue);
			} else {
				grid[row][col].value = validateValue(INTEGER, editValue);
			}
		}

		editingIndex = null;
		editValue = '';
	}

	function handleKeyDown(e: any, index: number) {
		if (e.key === 'Enter') {
			saveEditCell(index);
		}
	}

	function createGrid() {
		grid = [];

		for (let r = 0; r < n_rows; r++) {
			const row = [];
			for (let c = 0; c < n_columns; c++) {
				row.push({ name: '', icon: '', value: '', index: -1 });
			}
			grid.push(row);
		}

		let attributeIndex = 0;
		let __val = '';
		let __use_percent = false;
		for (let c = 0; c < n_columns; c++) {
			for (let r = 0; r < n_rows; r++) {
				if (attributeIndex < user_attributes.length) {
					// only include if attributeIndex < length
					// the inverse normally never happens but it is whatever

					__val = user_attributes[attributeIndex].value;
					__use_percent = attributeIndex === 2 || attributeIndex === 10;

					grid[r][c] = {
						...user_attributes[attributeIndex],
						value: __use_percent
							? validateValue(FLOAT_PERCENT_3D, __val)
							: validateValue(INTEGER, __val)
					};
					attributeIndex++;
				}
			}
		}
	}

	function resetStats() {
		user_attributes = loadObject(LOCAL_STATS_MAIN, true);
		saveObject(LOCAL_STATS_MAIN, user_attributes).then(() => {
			console.log('Cleared key: ' + LOCAL_STATS_MAIN);
		});
		createGrid();
	}

	// register
	const id = 'stat-panel';

	const metadata: ComponentMetadata = {
		id,
		label: 'Stat Panel',
		lucide: ChartNoAxesColumn,
		showInNav: true,
		order: 0,
		tools: [
			{ id: 'screenshot', label: 'From Screenshot', lucide: ImagePlus },
			{ id: 'import', label: 'Import', lucide: FilePlus2 },
			{ id: 'export', label: 'Export', lucide: Download },
			{ id: 'reset', label: 'Reset', lucide: Trash2, action: resetStats },
			{ id: 'share', label: 'Share' }
		]
	};

	onMount(() => {
		registerComponent(id, metadata);
	});

	// initialize grid
	createGrid();

	// let __width__ = $state(0);
	// let __height__ = $state(0);
	// $inspect('width', __width__, 'rempx', getComputedStyle(document.documentElement).fontSize);
	// $inspect('height', __height__);
	//780 px => 48.75 rem for 8x2 height
	//545 px => 34.0625 rem for 8x2 width
</script>

<!-- bind:clientWidth={__width__} bind:clientHeight={__height__} -->
<div class="stat-panel">
	<h1 class="head">Character Stats</h1>

	<div
		class="grid"
		style="grid-template-rows: repeat({n_rows}, auto); grid-template-columns: repeat({n_columns}, 1fr);"
	>
		{#each grid as row, rowIndex}
			{#each row as cell, colIndex}
				{#if cell}
					<div class="stat-cell" style="grid-row: {rowIndex + 1}; grid-column: {colIndex + 1};">
						<div class="stat-content">
							<div class="stat-icon">
								<img src={cell.icon} alt={cell.name + ' icon'} />
							</div>
							<div class="stat-info">
								<div class="stat-name">{cell.name}</div>
								<div class="stat-value-container">
									{#if editingIndex === cell.index}
										<input
											id="a"
											type="text"
											class="stat-value"
											bind:value={editValue}
											onblur={() => saveEditCell(cell.index)}
											onkeydown={(e) => handleKeyDown(e, cell.index)}
										/>
									{:else}
										<div
											class="stat-value-text"
											style="font-size: {14 * size_factor}px"
											role="textbox"
											tabindex={10 + cell.index}
											ondblclick={() => startEditCell(cell.index)}
										>
											{cell.value}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div
						class="stat-cell empty"
						style="grid-row: {rowIndex + 1}; grid-column: {colIndex + 1};"
					></div>
				{/if}
			{/each}
		{/each}
	</div>

	<h1 class="Pro">Character Stats</h1>
</div>

<NavTools tools={metadata.tools} />

<style>
	.stat-panel {
		padding: 1rem;
		color: #000000;
	}

	.head {
		font-family: Georgia, 'Times New Roman', Times, serif;
	}

	.grid {
		display: grid;
		gap: 0.9rem 1rem;
	}

	.stat-cell {
		/* min-height: 1rem; */
	}

	.stat-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.stat-info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.stat-name {
		font-size: 1rem;
		font-weight: bold;
		padding-left: 0.4rem;
		color: #000000;
	}

	.stat-value-container {
		font-size: 1rem;
		width: 40%;
		border-radius: 2rem;
	}

	.stat-value {
		background-color: rgba(20, 30, 40, 0.6);
		border: 1px solid rgba(100, 120, 140, 0.3);
		border-radius: 0.1rem;
		color: white;
		padding: 2px 6px;
		width: 100%;
		font-size: 1rem;
	}

	.stat-value-text {
		padding: 2px 6px;
		color: black;
		cursor: pointer;
	}

	.empty {
		visibility: hidden;
	}
</style>
