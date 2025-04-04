<script lang="ts">
	import { ArrowRightToLine, CircleHelp, Menu, ToggleLeft, ToggleRight } from '@lucide/svelte';

	import {
		ActionType,
		type ComponentAction,
		type SliderAction,
		type ToggleAction
	} from '$lib/scripts/navMetadata.svelte.ts';

	let { actions = [] as ComponentAction[], bound_objects = $bindable({}) } = $props();

	let isCollapsed = $state(false);
	let scrollY = $state(0);

	const sliderCount = actions.filter((action) => action.type === ActionType.SLIDER).length;

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function handleToggle(tool: ToggleAction) {
		bound_objects[tool.id] = !bound_objects[tool.id];
		if (tool.callback) {
			tool.callback();
		}
	}

	function handleSliderChange(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		tool: SliderAction
	) {
		const value = parseFloat(event.currentTarget.value);
		bound_objects[tool.id] = value;

		if (tool.callback) {
			tool.callback();
		}
	}
</script>

<svelte:window bind:scrollY />
<div
	class="nav-tools"
	class:collapsed={isCollapsed}
	style="translate: 0px {scrollY}px; height:{5.5 +
		3 * (actions.length - sliderCount) +
		5 * sliderCount}rem"
>
	<div class="tools-header">
		<div class="header-content">
			{#if !isCollapsed}
				<span>Actions</span>
			{/if}
		</div>
		<button class="collapse-toggle" onclick={toggleCollapse}>
			{#if isCollapsed}
				<Menu />
			{:else}
				<ArrowRightToLine />
			{/if}
		</button>
	</div>
	<div class="tools-list">
		{#each actions as action}
			{#if action.type === ActionType.TOGGLE}
				<button class="toggle-button" onclick={() => handleToggle(action)}>
					<div class="tool-item toggle-item" title={isCollapsed ? action.label : 'Unset'}>
						<div class="tool-icon">
							{#if bound_objects[action.id]}
								<ToggleRight />
							{:else}
								<ToggleLeft />
							{/if}
						</div>
						{#if !isCollapsed}
							<span class="tool-label">{action.label}</span>
						{/if}
					</div>
				</button>
			{:else if action.type === ActionType.SLIDER}
				<div class="tool-item slider-item" title={isCollapsed ? action.label : 'Unset'}>
					<div class="slider-icon-text">
						<div class="tool-icon">
							{#if action.lucide}
								<action.lucide />
							{:else}
								<CircleHelp />
							{/if}
						</div>
						{#if !isCollapsed}
							<span class="tool-label">{action.label}</span>
						{/if}
					</div>
					{#if !isCollapsed}
						<div class="slider-controls">
							<span class="slider-value">{bound_objects[action.id]}</span>
							<input
								type="range"
								min={action.minValue ?? 0}
								max={action.maxValue ?? 100}
								step={action.stepSize ?? 1}
								value={bound_objects[action.id]}
								oninput={(e) => handleSliderChange(e, action)}
								class="slider-input"
							/>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Button -->
				<button
					class="tool-item button-item"
					title={isCollapsed ? action.label : 'Unset'}
					onclick={action.callback ?? (() => {})}
				>
					<div class="tool-icon">
						{#if action.lucide}
							<action.lucide />
						{:else}
							<CircleHelp />
						{/if}
					</div>
					{#if !isCollapsed}
						<span class="tool-label">{action.label}</span>
					{/if}
				</button>
			{/if}
		{/each}
	</div>
</div>

<style>
	.nav-tools {
		position: sticky;
		top: 1rem;
		width: 13.75rem;
		margin-right: 0.5rem;
		background-color: var(--bg-color);
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		border-radius: 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
	}

	.nav-tools.collapsed {
		position: sticky;
		width: 3.75rem;
		background-color: var(--bg-color);
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition:
			width 0.3s ease,
			translate 0.2s ease;
		border-radius: 1rem;
		font-size: medium;
	}

	.tools-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.8rem;
		border-bottom: 1px solid var(--border-color);
		font-size: 1.2rem;
	}

	.header-content {
		display: flex;
		flex: 1;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2rem;
		color: var(--title-color);
	}

	.collapse-toggle {
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
	}

	.collapse-toggle:hover {
		background-color: var(--hover-bg);
	}

	.tools-list {
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
	}

	.tool-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 4px;
		text-align: left;
	}

	.button-item:hover {
		background-color: var(--hover-bg);
		color: var(--text-color);
	}

	.tool-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
	}

	.tool-label {
		flex: 1;
		margin-left: 1rem;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		transition: opacity 0.3s ease;
	}

	/* Toggle Styles */
	.toggle-item {
		justify-content: space-between;
	}

	.toggle-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.toggle-track {
		display: inline-block;
		width: 2.5rem;
		height: 1.25rem;
		background-color: var(--border-color);
		border-radius: 1rem;
		position: relative;
		transition: background-color 0.3s ease;
	}

	.toggle-track.active {
		background-color: var(--primary-color, #3b82f6);
	}

	.toggle-thumb {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1rem;
		height: 1rem;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.toggle-track.active .toggle-thumb {
		transform: translateX(1.25rem);
	}

	.icon-toggle-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	/* Slider Styles */
	.slider-item {
		flex-direction: column;
		align-items: flex-start;
	}

	.slider-icon-text {
		display: flex;
		align-items: center;
		flex: 1;
		max-width: 100%;
		width: 100%;
		font-size: small;
	}

	.slider-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-left: 1rem;
	}

	.slider-controls {
		display: flex;
		align-items: center;
		width: 100%;
		margin-top: 0.5rem;
	}

	.slider-value {
		min-width: 2rem;
		text-align: center;
		font-size: 0.875rem;
		margin-right: 0.5rem;
	}

	.slider-input {
		flex: 1;
		-webkit-appearance: none;
		height: 0.5rem;
		border-radius: 0.25rem;
		background: var(--border-color);
		outline: none;
		width: 75%;
	}

	.slider-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--primary-color, #3b82f6);
		cursor: pointer;
	}

	.slider-input::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--primary-color, #3b82f6);
		cursor: pointer;
		border: none;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.tool-collapsed-action {
		background: none;
		border: none;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}
</style>
