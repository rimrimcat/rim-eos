<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

	let {
		gap = '2rem',
		minColumns = 1,
		maxColumns = 10,
		preferDivisible = false,
		by_column = true,
		children
	} = $props();

	let columns = $state(1);

	let numItems = $state(0);
	let itemWidth = $state(0);
	let itemHeight = $state(0);

	let container: HTMLDivElement;
	let items = $state([]);
	let measuringContainer: HTMLDivElement | null = $state(null);

	let hasMeasured = $state(false);

	// Function to measure the natural size of items
	async function measureItems() {
		if (!container || hasMeasured) return;

		// Wait for the DOM to update
		await tick();

		// Get all slot items
		items = Array.from(container.querySelectorAll(':scope > *:not(.measuring-container)'));

		if (items.length === 0) return;

		// If minItemWidth is not provided, we need to measure
		if (!itemWidth) {
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
				const clone = _item.cloneNode(true);
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

			itemWidth = Math.ceil(Math.max(...itemWidths));
			itemHeight = Math.ceil(Math.max(...itemHeights));
			numItems = items.length;

			console.log('Calculated minItemWidth:', itemWidth);
			console.log('Calculated minItemHeight:', itemHeight);
		}

		hasMeasured = true;
		updateGrid();
	}

	// Function to update the grid based on container width
	function updateGrid() {
		if (!container || !itemWidth) return;

		const fittableColumns = Math.floor(container.offsetWidth / itemWidth);

		if (fittableColumns > maxColumns) {
			columns = maxColumns;
		} else if (fittableColumns < minColumns) {
			columns = minColumns;
		} else {
			columns = fittableColumns;
		}

		if (preferDivisible && columns != 1) {
			while (numItems % columns !== 0) {
				columns--;
			}
		}

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
	});

	onMount(() => {
		onDestroy(() => {
			window.removeEventListener('resize', updateGrid);
		});
	});
</script>

<div
	class="flex-grid"
	bind:this={container}
	role="grid"
	aria-colcount={columns}
	style="gap: {gap};"
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
