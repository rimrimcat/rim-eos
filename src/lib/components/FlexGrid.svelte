<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

	let {
		horizontalGap = '1rem',
		verticalGap = '1rem',
		gap = undefined,
		minColumns = 1,
		maxColumns = 10,
		preferDivisible = false,
		by_column = true,
		children
	} = $props();

	// For backward compatibility - if gap is provided, use it for both dimensions
	// unless horizontalGap or verticalGap were explicitly set

	if (gap !== undefined) {
		horizontalGap = gap;
		verticalGap = gap;
	}

	let columns = $state(1);

	let numItems = $state(0);
	let itemWidth = $state(0);
	let itemHeight = $state(0);

	let container: HTMLDivElement;
	let items = $state<Element[]>([]);
	let measuringContainer: HTMLDivElement | null = $state(null);

	let hasMeasured = $state(false);
	let previousItemCount = $state(0);
	let mutationObserver: MutationObserver | null = null;

	// Function to check if items have changed
	function checkItemsChanged() {
		if (!container) return;

		const currentItems = Array.from(
			container.querySelectorAll(':scope > *:not(.measuring-container)')
		);

		if (currentItems.length !== previousItemCount) {
			console.log(`Items changed: ${previousItemCount} → ${currentItems.length}`);
			previousItemCount = currentItems.length;

			// Reset measurements to force recalculation
			itemWidth = 0;
			itemHeight = 0;
			hasMeasured = false;

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
		numItems = items.length;

		if (items.length === 0) return;

		// If itemWidth is not set or we need to remeasure
		if (!itemWidth || !hasMeasured) {
			// Create a measuring container
			measuringContainer = document.createElement('div');
			measuringContainer.className = 'measuring-container';

			// Position it absolutely to not affect layout
			measuringContainer.style.position = 'absolute';
			measuringContainer.style.visibility = 'hidden';
			measuringContainer.style.display = 'block';
			measuringContainer.style.width = 'auto';

			// Add to DOM for measurement
			container.appendChild(measuringContainer);

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
				measuringContainer.appendChild(_itemWrapper);

				// Measure dimensions
				const _itemWidth = clone.offsetWidth;
				const _itemHeight = clone.offsetHeight;

				// Update max dimensions
				itemWidths.push(_itemWidth);
				itemHeights.push(_itemHeight);

				// Remove this item wrapper
				measuringContainer.removeChild(_itemWrapper);
			}

			// Remove measuring container
			container.removeChild(measuringContainer);
			measuringContainer = null;

			itemWidth = Math.ceil(Math.max(...itemWidths));
			itemHeight = Math.ceil(Math.max(...itemHeights));

			// console.log('Calculated itemWidth:', itemWidth);
			// console.log('Calculated itemHeight:', itemHeight);
		}

		hasMeasured = true;
		updateGrid();
	}

	// Function to update the grid based on container width
	function updateGrid() {
		if (!container || !itemWidth) return;

		const fittableColumns = Math.floor(container.offsetWidth / itemWidth);
		const currMaxColumns = Math.min(maxColumns, numItems);

		if (fittableColumns > currMaxColumns) {
			columns = currMaxColumns;
		} else if (fittableColumns < minColumns) {
			columns = minColumns;
		} else {
			columns = fittableColumns;
		}

		if (preferDivisible && columns != 1) {
			while (numItems % columns !== 0 && columns > 1) {
				columns--;
			}
		}

		// console.log('fittable cols', fittableColumns);

		// Update grid CSS
		container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

		// Apply column-based arrangement if needed
		if (by_column && items.length > 0) {
			const rows = Math.ceil(numItems / columns);

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

	onMount(async () => {
		// Initial measurement of items
		await measureItems();
		window.addEventListener('resize', updateGrid);

		// Set up mutation observer to detect DOM changes
		mutationObserver = new MutationObserver((mutations) => {
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
			mutationObserver.observe(container, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true
			});
		}
	});

	onMount(() => {
		// put it here because server doesnt like it
		onDestroy(() => {
			window.removeEventListener('resize', updateGrid);
			if (mutationObserver) {
				mutationObserver.disconnect();
			}
		});
	});
</script>

<div
	class="flex-grid"
	bind:this={container}
	role="grid"
	aria-colcount={columns}
	style="column-gap: {horizontalGap}; row-gap: {verticalGap};"
>
	{@render children()}
</div>

<style>
	.flex-grid {
		display: grid;
		width: 100%;
		grid-template-columns: 1fr;
	}
</style>
