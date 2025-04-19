<script lang="ts">
	import { guide_content, guide_open, guide_title } from '$lib/scripts/stores';
	import { GUIDE_GEAR_ELEMENT } from '../InteractiveGuide.svelte';
</script>

<div class="main-page">
	<h1>What is this?</h1>
	<p>
		Rim EOS, or Rim's Easy Optimizer for Stats, is a webapp for optimizing your stats. Depending on
		your loadout (matrix, weapon, trait, relics), team composition (solo, 4 player, 8 player) and
		enemies, certain stats may have a bigger impact than others. This webapp should help you decide
		on what changes to make.
	</p>

	<h1>Getting started</h1>
	<p>Depending on what you want to optimize: (you may click on the blocks)</p>

	<button
		class="image border helper"
		onclick={() => {
			$guide_title = 'Optimizing gears';
			$guide_open = true;
			$guide_content = [...GUIDE_GEAR_ELEMENT];
		}}
	>
		<h2>Optimizing gears for a specific element</h2>
		<ol>
			<li>Upload your equipped gears</li>
			<li>
				Setup your weapons, matrices, traits and relics (traits and relics not implemented yet)
			</li>
			<li>Upload your stats, and adjust to get base stats</li>
			<li>Sort gear by multiplier percent</li>
			<li>Replace the worst gear</li>
		</ol>
	</button>
</div>

<style>
	.main-page {
		padding: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
	}

	button.helper {
		text-align: left;
		height: fit-content;
		font-size: medium;
		padding: 1rem;
	}

	@media (max-width: 600px) {
		button.helper {
			padding: 1rem;
			align-items: center;
			justify-content: center;
			flex-direction: column;
		}
	}
</style>
