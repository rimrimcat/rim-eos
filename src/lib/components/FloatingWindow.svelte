<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Spring } from 'svelte/motion';

	// Props with defaults
	let {
		title = $bindable('Floating Window'),
		open = $bindable(true),
		initialWidth = 400,
		initialHeight = 300,
		minWidth = 200,
		minHeight = 150,
		initialX = window.innerWidth / 2 - 200,
		initialY = window.innerHeight / 2 - 150,
		resizable = true,
		draggable = true,
		closable = true,
		animatePosition = true,
		onClose = () => {},
		children
	} = $props();

	// State variables
	let windowElement: HTMLElement | null = $state(null);
	let headerElement: HTMLElement | null = $state(null);
	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let resizeDirection = $state({ x: 0, y: 0 });

	// Use spring animation for smooth position changes
	let position = new Spring({ x: initialX, y: initialY }, { stiffness: 0.1, damping: 0.6 });
	let dimensions = new Spring(
		{ width: initialWidth, height: initialHeight },
		{ stiffness: 0.1, damping: 0.6 }
	);

	// Move window to a specific position (useful for guide functionality)
	function moveWindow(x: number, y: number, animate = animatePosition) {
		if (animate) {
			position.set({ x, y });
		} else {
			position.set({ x, y }, { hard: true });
		}
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

		// Update position and dimensions
		position.set({ x: newX, y: newY });
		dimensions.set({ width: newWidth, height: newHeight });

		// Update drag offset
		dragOffset.x = event.clientX;
		dragOffset.y = event.clientY;
	}

	// End drag/resize operations
	function endDragOrResize() {
		isDragging = false;
		isResizing = false;
	}

	function closeWindow() {
		open = false;
		onClose();
	}

	// Check if window is out of bounds after resize
	function adjustPositionIfNeeded() {
		const maxX = window.innerWidth - dimensions.current.width;
		const maxY = window.innerHeight - dimensions.current.height;

		if (position.current.x > maxX || position.current.y > maxY) {
			position.set({
				x: Math.min(position.current.x, maxX),
				y: Math.min(position.current.y, maxY)
			});
		}
	}

	// Set up event listeners
	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('resize', handleWindowResize);
		};
	});

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
		tick().then(adjustPositionIfNeeded);
	}

	// Expose methods to parent
	function exportMethods() {
		return {
			move: moveWindow,
			resize: resizeWindow,
			close: closeWindow
		};
	}

	// Bind to 'this' to make methods accessible
	let thisComponent = exportMethods();

	$effect(() => {
		dimensions.current;
		adjustPositionIfNeeded();
	});
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

		<div class="window-content">
			{@render children()}
		</div>

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
		z-index: 1000;
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

	/* Resize handles */
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
