<script lang="ts">
	import type { GearView, UserGear } from '$lib/scripts/gears';
	import { ShirtIcon, Trash2Icon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';

	let {
		open = $bindable(false),
		gear = $bindable() as GearView | null,
		user_gears = $bindable() as UserGear[],
		gear_views = $bindable() as GearView[],
		isMobile = $bindable(false),
		onRemoveGear = (id: number) => {},
		onEquipGear = (id: number) => {}
	} = $props();

	const GRID_ORDERING = [
		{ position: 'top-left', index: 0 },
		{ position: 'top-right', index: 2 },
		{ position: 'bottom-left', index: 1 },
		{ position: 'bottom-right', index: 3 }
	];

	let date = $derived(new Date(user_gears[gear?.id ?? 0]?.dateAdded ?? 0));

	// get relative date
	function getRelativeDate(): string {
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (diffDays > 0) {
			return `${diffDays} days ago`;
		}

		const diffHours = Math.floor(diff / (1000 * 60 * 60));
		if (diffHours > 0) {
			return `${diffHours} hours ago`;
		}

		const diffMinutes = Math.floor(diff / (1000 * 60));
		if (diffMinutes > 0) {
			return `${diffMinutes} minutes ago`;
		}

		return 'just now';
	}

	function removeGear(id: number) {
		onRemoveGear(id);
		open = false;
	}

	function equipGear(id: number) {
		onEquipGear(id);
	}
</script>

<Dialog title="Gear Info" bind:open>
	<div class="gear-info-dialog">
		<div class="gear-info">
			<div class="gear-info-header"></div>
			{#if gear}
				<div class="gear-id">
					<span>ID: {gear.id}</span>
					<span>Added: {date.toDateString() + ` (${getRelativeDate()})`}</span>
				</div>
				<div class="gear-icon">
					<img class="gear-image" src="./gear/{gear.part}.png" alt="Gear" />
				</div>
				<div class="stats-container">
					<div class="stats-grid">
						{#each GRID_ORDERING as item}
							<div class="stat-item {item.position}">
								<div class="stat-content">
									{gear.stats[item.index].stat_label ?? ''}
									+{gear.stats[item.index].titan_value_label ?? ''}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="gear-actions">
					<button class="gear-action" title="Remove Gear" onclick={() => removeGear(gear.id)}>
						<Trash2Icon />
					</button>
					<button
						class="gear-action"
						class:no-pointer={gear.isEquipped}
						title="Equip Gear"
						onclick={() => (gear.isEquipped ? {} : equipGear(gear.id))}
					>
						<ShirtIcon opacity={gear.isEquipped ? 0.5 : 1} />
					</button>
				</div>
			{:else}
				<div class="gear-icon-nogear">
					<img class="gear-image" src="./gear/A.png" alt="Armor" />
				</div>
				<p>No gear selected!</p>
			{/if}
		</div>
	</div>
</Dialog>

<style>
	.gear-info-dialog {
		width: 100%;
	}
	.gear-info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.gear-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.gear-icon-nogear {
		display: flex;
		align-items: center;
		justify-content: center;
		filter: grayscale(100%);
	}

	.gear-image {
		width: 80%;
		height: 80%;
		object-fit: contain;
	}

	.gear-id {
		display: flex;
		flex-direction: column;
		align-items: normal;
		justify-content: left;
	}

	.stats-container {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stats-grid {
		display: grid;
		flex: 1;
		margin-top: 1rem;
		margin-bottom: 1rem;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 2rem;
		width: 100%;
		height: 100%;

		padding-top: 1rem;
		padding-bottom: 1rem;
		border-top: 2px solid var(--border-color);
		border-bottom: 2px solid var(--border-color);
	}

	.stat-item {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon {
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-content {
		/* padding: 5px; */
		font-size: medium;
		text-align: center;
	}

	.stat-content.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: large;
		text-align: center;
	}

	.single-stat {
		flex: 1;
		/* padding: 1rem; */
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
	}

	.gear-actions {
		margin-top: 2rem;
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 1rem;
	}

	.gear-action {
		display: flex;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
</style>
