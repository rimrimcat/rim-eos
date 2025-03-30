<script lang="ts">
	// Imports
	import { onMount } from 'svelte';
	import { Minimize2, Maximize2 } from '@lucide/svelte';

	// Types
	type PositionXY = {
		x: number;
		y: number;
	};

	type Rectangle = {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	// Properties
	export let title = 'Unnamed Component';
	export let initialX = 100;
	export let initialY = 100;
	export let initialWidth = 300;
	export let initialHeight = 200;
	export let minWidth = 200;
	export let minHeight = 100;
	export let startMinimized = false;
	export let initialMinimizedX = 50;
	export let initialMinimizedY = 50;
	export let minimizedWidth = 250;
	export let minimizedHeight = 35;

	// Constants
	const ICON_SIZE = 20;
	const ICON_COLOR = '#444';

	// Constant Alias
	const ACTION_DRAG = 'drag' as 'drag';
	const ACTION_RESIZE = 'resize' as 'resize';

	// State
	let x = initialX;
	let y = initialY;
	let width = initialWidth;
	let height = initialHeight;
	let isDragging = false;
	let isResizing = false;
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let resizeDirection = { x: 0, y: 0 };
	let minimized = startMinimized;
	let previousState: Rectangle | null = null;
	let minimizedState: PositionXY | null = null;
	let preventTextSelection = false;

	// Element references
	let container;

	function handleMouseDown(event, action, direction = { x: 0, y: 0 }) {
		if (action === 'drag') {
			isDragging = true;
			dragOffsetX = event.clientX - x;
			dragOffsetY = event.clientY - y;
			preventTextSelection = true;
		} else if (action === 'resize') {
			isResizing = true;
			resizeDirection = direction;
			preventTextSelection = true;
		}
	}

	function handleMouseMove(event) {
		if (isDragging) {
			x = event.clientX - dragOffsetX;
			y = event.clientY - dragOffsetY;
		} else if (isResizing) {
			if (resizeDirection.x !== 0) {
				const newWidth =
					resizeDirection.x > 0
						? width + (event.clientX - (x + width))
						: width + (x - event.clientX);

				if (newWidth >= minWidth) {
					if (resizeDirection.x < 0) {
						x = event.clientX;
					}
					width = newWidth;
				}
			}

			if (resizeDirection.y !== 0) {
				const newHeight =
					resizeDirection.y > 0
						? height + (event.clientY - (y + height))
						: height + (y - event.clientY);

				if (newHeight >= minHeight) {
					if (resizeDirection.y < 0) {
						y = event.clientY;
					}
					height = newHeight;
				}
			}
		}
	}

	function handleMouseUp() {
		if (isDragging && minimized) {
			// If minimized and dragged, store current position as minimizedState
			minimizedState = { x, y };
		}

		isDragging = false;
		isResizing = false;
		preventTextSelection = false;
	}

	function toggleMinimize() {
		if (minimized) {
			// Restore maximized state
			if (previousState) {
				x = previousState.x;
				y = previousState.y;
				width = previousState.width;
				height = previousState.height;
			}
			minimized = false;
		} else {
			// Store current maximized state
			previousState = { x, y, width, height };

			// Use stored minimized position if available, otherwise default position
			if (minimizedState) {
				x = minimizedState.x;
				y = minimizedState.y;
			} else {
				// Default minimized position (centered at bottom)
				const windowWidth = window.innerWidth;
				x = initialMinimizedX;
				y = initialMinimizedY;
				minimizedState = { x, y };
			}

			// Set minimized dimensions
			width = minimizedWidth;
			height = minimizedHeight;
			minimized = true;
		}
	}

	onMount(() => {
		// Initialize states if starting minimized
		if (startMinimized && !previousState) {
			// Store initial values as previous (maximized) state
			previousState = {
				x: initialX,
				y: initialY,
				width: initialWidth,
				height: initialHeight
			};

			// Set initial minimized state
			minimizedState = { x: initialMinimizedX, y: initialMinimizedY };

			// Apply minimized dimensions
			x = initialMinimizedX;
			y = initialMinimizedY;
			width = minimizedWidth;
			height = minimizedHeight;
		}

		const handleGlobalMouseMove = (event) => {
			if (isDragging || isResizing) {
				handleMouseMove(event);
			}
		};

		const handleGlobalMouseUp = () => {
			handleMouseUp();
		};

		window.addEventListener('mousemove', handleGlobalMouseMove);
		window.addEventListener('mouseup', handleGlobalMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleGlobalMouseMove);
			window.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	});
</script>

<div
	bind:this={container}
	class="container {preventTextSelection ? 'no-select' : ''}"
	style="left: {x}px; top: {y}px; width: {width}px; height: {height}px;"
>
	<div class="header" on:mousedown={(e) => handleMouseDown(e, ACTION_DRAG)}>
		<span class="title">{title}</span>
		<div class="controls">
			<button
				class="control-button"
				on:click={toggleMinimize}
				aria-label={minimized ? 'Maximize' : 'Minimize'}
			>
				{#if minimized}
					<Maximize2 size={ICON_SIZE} color={ICON_COLOR} />
				{:else}
					<Minimize2 size={ICON_SIZE} color={ICON_COLOR} />
				{/if}
			</button>
		</div>
	</div>

	{#if !minimized}
		<div class="content">
			<slot>Place your content here</slot>
		</div>

		<!-- Resize handles -->
		<div
			class="resize-handle resize-e"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: 1, y: 0 })}
		></div>
		<div
			class="resize-handle resize-s"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: 0, y: 1 })}
		></div>
		<div
			class="resize-handle resize-se"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: 1, y: 1 })}
		></div>
		<div
			class="resize-handle resize-sw"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: -1, y: 1 })}
		></div>
		<div
			class="resize-handle resize-ne"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: 1, y: -1 })}
		></div>
		<div
			class="resize-handle resize-nw"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: -1, y: -1 })}
		></div>
		<div
			class="resize-handle resize-n"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: 0, y: -1 })}
		></div>
		<div
			class="resize-handle resize-w"
			on:mousedown={(e) => handleMouseDown(e, ACTION_RESIZE, { x: -1, y: 0 })}
		></div>
	{/if}
</div>

<style>
	.container {
		position: absolute;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: box-shadow 0.2s ease;
	}

	.container:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background-color: #f0f0f0;
		border-bottom: 1px solid #ddd;
		cursor: move;
		user-select: none;
	}

	.title {
		font-weight: bold;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.controls {
		display: flex;
	}

	.control-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 4px;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.control-button:hover {
		color: #000;
	}

	.content {
		flex: 1;
		padding: 12px;
		overflow: auto;
	}

	.resize-handle {
		position: absolute;
		background-color: transparent;
	}

	.resize-e {
		cursor: e-resize;
		width: 8px;
		top: 0;
		right: 0;
		bottom: 0;
	}

	.resize-s {
		cursor: s-resize;
		height: 8px;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.resize-se {
		cursor: se-resize;
		width: 12px;
		height: 12px;
		right: 0;
		bottom: 0;
	}

	.resize-sw {
		cursor: sw-resize;
		width: 12px;
		height: 12px;
		left: 0;
		bottom: 0;
	}

	.resize-ne {
		cursor: ne-resize;
		width: 12px;
		height: 12px;
		right: 0;
		top: 0;
	}

	.resize-nw {
		cursor: nw-resize;
		width: 12px;
		height: 12px;
		left: 0;
		top: 0;
	}

	.resize-n {
		cursor: n-resize;
		height: 8px;
		left: 0;
		right: 0;
		top: 0;
	}

	.resize-w {
		cursor: w-resize;
		width: 8px;
		top: 0;
		left: 0;
		bottom: 0;
	}

	.no-select {
		user-select: none;
	}
</style>
