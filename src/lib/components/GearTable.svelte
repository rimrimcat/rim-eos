<script lang="ts">
	// Imports
	import { CircleX, CirclePlus } from '@lucide/svelte';
	import { validateValue } from '$lib/scripts/helpers';

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

	// Properties
	export let data: RowItem[] = []; // actual data visible
	export let columns: ColumnItem[] = [];
	export let fixed_row: boolean = false;

	let user_data = JSON.parse(JSON.stringify(data)); // deepcopy, data being edited

	// State
	let hiddenColumns: string[] = [];
	let draggedColumn: ColumnItem | null = null;
	let dragOverColumn: ColumnItem | null = null;
	let editingCell: CellObj | null = null; // Track which cell is being edited
	let editValue: string = ''; // Current value being edited
	let resizingColumn: ColumnItem | null = null; // Column being resized
	let startX = 0; // Starting X position for resize
	let startWidth = 0; // Starting width for resize
	let columnCount = 0; // Counter for generating unique IDs for new columns
	let rowCount = data.length; // Counter for generating row IDs
	let isAddingNewColumn = false; // Track if we're in "add new column" mode
	let newColumnTempItem: ColumnItem | null = null; // Temporary column for adding

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
			// Update the data

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
						<button on:click={() => showColumn(column.id)} class="show-column-btn">Show</button>
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
						on:dragstart={() => handleDragStart(column)}
						on:dragover={(e) => handleDragOver(e, column)}
						on:drop={handleDrop}
						on:dragend={handleDragEnd}
						class={dragOverColumn === column ? 'drag-over' : ''}
						style="width: {column.width}px;"
					>
						<div class="th-content">
							{#if editingCell && editingCell.isHeader && editingCell.column === column}
								<input
									id="input-header-{column.id}"
									bind:value={editValue}
									on:blur={saveEditHeader}
									on:keydown={handleKeyPress}
									class="edit-input"
									autofocus
								/>
							{:else}
								<!-- <span on:dblclick={() => startEditHeader(column)}>{column.label}</span> -->
								<span>{column.label}</span>
							{/if}

							<div class="th-actions">
								{#if column.editable !== false}
									<button
										on:click={() => hideColumn(column.id)}
										class="hide-column-btn"
										title="Hide column"
									>
										<CircleX display={'block'} size={ICON_SIZE} color={ICON_COLOR} />
									</button>
								{/if}
								<!-- <span class="drag-handle">⋮⋮</span> -->
							</div>
						</div>
						<div class="resize-handle" on:mousedown={(e) => startResize(e, column)}></div>
					</th>
				{/each}

				<th class="add-column-th">
					{#if isAddingNewColumn}
						<div class="new-column-prompt">
							<input
								id="input-new-column"
								bind:value={editValue}
								on:blur={processNewColumn}
								on:keydown={handleKeyPress}
								class="edit-input"
								placeholder="Column name"
								autofocus
							/>
						</div>
					{:else}
						<button on:click={addNewColumn} class="add-column-btn">
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
							on:dblclick={() => startEditCell(row, column)}
							class={getCellClasses(row, column)}
						>
							{#if editingCell && editingCell.row === row && editingCell.column === column}
								<input
									id="input-{row.id}-{column.id}"
									bind:value={editValue}
									on:blur={saveEditCell}
									on:keydown={handleKeyPress}
									class="edit-input"
									autofocus
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
						<button on:click={addNewRow} class="add-row-btn">+</button>
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
		border: 1px solid #ddd;
		padding: 8px;
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
		padding-right: 6px; /* Make room for resize handle */
	}

	.th-actions {
		display: flex;
		align-items: center;
		vertical-align: middle;
	}

	.drag-handle {
		cursor: grab;
		margin-left: 8px;
		opacity: 0.5;
	}

	.drag-handle:hover {
		opacity: 1;
	}

	.resize-handle {
		position: absolute;
		right: 0;
		top: 0;
		width: 8px;
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
		border: 2px dashed #999;
	}

	tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	tr:hover {
		background-color: #f5f5f5;
	}

	.edit-input {
		width: 100%;
		padding: 4px;
		box-sizing: border-box;
	}

	.add-column-th {
		width: 50px;
		cursor: default;
	}

	.add-column-btn,
	.add-row-btn {
		color: white;
		border: none;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		font-size: 16px;
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
		width: 50px; /* Match the width of add-column-th */
	}

	.fixed-table {
		min-width: min-content; /* Ensures the table doesn't shrink smaller than column contents */
	}

	.add-row-td {
		text-align: center;
		padding: 8px;
		background-color: #f9f9f9;
		border: 1px solid #ddd; /* Same border as table cells */
	}

	.add-row-tr {
		border-top: 1px dashed #ddd;
	}

	.column-controls {
		margin-bottom: 10px;
	}

	.hidden-columns-list {
		background-color: #f9f9f9;
		border: 1px solid #ddd;
		padding: 8px;
		border-radius: 4px;
		margin-top: 5px;
	}

	.hidden-column-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 0;
		border-bottom: 1px solid #eee;
	}

	.hidden-column-item:last-child {
		border-bottom: none;
	}

	.show-column-btn {
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 2px 6px;
		cursor: pointer;
		font-size: 12px;
	}

	.hide-column-btn {
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.6;
		padding: 0;
		font-size: 16px;
	}

	.hide-column-btn:hover {
		opacity: 1;
	}

	.no-hidden-columns {
		font-style: italic;
		color: #888;
		padding: 4px 0;
	}

	details summary {
		cursor: pointer;
		padding: 4px 8px;
		background-color: #f2f2f2;
		border: 1px solid #ddd;
		border-radius: 4px;
		display: inline-block;
	}

	details summary:hover {
		background-color: #e9e9e9;
	}

	.new-column-prompt {
		padding: 4px;
		width: 100%;
	}

	.add-column-th {
		min-width: 120px; /* Make it wider to accommodate the input field */
	}

	.part-cell {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.part-icon {
		width: 36px;
		height: 36px;
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
