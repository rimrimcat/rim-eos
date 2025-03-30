<script>
	export let n_rows = 8;
	export let n_columns = 2;
	export let attributes = [
		{ name: 'HP', icon: './stat/hp.png', value: '989317' },
		{ name: 'Crit', icon: './stat/crit.png', value: '11318' },
		{ name: 'Crit Rate', icon: './stat/crit.png', value: '1.372%' },
		{ name: 'Physical Attack', icon: './stat/physatk.png', value: '15544' },
		{ name: 'Flame Attack', icon: './stat/flameatk.png', value: '16976' },
		{ name: 'Frost Attack', icon: './stat/frostatk.png', value: '14452' },
		{ name: 'Volt Attack', icon: './stat/voltatk.png', value: '17489' },
		{ name: 'Altered Attack', icon: './stat/altatk.png', value: '18793' },
		{ name: 'Endurance', icon: './stat/endurance.png', value: '1300' },
		{ name: 'Endurance Regen Speed', icon: './stat/enduregen.png', value: '0.000%' },
		{ name: 'Crit Damage', icon: './stat/critdmg.png', value: '64.000%' },
		{ name: 'Physical Resistance', icon: './stat/physres.png', value: '8621' },
		{ name: 'Flame Resistance', icon: './stat/flameres.png', value: '14666' },
		{ name: 'Frost Resistance', icon: './stat/frostres.png', value: '14013' },
		{ name: 'Volt Resistance', icon: './stat/voltres.png', value: '10518' },
		{ name: 'Altered Resistance', icon: './stat/altres.png', value: '4892' }
	];

	// Calculate the grid layout
	let grid = [];

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
				if (attributeIndex < attributes.length) {
					grid[r][c] = attributes[attributeIndex];
					attributeIndex++;
				}
			}
		}
	}

	// Calculate initial grid
	calculateGrid();

	// Recalculate grid when props change
	$: {
		if (n_rows && n_columns && attributes) {
			calculateGrid();
		}
	}
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
								<img src={cell.icon} alt={cell.name + ' icon'} />
							</div>
							<div class="stat-info">
								<div class="stat-name">{cell.name}</div>
								<input type="text" class="stat-value" value={cell.value} />
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
		background-color: rgba(0, 0, 0, 0.5);
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
		font-size: 12px;
		color: #a8b5c5;
	}

	.stat-value {
		background-color: rgba(20, 30, 40, 0.6);
		border: 1px solid rgba(100, 120, 140, 0.3);
		border-radius: 4px;
		color: white;
		padding: 2px 6px;
		font-size: 14px;
		width: 100%;
	}

	.empty {
		visibility: hidden;
	}
</style>
