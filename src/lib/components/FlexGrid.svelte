<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

	let {
		horizontal_gap = '1rem',
		vertical_gap = '1rem',
		gap = undefined,
		min_cols = 1,
		max_cols = 10,
		prefer_divisible = false,
		by_column = true,
		has_measured = $bindable(false),
		children
	} = $props();

	if (gap !== undefined) {
		horizontal_gap = gap;
		vertical_gap = gap;
	}

	let columns = $state(1);

	let num_items = $state(0);
	let item_width = $state(0);
	let item_height = $state(0);

	let container: HTMLDivElement;
	let items = $state<Element[]>([]);
	let measuring_container: HTMLDivElement | null = $state(null);

	let previous_item_count = $state(0);
	let mutation_observer: MutationObserver | null = null;

	let gap_px = $state(0);

	// resizing calcs
	const _RESIZE_ARR = Array.from({ length: 1 + max_cols - min_cols + 1 }, (_, i) => i + min_cols);
	let size_arr = $derived(_RESIZE_ARR.map((value) => value * item_width + (value - 1) * gap_px));

	// Function to check if items have changed
	function checkItemsChanged() {
		if (!container) return;

		const currentItems = Array.from(
			container.querySelectorAll(':scope > *:not(.measuring-container)')
		);

		if (currentItems.length !== previous_item_count) {
			console.log(`Items changed: ${previous_item_count} → ${currentItems.length}`);
			previous_item_count = currentItems.length;

			// Reset measurements to force recalculation
			item_width = 0;
			item_height = 0;
			has_measured = false;

			// Remeasure and update grid
			measureItems();
		}
	}

	// Function to measure the natural size of items
	async function measureItems() {
		if (!container) return;

		// Wait for the DOM to update
		await tick();

		// Get all slot items
		items = Array.from(container.querySelectorAll(':scope > *:not(.measuring-container)'));
		num_items = items.length;

		if (items.length === 0) return;

		// If itemWidth is not set or we need to remeasure
		if (!item_width || !has_measured) {
			// Create a measuring container
			measuring_container = document.createElement('div');
			measuring_container.className = 'measuring-container';

			// Position it absolutely to not affect layout
			measuring_container.style.position = 'absolute';
			measuring_container.style.visibility = 'hidden';
			measuring_container.style.display = 'block';
			measuring_container.style.width = 'auto';

			// Add to DOM for measurement
			container.appendChild(measuring_container);

			// Keep track of maximum dimensions
			const itemWidths = [];
			const itemHeights = [];

			// Clone and measure each item
			for (const _item of items) {
				// Create a wrapper for this item
				const _itemWrapper = document.createElement('div');
				_itemWrapper.style.display = 'inline-block';
				_itemWrapper.style.width = 'auto';

				// Clone the item
				const clone = _item.cloneNode(true) as HTMLDivElement;
				_itemWrapper.appendChild(clone);

				// Add to measuring container
				measuring_container.appendChild(_itemWrapper);

				// Measure dimensions
				const _itemWidth = clone.offsetWidth;
				const _itemHeight = clone.offsetHeight;

				// Update max dimensions
				itemWidths.push(_itemWidth);
				itemHeights.push(_itemHeight);

				// Remove this item wrapper
				measuring_container.removeChild(_itemWrapper);
			}

			// Remove measuring container
			container.removeChild(measuring_container);
			measuring_container = null;

			item_width = Math.ceil(Math.max(...itemWidths));
			item_height = Math.ceil(Math.max(...itemHeights));

			// console.log('Calculated itemWidth:', itemWidth);
			// console.log('Calculated itemHeight:', itemHeight);
		}

		has_measured = true;
		updateGrid();
	}

	// Function to update the grid based on container width
	function updateGrid() {
		if (!container || !item_width) return;

		const currMaxColumns = Math.min(max_cols, num_items); // # columns shouldnt be greater than # items

		if (container.offsetWidth > size_arr[columns]) {
			columns++;
		} else if (container.offsetWidth < size_arr[columns - 1] && columns > 1) {
			columns--;
		}

		if (columns > currMaxColumns) {
			columns = currMaxColumns;
		} else if (columns < min_cols) {
			columns = min_cols;
		}

		if (prefer_divisible && columns != 1) {
			while (num_items % columns !== 0 && columns > 1) {
				columns--;
			}
		}

		// Update grid CSS
		container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

		// Apply column-based arrangement if needed
		if (by_column && items.length > 0) {
			const rows = Math.ceil(num_items / columns);

			// Remove any existing order styles first
			items.forEach((item) => {
				if (item instanceof HTMLElement) {
					item.style.order = '';
				}
			});

			// Apply new order based on by_column arrangement
			items.forEach((item, index) => {
				if (item instanceof HTMLElement) {
					// Calculate new position - for by_column layout
					// Formula: (index % rows) * columns + Math.floor(index / rows)
					const col = Math.floor(index / rows);
					const row = index % rows;
					const newIndex = row * columns + col;

					item.style.order = String(newIndex);
				}
			});
		} else {
			// Reset order styles when not using by_column
			items.forEach((item) => {
				if (item instanceof HTMLElement) {
					item.style.order = '';
				}
			});
		}
	}

	onMount(() => {
		measureItems();
		window.addEventListener('resize', updateGrid);

		// Set up mutation observer to detect DOM changes
		mutation_observer = new MutationObserver((mutations) => {
			const shouldCheck = mutations.some(
				(mutation) =>
					mutation.type === 'childList' ||
					mutation.type === 'attributes' ||
					mutation.type === 'characterData'
			);

			if (shouldCheck) {
				checkItemsChanged();
			}
		});

		// Start observing the container
		if (container) {
			mutation_observer.observe(container, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true
			});
		}

		gap_px =
			parseInt(horizontal_gap, 10) *
			parseFloat(getComputedStyle(document.documentElement).fontSize);
		onDestroy(() => {
			window.removeEventListener('resize', updateGrid);
			if (mutation_observer) {
				mutation_observer.disconnect();
			}
		});
	});
	$effect(() => {
		has_measured;
		measureItems();
	});
</script>

<div
	class="flex-grid"
	bind:this={container}
	role="grid"
	aria-colcount={columns}
	style="column-gap: {horizontal_gap}; row-gap: {vertical_gap};"
>
	{@render children()}
</div>

<style>
	.flex-grid {
		display: grid;
		width: 100%;
		grid-template-columns: 1fr;
		overflow-x: hidden;
	}
</style>
