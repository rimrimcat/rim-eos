<script lang="ts">
	// Imports
	import {
		validateValue,
		FLOAT_PERCENT,
		INTEGER,
		LOCAL_STATS_MAIN,
		loadObject,
		saveObject
	} from '$lib/scripts/helpers';

	// Types
	type AttributeItem = {
		name: string;
		icon: string;
		value: string;
		index?: number;
	};

	// Loaded
	const user_attributes_template = [
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
	];
	const stats_main = loadObject(LOCAL_STATS_MAIN);

	// Properties
	const n_rows = 8;
	const n_columns = 2;
	let user_attributes: AttributeItem[] = user_attributes_template.map((attr, index) => {
		return {
			...attr,
			value: stats_main[index]
		};
	});

	// Constants
	const SIZE_FACTOR = 1.25;

	// State
	let editValue: string = '';
	let editingIndex: number | null = null;
	let grid: AttributeItem[][] = [];

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

		// Update grid
		const flatIndex = index;
		const col = Math.floor(flatIndex / n_rows);
		const row = flatIndex % n_rows;

		if (grid[row] && grid[row][col]) {
			if (
				user_attributes[index].name === 'Crit Rate' ||
				user_attributes[index].name === 'Crit Damage'
			) {
				grid[row][col].value = validateValue(FLOAT_PERCENT, editValue);
			} else {
				grid[row][col].value = validateValue(INTEGER, editValue);
			}
		}

		editingIndex = null;
		editValue = '';
	}

	function handleKeyDown(e: any) {
		if (e.key === 'Enter') {
			editingIndex = null;
		}
	}

	// Calculate the grid layout
	function calculateGrid() {
		grid = [];

		// Initialize the grid with empty cells
		for (let r = 0; r < n_rows; r++) {
			const row = [];
			for (let c = 0; c < n_columns; c++) {
				row.push(null);
			}
			grid.push(row);
		}

		// Fill the grid with attributes column-first
		let attributeIndex = 0;
		for (let c = 0; c < n_columns; c++) {
			for (let r = 0; r < n_rows; r++) {
				if (attributeIndex < user_attributes.length) {
					grid[r][c] = {
						...user_attributes[attributeIndex],
						index: attributeIndex
					};
					attributeIndex++;
				}
			}
		}
	}

	// Calculate initial grid
	calculateGrid();

	// Recalculate grid when props change
	// $: {
	// 	if (n_rows && n_columns && attributes) {
	// 		calculateGrid();
	// 	}
	// }
</script>

<div class="stat-panel">
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
								<img
									src={cell.icon}
									alt={cell.name + ' icon'}
									style="width: {24 * SIZE_FACTOR}px; height: {24 * SIZE_FACTOR}px"
								/>
							</div>
							<div class="stat-info">
								<div class="stat-name" style="font-size: {12 * SIZE_FACTOR}px">{cell.name}</div>
								<div class="stat-value-container">
									{#if editingIndex === cell.index}
										<input
											id="a"
											type="text"
											class="stat-value"
											style="font-size: {14 * SIZE_FACTOR}px"
											bind:value={editValue}
											on:blur={() => saveEditCell(cell.index)}
											on:keydown={handleKeyDown}
											autofocus
										/>
									{:else}
										<div
											class="stat-value-text"
											style="font-size: {14 * SIZE_FACTOR}px"
											on:dblclick={() => startEditCell(cell.index)}
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
</div>

<style>
	.stat-panel {
		border-radius: 8px;
		padding: 16px;
		color: #a8b5c5;
		font-family: Arial, sans-serif;
	}

	.grid {
		display: grid;
		gap: 12px 32px;
	}

	.stat-cell {
		min-height: 40px;
	}

	.stat-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.stat-icon {
		width: 24px;
		height: 24px;
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
		gap: 2px;
	}

	.stat-name {
		font-weight: bold;
		padding-left: 5px;
		color: #000000;
	}

	.stat-value-container {
		width: 40%;
	}

	.stat-value {
		background-color: rgba(20, 30, 40, 0.6);
		border: 1px solid rgba(100, 120, 140, 0.3);
		border-radius: 4px;
		color: white;
		padding: 2px 6px;
		width: 100%;
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
