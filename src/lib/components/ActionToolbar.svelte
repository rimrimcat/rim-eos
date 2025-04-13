<script lang="ts">
	import {
		ActionType,
		type ComponentAction,
		type SliderAction,
		type ToggleAction
	} from '$lib/scripts/nav-metadata';
	import { ArrowRightToLine, CircleHelp, Menu, ToggleLeft, ToggleRight } from '@lucide/svelte';
	import { scrollY } from './App.svelte';

	let {
		actions = [] as ComponentAction[],
		bound_objects = $bindable({}),
		is_mobile: is_mobile = $bindable(false)
	} = $props();

	let is_collapsed = $state(true);

	const SLIDER_COUNT = actions.filter((action) => action.type === ActionType.SLIDER).length;

	function toggleCollapse() {
		is_collapsed = !is_collapsed;
	}

	function handleToggle(tool: ToggleAction) {
		if (tool.callback) {
			tool.callback();
		} else {
			console.error('No callback for toggle action', tool.id);
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

<div
	class="nav-tools"
	class:collapsed={is_collapsed}
	class:mobile={is_mobile}
	style="height:{5.5 +
		3 * (actions.length - SLIDER_COUNT) +
		5 * SLIDER_COUNT}rem; translate: 0 {$scrollY}px;"
>
	<div class="tools-header">
		<div class="header-content">
			<span class="header-text" class:collapsed={is_collapsed}>{is_collapsed ? '' : 'Actions'}</span
			>
		</div>
		<button class="collapse-toggle" onclick={toggleCollapse}>
			{#if is_collapsed}
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
					<div class="tool-item toggle-item" title={is_collapsed ? action.label : 'Unset'}>
						<div class="tool-icon">
							{#if bound_objects[action.id]}
								{#if action.lucide_on}
									<action.lucide_on />
								{:else}
									<ToggleRight fill="darkgreen" />
								{/if}
							{:else if action.lucide_off}
								<action.lucide_off />
							{:else}
								<ToggleLeft fill="brown" />
							{/if}
						</div>
						{#if !is_collapsed}
							<span class="tool-label">{action.label}</span>
						{/if}
					</div>
				</button>
			{:else if action.type === ActionType.SLIDER}
				<div class="tool-item slider-item" title={is_collapsed ? action.label : 'Unset'}>
					<div class="slider-icon-text">
						<div class="tool-icon">
							{#if action.lucide}
								<action.lucide />
							{:else}
								<CircleHelp />
							{/if}
						</div>
						<span class="tool-label" class:collapsed={is_collapsed}>{action.label}</span>
					</div>
					{#if !is_collapsed}
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
					title={is_collapsed ? action.label : 'Unset'}
					onclick={action.callback ?? (() => {})}
				>
					<div class="tool-icon">
						{#if action.lucide}
							<action.lucide />
						{:else}
							<CircleHelp />
						{/if}
					</div>
					<span class="tool-label" class:collapsed={is_collapsed}>{action.label}</span>
				</button>
			{/if}
		{/each}
	</div>
</div>

<style>
	.nav-tools {
		position: fixed;
		top: 5rem;
		width: 13.75rem;
		margin-right: 0.5rem;
		right: 0.5rem;
		background-color: var(--bg-color);
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition:
			width 0.3s ease-in,
			translate 0.2s ease-in;
		border-radius: 1rem;
		box-shadow: 0 4px 8px var(--shadow-color);
	}

	.nav-tools.mobile {
		top: 5rem;
	}

	.nav-tools.collapsed {
		position: fixed;
		width: 3.75rem;
		background-color: var(--bg-color);
		display: flex;
		flex-direction: column;
		color: var(--text-color);
		transition:
			width 0.3s ease-out,
			translate 0.2s ease-out;
		border-radius: 1rem;
		font-size: medium;
	}

	.tools-header {
		display: flex;
		align-items: center;
		position: relative;
		height: 3.8rem;
		border-bottom: 1px solid var(--border-color);
		overflow: hidden;
	}

	.header-content {
		position: absolute;
		left: 0;
		right: 3.8rem;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		transition: opacity 0.25s ease;
	}

	.header-text {
		font-weight: bold;
		font-size: 1.2rem;
		color: var(--title-color);
		white-space: nowrap;
		transition:
			transform 0.3s ease,
			opacity 0.25s ease;
	}

	.header-text.collapsed {
		opacity: 0;
		transform: translateX(-20px);
	}

	.collapse-toggle {
		position: absolute;
		right: 0.8rem;
		top: 0.8rem;
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		z-index: 10;
		border-radius: 0.5rem;
		transition: background-color 0.2s ease;
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
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.tool-label.collapsed {
		opacity: 0;
		transform: translateX(-20px);
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
</style>
