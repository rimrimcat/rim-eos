<script lang="ts">
	// Imports
	import { CircleX, CirclePlus } from '@lucide/svelte';
	import { validateValue } from '$lib/scripts/validation.ts';
	import { loadObject, LOCAL_GEAR_MAIN } from '$lib/scripts/loader';

	// Types
	type ColumnItem = {
		id: string;
		label: string;
		width: number;
		hidden?: boolean;
		editable?: boolean;
	};

	type RowItem = {
		id: string;
		part: string;
		atk: string;
		ele_atk: string;
		total_atk: string;
		ele_atk_percent: string;
		ele_dmg_percent: string;
		crit: string;
		crit_percent: string;
		// TODO: Add other stuff here
		validationErrors?: Record<string, boolean>;
	};

	type CellObj = {
		row?: RowItem;
		column: ColumnItem;
		isHeader?: boolean | null;
	};

	let { fixed_row = false } = $props();

	let loadedObject = loadObject(LOCAL_GEAR_MAIN);

	let data = $state(JSON.parse(JSON.stringify(loadedObject.data)));
	let columns = $state(JSON.parse(JSON.stringify(loadedObject.columns)));
	let user_data = $state(JSON.parse(JSON.stringify(loadedObject.data))); // deepcopy, data being edited

	// State
	let hiddenColumns: string[] = $state([]);
	let draggedColumn: ColumnItem | null = $state(null);
	let dragOverColumn: ColumnItem | null = $state(null);
	let editingCell: CellObj | null = $state(null); // Track which cell is being edited
	let editValue: string = $state(''); // Current value being edited
	let resizingColumn: ColumnItem | null = $state(null); // Column being resized
	let startX = $state(0); // Starting X position for resize
	let startWidth = $state(0); // Starting width for resize
	let columnCount = $state(0); // Counter for generating unique IDs for new columns
	let rowCount = $state(data.length); // Counter for generating row IDs
	let isAddingNewColumn = $state(false); // Track if we're in "add new column" mode
	let newColumnTempItem: ColumnItem | null = $state(null); // Temporary column for adding

	// Constants
	const ICON_SIZE = 20;
	const ICON_COLOR = '#444';

	function handleDragStart(column: ColumnItem) {
		draggedColumn = column;
	}

	function handleDragOver(e: any, column: ColumnItem) {
		e.preventDefault();
		dragOverColumn = column;
	}

	function handleDrop(e: any) {
		e.preventDefault();

		if (draggedColumn && dragOverColumn && draggedColumn !== dragOverColumn) {
			// Get the indices of the dragged and target columns
			const fromIndex = columns.indexOf(draggedColumn);
			const toIndex = columns.indexOf(dragOverColumn);

			// Remove the dragged column from its current position
			columns.splice(fromIndex, 1);

			// Insert the dragged column at the new position
			columns.splice(toIndex, 0, draggedColumn);

			// Update the columns array to trigger reactivity
			columns = [...columns];
		}

		// Reset drag state
		draggedColumn = null;
		dragOverColumn = null;
	}

	function handleDragEnd() {
		draggedColumn = null;
		dragOverColumn = null;
	}

	function startResize(e: any, column: ColumnItem) {
		e.preventDefault();
		e.stopPropagation();
		resizingColumn = column;
		startX = e.clientX;
		startWidth = column.width || 150; // Default width if not set

		// Add event listeners for mouse move and up
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: any) {
		if (resizingColumn) {
			const newWidth = Math.max(50, startWidth + (e.clientX - startX));
			resizingColumn.width = newWidth;
			columns = [...columns]; // Trigger reactivity
		}
	}

	function handleMouseUp() {
		resizingColumn = null;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	}

	function startEditCell(row: RowItem, column: ColumnItem) {
		if (!(column.editable !== false)) {
			return;
		}

		editingCell = { row, column };

		console.log(editingCell);

		const row_index = data.indexOf(row);
		const user_value = user_data[row_index][column.id];

		// Show user data value instead of actual value
		editValue = user_value !== undefined ? user_value : '';

		// Automatically select all content when starting to edit the cell
		setTimeout(() => {
			const input = document.getElementById(`input-${row.id}-${column.id}`);
			if (input) {
				input.select(); // Select all text in the input
			}
		}, 0);
	}

	function saveEditCell() {
		if (editingCell) {
			if (!editingCell.row) {
				console.error('No row found.');
				return;
			}

			const row_index = data.indexOf(editingCell.row);
			const col_id = editingCell.column.id;

			user_data[row_index][col_id] = editValue;

			const valValue = validateValue(col_id, editValue);
			data[row_index][col_id] = valValue;

			// Track validation errors
			if (!data[row_index].validationErrors) {
				data[row_index].validationErrors = {};
			}

			data[row_index].validationErrors[col_id] = valValue === '???';

			// Reset editing state
			editingCell = null;
			editValue = '';

			// Trigger reactivity
			data = [...data];
		}
	}

	function hasRowValidationError(row: RowItem): boolean {
		if (!row.validationErrors) return false;
		return Object.values(row.validationErrors).some((hasError) => hasError);
	}

	function getCellClasses(row: RowItem, column: ColumnItem): string {
		const classes = [];

		if (column.editable === false) {
			classes.push('non-editable-cell');
		}

		// Check for cell-specific validation error
		if (row.validationErrors && row.validationErrors[column.id]) {
			classes.push('validation-error-cell');
		}

		return classes.join(' ');
	}

	// UNUSED: header editing disabled now
	function startEditHeader(column: ColumnItem) {
		editingCell = { column, isHeader: true };
		editValue = column.label;

		// Automatically select all content when starting to edit the header
		setTimeout(() => {
			const input = document.getElementById(`input-header-${column.id}`);
			if (input) {
				input.select(); // Select all text in the input field
			}
		}, 0);
	}

	function saveEditHeader() {
		if (editingCell && editingCell.isHeader) {
			// Update the column label
			const newLabel = editValue;
			editingCell.column.label = newLabel;

			// Check if there's a hidden column with the same label
			const hiddenColumn = getHiddenColumns().find((col) => col.label === newLabel);
			if (hiddenColumn) {
				// Show the hidden column with the same label
				showColumn(hiddenColumn.id);
			}

			// Reset editing state
			editingCell = null;
			editValue = '';

			// Trigger reactivity
			columns = [...columns];
		}
	}

	function handleKeyPress(e: any) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (isAddingNewColumn && newColumnTempItem) {
				processNewColumn();
			} else if (editingCell && editingCell.isHeader) {
				saveEditHeader();
			} else {
				saveEditCell();
			}
		} else if (e.key === 'Escape') {
			if (isAddingNewColumn) {
				resetAddNewColumn();
			} else {
				editingCell = null;
				editValue = '';
			}
		}
	}

	function addNewColumn() {
		// Create a temporary column for prompting
		columnCount++;
		const newColumnId = `column${columnCount}`;

		newColumnTempItem = {
			id: newColumnId,
			label: '',
			width: 150 // Default width in pixels
		};

		isAddingNewColumn = true;
		editValue = ''; // Start with empty prompt

		// Automatically focus the input field
		setTimeout(() => {
			const input = document.getElementById(`input-new-column`);
			if (input) {
				input.focus();
			}
		}, 0);
	}

	function processNewColumn() {
		if (!newColumnTempItem || !editValue.trim()) {
			resetAddNewColumn();
			return;
		}

		const newLabel = validateValue('header', editValue);

		// Check if there's a hidden column with the same label
		const hiddenColumn = getHiddenColumns().find((col) => col.label === newLabel);
		if (hiddenColumn) {
			// Show the hidden column with the same label and move it to the end
			const index = columns.findIndex((col) => col.id === hiddenColumn.id);
			if (index !== -1) {
				const column = columns[index];
				// Remove the column from its current position
				columns.splice(index, 1);
				// Add it to the end before the "add column" button
				columns.push(column);
				// Update hidden status
				showColumn(hiddenColumn.id);
			}
		} else {
			resetAddNewColumn();
			return;
		}

		// Reset state
		resetAddNewColumn();

		// Trigger reactivity
		columns = [...columns];
	}

	function resetAddNewColumn() {
		isAddingNewColumn = false;
		newColumnTempItem = null;
		editValue = '';
	}

	function addNewRow() {
		rowCount++;
		const newRow = { id: rowCount };

		const firstColumnId = columns[0]?.id; // Get the first column ID

		// Add empty values for all other columns
		columns.forEach((column) => {
			if (column.id !== firstColumnId) {
				newRow[column.id] = '';
			}
		});

		// Add the new row to the data array
		data = [...data, newRow];
	}

	function ensureColumnWidths() {
		columns = columns.map((col) => {
			if (!col.width) {
				return { ...col, width: 150 }; // Default width
			}
			return col;
		});
	}

	function hideColumn(columnId: string) {
		// Find column and mark it as hidden
		columns = columns.map((col) => {
			if (col.id === columnId) {
				return { ...col, hidden: true };
			}
			return col;
		});

		// Add to hidden columns list
		if (!hiddenColumns.includes(columnId)) {
			hiddenColumns = [...hiddenColumns, columnId];
		}
	}

	function showColumn(columnId: string) {
		// Find column and mark it as visible
		columns = columns.map((col) => {
			if (col.id === columnId) {
				return { ...col, hidden: false };
			}
			return col;
		});

		// Remove from hidden columns list
		hiddenColumns = hiddenColumns.filter((id) => id !== columnId);
	}

	// UNUSED
	function toggleColumnVisibility(column: ColumnItem) {
		if (column.hidden) {
			showColumn(column.id);
		} else {
			hideColumn(column.id);
		}
	}

	function getVisibleColumns() {
		return columns.filter((col) => !col.hidden);
	}

	function getHiddenColumns() {
		return columns.filter((col) => col.hidden);
	}

	// initialization
	ensureColumnWidths();
</script>

<div class="table-container">
	<!-- Column visibility controls. Remove later -->
	<div class="column-controls">
		<details>
			<summary>Hidden Columns</summary>
			<div class="hidden-columns-list">
				{#each getHiddenColumns() as column}
					<div class="hidden-column-item">
						<span>{column.label}</span>
						<button onclick={() => showColumn(column.id)} class="show-column-btn">Show</button>
					</div>
				{/each}
				{#if getHiddenColumns().length === 0}
					<div class="no-hidden-columns">No hidden columns</div>
				{/if}
			</div>
		</details>
	</div>

	<table class="fixed-table">
		<thead>
			<tr>
				{#each getVisibleColumns() as column, index}
					<th
						draggable="true"
						ondragstart={() => handleDragStart(column)}
						ondragover={(e) => handleDragOver(e, column)}
						ondrop={handleDrop}
						ondragend={handleDragEnd}
						class={dragOverColumn === column ? 'drag-over' : ''}
						style="width: {column.width}px;"
					>
						<div class="th-content">
							{#if editingCell && editingCell.isHeader && editingCell.column === column}
								<input
									id="input-header-{column.id}"
									bind:value={editValue}
									onblur={saveEditHeader}
									onkeydown={handleKeyPress}
									class="edit-input"
								/>
							{:else}
								<!-- <span ondblclick={() => startEditHeader(column)}>{column.label}</span> -->
								<span>{column.label}</span>
							{/if}

							<div class="th-actions">
								{#if column.editable !== false}
									<button
										onclick={() => hideColumn(column.id)}
										class="hide-column-btn"
										title="Hide column"
									>
										<CircleX display={'block'} size={ICON_SIZE} color={ICON_COLOR} />
									</button>
								{/if}
								<!-- <span class="drag-handle">⋮⋮</span> -->
							</div>
						</div>
						<div class="resize-handle" onmousedown={(e) => startResize(e, column)}></div>
					</th>
				{/each}

				<th class="add-column-th">
					{#if isAddingNewColumn}
						<div class="new-column-prompt">
							<input
								id="input-new-column"
								bind:value={editValue}
								onblur={processNewColumn}
								onkeydown={handleKeyPress}
								class="edit-input"
								placeholder="Column name"
							/>
						</div>
					{:else}
						<button onclick={addNewColumn} class="add-column-btn">
							<CirclePlus display={'block'} size={ICON_SIZE} color={ICON_COLOR} />
						</button>
					{/if}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each data as row, rowIndex}
				<tr class={hasRowValidationError(row) ? 'validation-error-row' : ''}>
					{#each getVisibleColumns() as column}
						<td
							style="width: {column.width}px;"
							ondblclick={() => startEditCell(row, column)}
							class={getCellClasses(row, column)}
						>
							{#if editingCell && editingCell.row === row && editingCell.column === column}
								<input
									id="input-{row.id}-{column.id}"
									bind:value={editValue}
									onblur={saveEditCell}
									onkeydown={handleKeyPress}
									class="edit-input"
								/>
							{:else if column.id === 'part' && row[column.id]}
								<div class="part-cell">
									<img
										src={`./gear/${row[column.id].toLowerCase()}.png`}
										alt={row[column.id]}
										class="part-icon"
									/>
									<span>{row[column.id]}</span>
								</div>
							{:else}
								{row[column.id] !== undefined ? row[column.id] : ''}
							{/if}
						</td>
					{/each}
					<td class="empty-cell"></td>
					<!-- Empty cell for balance with the header row -->
				</tr>
			{/each}
			{#if !fixed_row}
				<tr class="add-row-tr">
					<td colspan={getVisibleColumns().length + 1} class="add-row-td">
						<button onclick={addNewRow} class="add-row-btn">+</button>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		overflow-x: auto;
		width: 100%;
	}

	table {
		border-collapse: separate;
		border-spacing: 0;
		table-layout: fixed; /* This ensures the columns maintain their width */
		width: auto; /* Changed from 100% to auto to prevent table from expanding to container */
	}

	th,
	td {
		border: 0.0625rem solid #ddd;
		padding: 0.5rem;
		text-align: left;
		position: relative;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	th {
		background-color: #f2f2f2;
		cursor: move;
		user-select: none;
		position: relative;
	}

	.th-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 0.375rem; /* Make room for resize handle */
	}

	.th-actions {
		display: flex;
		align-items: center;
		vertical-align: middle;
	}

	.drag-handle {
		cursor: grab;
		margin-left: 0.5rem;
		opacity: 0.5;
	}

	.drag-handle:hover {
		opacity: 1;
	}

	.resize-handle {
		position: absolute;
		right: 0;
		top: 0;
		width: 0.5rem;
		height: 100%;
		cursor: col-resize;
		background-color: transparent;
	}

	.resize-handle:hover {
		background-color: #aaa;
	}

	.resize-handle:active {
		background-color: #777;
	}

	.drag-over {
		background-color: #e0e0e0;
		border: 0.125rem dashed #999;
	}

	tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	tr:hover {
		background-color: #f5f5f5;
	}

	.edit-input {
		width: 100%;
		padding: 0.25rem;
		box-sizing: border-box;
	}

	.add-column-th {
		width: 3.125rem;
		cursor: default;
	}

	.add-column-btn,
	.add-row-btn {
		color: white;
		border: none;
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		opacity: 0.6;
	}

	.add-column-btn:hover,
	.add-row-btn:hover {
		opacity: 1;
	}

	.empty-cell {
		width: 3.125rem; /* Match the width of add-column-th */
	}

	.fixed-table {
		min-width: min-content; /* Ensures the table doesn't shrink smaller than column contents */
	}

	.add-row-td {
		text-align: center;
		padding: 0.5rem;
		background-color: #f9f9f9;
		border: 0.0625rem solid #ddd; /* Same border as table cells */
	}

	.add-row-tr {
		border-top: 0.0625rem dashed #ddd;
	}

	.column-controls {
		margin-bottom: 0.625rem;
	}

	.hidden-columns-list {
		background-color: #f9f9f9;
		border: 0.0625rem solid #ddd;
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-top: 0.3125rem;
	}

	.hidden-column-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0;
		border-bottom: 0.0625rem solid #eee;
	}

	.hidden-column-item:last-child {
		border-bottom: none;
	}

	.show-column-btn {
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	.hide-column-btn {
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.6;
		padding: 0;
		font-size: 1rem;
	}

	.hide-column-btn:hover {
		opacity: 1;
	}

	.no-hidden-columns {
		font-style: italic;
		color: #888;
		padding: 0.25rem 0;
	}

	details summary {
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		background-color: #f2f2f2;
		border: 0.0625rem solid #ddd;
		border-radius: 0.25rem;
		display: inline-block;
	}

	details summary:hover {
		background-color: #e9e9e9;
	}

	.new-column-prompt {
		padding: 0.25rem;
		width: 100%;
	}

	.add-column-th {
		min-width: 7.5rem; /* Make it wider to accommodate the input field */
	}

	.part-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.part-icon {
		width: 2.25rem;
		height: 2.25rem;
		object-fit: contain;
	}

	.non-editable-cell {
		background-color: #f0f0f0;
		cursor: not-allowed;
	}

	.validation-error-row {
		background-color: #ffeeee !important;
	}

	.validation-error-row:hover {
		background-color: #ffe6e6 !important;
	}

	.validation-error-cell {
		background-color: #ffcccc !important;
		color: #cc0000;
	}

	tr.validation-error-row:nth-child(even) {
		background-color: #ffeeee !important;
	}

	tr.validation-error-row:nth-child(even):hover {
		background-color: #ffe6e6 !important;
	}
</style>
