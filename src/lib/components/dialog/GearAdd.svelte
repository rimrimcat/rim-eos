<script lang="ts">
	import { GEAR_LABELS, GearPart, type ValidGearPart } from '$lib/scripts/gears';
	import { is_mobile } from '$lib/scripts/stores';
	import { PlusIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';

	const PARTS = Object.values(GEAR_LABELS);
	const GROUP_1 = ['Helmet', 'Spaulders', 'Armor', 'Bracers', 'Belt', 'Legguards'];
	const GROUP_2 = ['Gloves', 'Boots'];
	const GROUP_3 = ['Visor', 'Engine', 'Exoskeleton', 'Reactor'];

	let { open = $bindable(false) } = $props();

	let part_dialog_open = $state<boolean>(false);

	let part = $state<ValidGearPart | GearPart.UNKNOWN>(GearPart.UNKNOWN);
	let stats = $state([]);
</script>

<Dialog title="Add Gear" bind:open>
	<div class="vertical">
		<div class="vertical-left">
			<button class="border" id="specify-part" onclick={() => (part_dialog_open = true)}>
				{#if part === GearPart.UNKNOWN}
					<PlusIcon />
					<label class="in-button" for="specify-part">Specify Part</label>
				{:else}
					<img src="./gear/{part}.png" alt="Gear Part" style="width: 30px;" />
				{/if}
			</button>
		</div>
		<div class="horizontal">
			<h3>Gear Stats</h3>
		</div>
	</div>
</Dialog>

<Dialog title="Specify Part" bind:open={part_dialog_open}>
	<div class="slot-grid">
		{#each Object.entries(GEAR_LABELS) as [id, label], indx}
			<button
				class:selected={part === id}
				class:group1={GROUP_1.includes(label)}
				class:group2={GROUP_2.includes(label)}
				class:group3={GROUP_3.includes(label)}
				onclick={() => {
					part = id as ValidGearPart;
					part_dialog_open = false;
				}}
				title={label}
			>
				<div class="slot-button-content">
					<img
						src={`./gear_icon/${label.toLowerCase()}.png`}
						alt={`${label} icon`}
						class="slot-icon"
						width="30px"
						height="30px"
					/>
					{#if !$is_mobile}
						<span class="slot-label">{label}</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</Dialog>

<style>
	.slot-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.slot-grid button {
		padding: 0.5rem;
		height: auto;
	}

	.slot-grid button.group1 {
		border-left: 3px solid #ff7700;
	}

	.slot-grid button.group2 {
		border-left: 3px solid #00aaff;
	}

	.slot-grid button.group3 {
		border-left: 3px solid #44cc44;
	}

	.slot-grid button.selected.group1 {
		border: 1px solid var(--border-color);
		border-left: 3px solid #ff7700;
	}

	.slot-grid button.selected.group2 {
		border: 1px solid var(--border-color);
		border-left: 3px solid #00aaff;
	}

	.slot-grid button.selected.group3 {
		border: 1px solid var(--border-color);
		border-left: 3px solid #44cc44;
	}
</style>
