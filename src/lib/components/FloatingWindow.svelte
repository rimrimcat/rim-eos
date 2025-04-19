<script lang="ts">
	import type { GuideItem } from '$lib/types';
	import { onMount, tick } from 'svelte';
	import { Spring } from 'svelte/motion';

	let {
		title = $bindable('Floating Window'),
		open = $bindable(true),
		guide_content = null as GuideItem[] | null,
		minWidth = 200,
		minHeight = 150,
		initialX = window.innerWidth / 2 - 200,
		initialY = window.innerHeight / 2 - 150,
		resizable = true,
		draggable = true,
		closable = true,
		autoResize = false,
		animatePosition = true,
		onClose = () => {},
		children
	} = $props();

	// State variables
	let slow_mode = $state(0); // dont switch too fast
	let guide_index = $state(0);
	let contentElement: HTMLElement | null = $state(null);
	let windowElement: HTMLElement | null = $state(null);
	let headerElement: HTMLElement | null = $state(null);
	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let resizeDirection = $state({ x: 0, y: 0 });
	let measuringElement: HTMLElement | null = null;

	let position = new Spring({ x: initialX, y: initialY }, { stiffness: 0.1, damping: 0.6 });
	let dimensions = new Spring({ width: 400, height: 300 }, { stiffness: 0.1, damping: 0.6 });

	function moveWindow(x: number | string, y: number | string, animate = animatePosition) {
		let xPixels: number;
		let yPixels: number;

		// Handle x coordinate
		if (typeof x === 'string') {
			if (x.endsWith('vw')) {
				const vwValue = parseFloat(x);
				xPixels = (window.innerWidth * vwValue) / 100;
			} else if (x.endsWith('vh')) {
				const vhValue = parseFloat(x);
				xPixels = (window.innerHeight * vhValue) / 100;
			} else if (x.endsWith('%')) {
				const percentValue = parseFloat(x);
				xPixels = (window.innerWidth * percentValue) / 100;
			} else {
				xPixels = parseFloat(x) || position.current.x;
			}
		} else {
			xPixels = x;
		}

		if (typeof y === 'string') {
			if (y.endsWith('vh')) {
				const vhValue = parseFloat(y);
				yPixels = (window.innerHeight * vhValue) / 100;
			} else if (y.endsWith('vw')) {
				const vwValue = parseFloat(y);
				yPixels = (window.innerWidth * vwValue) / 100;
			} else if (y.endsWith('%')) {
				const percentValue = parseFloat(y);
				yPixels = (window.innerHeight * percentValue) / 100;
			} else {
				yPixels = parseFloat(y) || position.current.y;
			}
		} else {
			yPixels = y;
		}

		// Keep window within viewport bounds
		const maxX = window.innerWidth - dimensions.current.width;
		const maxY = window.innerHeight - dimensions.current.height;

		xPixels = Math.min(Math.max(0, xPixels), maxX);
		yPixels = Math.min(Math.max(0, yPixels), maxY);

		if (animate) {
			position.set({ x: xPixels, y: yPixels });
		} else {
			position.set({ x: xPixels, y: yPixels }, { hard: true });
		}
	}

	function moveWindowCenter(
		centerX: number | string,
		centerY: number | string,
		animate = animatePosition
	) {
		let centerXPixels: number;
		let centerYPixels: number;

		if (typeof centerX === 'string') {
			if (centerX.endsWith('vw')) {
				const vwValue = parseFloat(centerX);
				centerXPixels = (window.innerWidth * vwValue) / 100;
			} else if (centerX.endsWith('vh')) {
				const vhValue = parseFloat(centerX);
				centerXPixels = (window.innerHeight * vhValue) / 100;
			} else if (centerX.endsWith('%')) {
				const percentValue = parseFloat(centerX);
				centerXPixels = (window.innerWidth * percentValue) / 100;
			} else {
				centerXPixels = parseFloat(centerX) || position.current.x + dimensions.current.width / 2;
			}
		} else {
			centerXPixels = centerX;
		}

		if (typeof centerY === 'string') {
			if (centerY.endsWith('vh')) {
				const vhValue = parseFloat(centerY);
				centerYPixels = (window.innerHeight * vhValue) / 100;
			} else if (centerY.endsWith('vw')) {
				const vwValue = parseFloat(centerY);
				centerYPixels = (window.innerWidth * vwValue) / 100;
			} else if (centerY.endsWith('%')) {
				const percentValue = parseFloat(centerY);
				centerYPixels = (window.innerHeight * percentValue) / 100;
			} else {
				centerYPixels = parseFloat(centerY) || position.current.y + dimensions.current.height / 2;
			}
		} else {
			centerYPixels = centerY;
		}

		const topLeftX = centerXPixels - dimensions.current.width / 2;
		const topLeftY = centerYPixels - dimensions.current.height / 2;

		// Use the existing moveWindow function to handle bounds checking and animation
		moveWindow(topLeftX, topLeftY, animate);
	}

	// Resize window to specific dimensions
	function resizeWindow(width: number, height: number, animate = animatePosition) {
		width = Math.max(width, minWidth);
		height = Math.max(height, minHeight);

		if (animate) {
			dimensions.set({ width, height });
		} else {
			dimensions.set({ width, height }, { hard: true });
		}
	}

	// Handle starting drag
	function startDrag(event: MouseEvent) {
		if (!draggable || event.target !== headerElement) return;

		isDragging = true;
		dragOffset.x = event.clientX - position.current.x;
		dragOffset.y = event.clientY - position.current.y;

		event.preventDefault();
	}

	// Handle moving during drag
	function handleDrag(event: MouseEvent) {
		if (!isDragging) return;

		const newX = event.clientX - dragOffset.x;
		const newY = event.clientY - dragOffset.y;

		// Keep window within viewport bounds
		const maxX = window.innerWidth - dimensions.current.width;
		const maxY = window.innerHeight - dimensions.current.height;

		position.set({
			x: Math.min(Math.max(0, newX), maxX),
			y: Math.min(Math.max(0, newY), maxY)
		});
	}

	// Handle starting resize
	function startResize(event: MouseEvent, dirX: number, dirY: number) {
		if (!resizable) return;

		isResizing = true;
		resizeDirection = { x: dirX, y: dirY };
		dragOffset.x = event.clientX;
		dragOffset.y = event.clientY;

		event.preventDefault();
		event.stopPropagation();
	}

	// Handle resizing
	function handleResize(event: MouseEvent) {
		if (!isResizing) return;

		const deltaX = event.clientX - dragOffset.x;
		const deltaY = event.clientY - dragOffset.y;

		let newWidth = dimensions.current.width;
		let newHeight = dimensions.current.height;
		let newX = position.current.x;
		let newY = position.current.y;

		// Adjust dimensions based on resize direction
		if (resizeDirection.x !== 0) {
			if (resizeDirection.x > 0) {
				// Resize from right
				newWidth = Math.max(dimensions.current.width + deltaX, minWidth);
			} else {
				// Resize from left
				const widthChange = Math.min(deltaX, dimensions.current.width - minWidth);
				newWidth = Math.max(dimensions.current.width - widthChange, minWidth);
				newX = position.current.x + widthChange;
			}
		}

		if (resizeDirection.y !== 0) {
			if (resizeDirection.y > 0) {
				// Resize from bottom
				newHeight = Math.max(dimensions.current.height + deltaY, minHeight);
			} else {
				// Resize from top
				const heightChange = Math.min(deltaY, dimensions.current.height - minHeight);
				newHeight = Math.max(dimensions.current.height - heightChange, minHeight);
				newY = position.current.y + heightChange;
			}
		}

		position.set({ x: newX, y: newY });
		dimensions.set({ width: newWidth, height: newHeight });

		// Update drag offset
		dragOffset.x = event.clientX;
		dragOffset.y = event.clientY;
	}

	function endDragOrResize() {
		isDragging = false;
		isResizing = false;
	}

	function closeWindow() {
		open = false;
		removeGlow();
		guide_index = 0;
		onClose();
	}

	function removeGlow() {
		if (guide_content) {
			for (const id of guide_content[guide_index].make_glow || []) {
				const element = document.getElementById(id);
				if (element) {
					element.classList.remove('glowing');
				}
			}
		}
	}

	function _nextStep() {
		removeGlow();
		guide_index++;
		if (autoResize) {
			measureAndResize();
		}

		setTimeout(() => {
			slow_mode--;
		}, 1000);
	}

	function nextStep() {
		if (guide_content && guide_index < guide_content.length - 1) {
			if (slow_mode) {
				return;
			} else {
				_nextStep();
				slow_mode++;
			}
		}
	}

	function prevStep() {
		if (guide_content && guide_index > 0) {
			removeGlow();
			guide_index--;
			if (autoResize) {
				measureAndResize();
			}
		}
	}

	async function measureAndResize() {
		if (!autoResize || !contentElement || !windowElement) return;

		await tick(); // Wait for DOM to update with new content

		// Create a measuring container if it doesn't exist
		if (!measuringElement) {
			measuringElement = document.createElement('div');
			measuringElement.className = 'measuring-container';
			measuringElement.style.position = 'fixed'; // Change from 'absolute' to 'fixed'
			measuringElement.style.visibility = 'hidden';
			measuringElement.style.pointerEvents = 'none';
			measuringElement.style.overflowY = 'hidden';
			measuringElement.style.width = `${dimensions.current.width}px`;
			measuringElement.style.padding = getComputedStyle(contentElement).padding;
			measuringElement.style.zIndex = '-9999'; // Add negative z-index
			measuringElement.style.left = '0'; // Position it off-screen
			measuringElement.style.top = '0';
			document.body.appendChild(measuringElement);
		}

		// Clone the content
		const headerHeight = headerElement ? headerElement.offsetHeight : 0;
		const navigationHeight = guide_content && guide_content.length > 1 ? 60 : 0;
		const contentClone = contentElement.cloneNode(true);

		// Reset the measuring element
		measuringElement.innerHTML = '';
		measuringElement.style.width = `${dimensions.current.width}px`;
		measuringElement.appendChild(contentClone);

		// Measure the actual rendered content height
		await tick(); // Wait for clone to render
		const contentHeight = measuringElement.scrollHeight;

		// Calculate total height needed
		const totalHeight = contentHeight + headerHeight + navigationHeight - 40;

		// Apply minimum constraints
		const newHeight = Math.max(totalHeight, minHeight);

		// Only update if height actually changed by more than a threshold
		if (Math.abs(dimensions.current.height - newHeight) > 5) {
			// Use current width and new calculated height
			resizeWindow(dimensions.current.width, newHeight);
		}

		// Clean up
		if (measuringElement.parentNode) {
			measuringElement.innerHTML = '';

			if (!autoResize) {
				cleanupMeasuringElement();
			}
		}

		adjustPosition();
	}

	// Check if window is out of bounds after resize
	function adjustPosition() {
		const maxX = window.innerWidth - dimensions.current.width;
		const maxY = window.innerHeight - dimensions.current.height;

		if (position.current.x > maxX || position.current.y > maxY) {
			position.set({
				x: Math.min(position.current.x, maxX),
				y: Math.min(position.current.y, maxY)
			});
		}
	}

	// Clean up resources
	function cleanupMeasuringElement() {
		if (measuringElement && measuringElement.parentNode) {
			document.body.removeChild(measuringElement);
			measuringElement = null;
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (isDragging) {
			handleDrag(event);
		} else if (isResizing) {
			handleResize(event);
		}
	}

	function handleMouseUp() {
		endDragOrResize();
	}

	function handleWindowResize() {
		tick().then(adjustPosition);
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('resize', handleWindowResize);

		if (autoResize) {
			tick().then(() => {
				setTimeout(measureAndResize, 50);
			});
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('resize', handleWindowResize);
			cleanupMeasuringElement();
		};
	});

	$effect(() => {
		dimensions.current;
		adjustPosition();
	});

	// autoresizing for guide_content
	$effect(() => {
		if (autoResize && guide_content && open) {
			tick().then(() => {
				setTimeout(measureAndResize, 50);
			});
		}
	});

	// effect for guide_content proceed_on
	$effect(() => {
		if (guide_content && guide_content[guide_index].proceed_on) {
			// @ts-expect-error
			const unsubscribe = guide_content[guide_index].proceed_on.subscribe((value) => {
				if (value !== (guide_content[guide_index].require_false ?? false) || !open) {
					nextStep();
				}
			});
			return () => {
				unsubscribe();
			};
		}
	});
	// effect for guide_content move_to
	$effect(() => {
		if (!guide_content) {
			return;
		}

		const move_to = guide_content[guide_index].move_to;
		if (move_to) {
			moveWindowCenter(move_to.x, move_to.y, true);
		}
	});
	// effect for guide_content make_glow
	$effect(() => {
		if (!guide_content) {
			return;
		}

		const make_glow = guide_content[guide_index].make_glow;
		if (make_glow) {
			for (const id of make_glow) {
				setTimeout(() => {
					const element = document.getElementById(id);
					if (element) {
						element.classList.add('glowing');
					} else {
						console.error('Element not found:', id);
					}
				}, 500);
			}
		}
	});
	// effect for guide_content preload
	$effect(() => {
		if (!guide_content) {
			return;
		}

		const preload = guide_content[guide_index].preload;
		if (preload) {
			for (const url of preload) {
				(async () => {
					document.getElementById('preload-img')?.setAttribute('src', url);
				})();
			}
		}
	});

	$inspect('OPEN', open);
</script>

{#if open}
	<div
		class="floating-window"
		bind:this={windowElement}
		style="
			left: {position.current.x}px;
			top: {position.current.y}px;
			width: {dimensions.current.width}px;
			height: {dimensions.current.height}px;
		"
	>
		<div class="window-header" bind:this={headerElement} onmousedown={startDrag}>
			<h2 class="window-title">{title}</h2>
			{#if closable}
				<button class="close-button" onclick={closeWindow} aria-label="Close window">✕</button>
			{/if}
		</div>

		<div class="window-content" bind:this={contentElement}>
			{#if guide_content}
				{#if guide_content[guide_index].snippet}
					{@render guide_content[guide_index].snippet()}
				{:else}
					<p>{guide_content[guide_index].text}</p>
				{/if}
			{:else}
				{@render children()}
			{/if}
		</div>

		{#if guide_content && guide_content.length > 1}
			<div class="guide-navigation">
				{#if guide_index !== 0 && guide_content[guide_index].proceed_on === undefined}
					<button
						class="guide-nav-button"
						onclick={prevStep}
						disabled={guide_index === 0 || guide_content[guide_index].proceed_on !== undefined}
						aria-label="Previous step"
					>
						Previous
					</button>
				{/if}
				<span class="guide-position">{guide_index + 1} / {guide_content.length}</span>
				<button
					class="guide-nav-button"
					onclick={nextStep}
					disabled={guide_content[guide_index].proceed_on !== undefined ||
						guide_index === guide_content.length - 1}
					aria-label="Next step"
				>
					Next
				</button>
			</div>
		{/if}

		{#if resizable}
			<!-- Resize handles -->
			<div class="resize-handle resize-n" onmousedown={(e) => startResize(e, 0, -1)}></div>
			<div class="resize-handle resize-e" onmousedown={(e) => startResize(e, 1, 0)}></div>
			<div class="resize-handle resize-s" onmousedown={(e) => startResize(e, 0, 1)}></div>
			<div class="resize-handle resize-w" onmousedown={(e) => startResize(e, -1, 0)}></div>
			<div class="resize-handle resize-ne" onmousedown={(e) => startResize(e, 1, -1)}></div>
			<div class="resize-handle resize-se" onmousedown={(e) => startResize(e, 1, 1)}></div>
			<div class="resize-handle resize-sw" onmousedown={(e) => startResize(e, -1, 1)}></div>
			<div class="resize-handle resize-nw" onmousedown={(e) => startResize(e, -1, -1)}></div>
		{/if}
	</div>
{/if}

<img id="preload-img" src="" style="display: none;" alt="Preloaded" />

<style>
	.floating-window {
		position: fixed;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-color);
		color: var(--text-color);
		border-radius: 0.7rem;
		box-shadow: 0 0.2rem 1rem var(--shadow-color);
		overflow: hidden;
		z-index: 2000;
		transition: box-shadow 0.2s ease;
		min-width: 200px;
		min-height: 150px;
	}

	.floating-window:hover {
		box-shadow: 0 0.3rem 1.5rem var(--shadow-color);
	}

	.window-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.2rem;
		background-color: var(--bg-color);
		border-bottom: 0.1rem solid var(--border-color);
		cursor: move;
		user-select: none;
	}

	.window-title {
		margin: 0;
		font-size: 1.25rem;
		color: var(--title-color);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color);
	}

	.close-button:hover {
		background-color: var(--hover-bg);
	}

	.window-content {
		flex: 1;
		overflow: auto;
		padding: 1.25rem;
		overscroll-behavior: contain;
	}

	.guide-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1.25rem;
		border-top: 0.1rem solid var(--border-color);
	}

	.guide-nav-button {
		padding: 0.5rem 1rem;
		background-color: var(--button-bg, #f0f0f0);
		border: 1px solid var(--button-border, #ccc);
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
	}

	.guide-nav-button:hover:not(:disabled) {
		background-color: var(--button-hover-bg, #e0e0e0);
	}

	.guide-nav-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.guide-position {
		font-size: 0.9rem;
		color: var(--text-secondary, #666);
	}

	.resize-handle {
		position: absolute;
		background-color: transparent;
	}

	.resize-n {
		top: -4px;
		left: 8px;
		right: 8px;
		height: 8px;
		cursor: n-resize;
	}

	.resize-e {
		top: 8px;
		right: -4px;
		bottom: 8px;
		width: 8px;
		cursor: e-resize;
	}

	.resize-s {
		bottom: -4px;
		left: 8px;
		right: 8px;
		height: 8px;
		cursor: s-resize;
	}

	.resize-w {
		top: 8px;
		left: -4px;
		bottom: 8px;
		width: 8px;
		cursor: w-resize;
	}

	.resize-ne {
		top: -4px;
		right: -4px;
		width: 12px;
		height: 12px;
		cursor: ne-resize;
	}

	.resize-se {
		bottom: -4px;
		right: -4px;
		width: 12px;
		height: 12px;
		cursor: se-resize;
	}

	.resize-sw {
		bottom: -4px;
		left: -4px;
		width: 12px;
		height: 12px;
		cursor: sw-resize;
	}

	.resize-nw {
		top: -4px;
		left: -4px;
		width: 12px;
		height: 12px;
		cursor: nw-resize;
	}
</style>
