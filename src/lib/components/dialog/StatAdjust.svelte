<script lang="ts">
	import type { AttributeItem } from '$lib/scripts/stats';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	let { open = $bindable(false), raw_attributes = [] as AttributeItem[] } = $props();

	// Filter only attack stats from raw_attributes
	let attack_stats = $derived(
		raw_attributes.filter((attr) => {
			return [
				'Physical Attack',
				'Flame Attack',
				'Frost Attack',
				'Volt Attack',
				'Altered Attack'
			].includes(attr.name);
		})
	);
</script>

<Dialog title="Stat Adjustment" bind:open>
	<div style="padding: 0.5rem;">
		<FlexGrid
			horizontal_gap="0.9rem"
			vertical_gap="1rem"
			min_cols={1}
			max_cols={1}
			prefer_divisible={false}
		>
			{#each attack_stats as attribute}
				<div class="item-flex">
					<div class="attribute-icon">
						<img src={attribute.icon} alt={attribute.name + ' icon'} />
					</div>
					<div class="vertical-left">
						<div class="stat-name">{attribute.name}</div>
						<div class="stat-value-text">{attribute.value}</div>
					</div>
				</div>
			{/each}
		</FlexGrid>
	</div>

	<div></div>
</Dialog>

<style>
	.stat-name {
		font-size: 1rem;
		font-weight: bold;
		padding-left: 0.4rem;
		color: var(--text-color);
	}

	.stat-value-text {
		font-size: 1.25rem;
		padding-left: 0.4rem;
	}
</style>
