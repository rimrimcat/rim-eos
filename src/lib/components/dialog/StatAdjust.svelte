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
				<div class="stat-content">
					<div class="stat-icon">
						<img src={attribute.icon} alt={attribute.name + ' icon'} />
					</div>
					<div class="stat-info">
						<div class="stat-name">{attribute.name}</div>
						<div class="stat-value-text">{attribute.value}</div>
					</div>
				</div>
			{/each}
		</FlexGrid>
	</div>
</Dialog>

<style>
	.stat-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: none;
		filter: invert(75%);
	}

	.stat-info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

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
