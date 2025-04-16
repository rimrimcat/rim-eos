<script lang="ts">
	import { AllMatrixIds, AllWeaponIds } from '$lib/generated/all-ids';
	import { getMatrix, getWeapon } from '$lib/scripts/json-loader';
	import type { MatrixIds, WeaponsIds } from '$lib/types/index';
	import { XIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	let {
		open = $bindable(false),
		switching = $bindable('matrix' as 'matrix' | 'weapon'),
		onSwitchMatrix = (id: MatrixIds) => {},
		onSwitchWeapon = (id: WeaponsIds) => {}
	} = $props();
</script>

{#snippet matrix4p(matrix_id: MatrixIds)}
	{#each [0, 1, 2, 3] as index}
		<div class="compose above" style="top: 0rem; left: {-0.75 + 0.5 * index}rem">
			<img
				src="./matrix/{matrix_id.replace('-4p', '')}.webp"
				alt="Matrix"
				style="height: 6rem; width:6rem;"
			/>
		</div>
	{/each}
{/snippet}

<Dialog title={'Switch ' + (switching === 'matrix' ? 'Matrix' : 'Weapon')} bind:open>
	<FlexGrid max_cols={3} horizontal_gap="1rem" vertical_gap="1rem">
		{#if switching === 'matrix'}
			{#each AllMatrixIds as matrix_id}
				{#await getMatrix(matrix_id) then matrix}
					<div class="matrix-item vertical center" style="width: 8rem; height: 8rem;">
						<div class="compose below border" style="width: 6rem; height: 6rem;">
							<button
								class="image"
								onclick={() => {
									onSwitchMatrix(matrix_id);
									open = false;
								}}
							>
								{#if matrix.id === 'none'}
									<XIcon size="6rem" color="var(--text-color)" />
								{:else}
									{@render matrix4p(matrix.id)}
								{/if}
							</button>
						</div>
						<div class="horizontal center" style="margin-top: 0.5rem;">
							<span>{matrix.name}</span>
						</div>
					</div>
				{/await}
			{/each}
		{:else if switching === 'weapon'}
			{#each AllWeaponIds as weapon_id}
				{#await getWeapon(weapon_id) then weapon}
					<div class="matrix-item vertical center" style="width: 8rem; height: 8rem;">
						<div class="compose below border" style="width: 6rem; height: 6rem;">
							<button
								class="image"
								onclick={() => {
									onSwitchWeapon(weapon_id);
									open = false;
								}}
							>
								{#if weapon.id === 'none'}
									<XIcon size="6rem" color="var(--text-color)" />
								{:else}
									<img
										src="./weapon/{weapon.id}.webp"
										alt="Weapon"
										style="height:6rem; width:6rem;"
									/>
								{/if}
							</button>
						</div>
						<div class="horizontal center" style="margin-top: 0.5rem;">
							<span>{weapon.name}</span>
						</div>
					</div>
				{/await}
			{/each}
		{/if}
	</FlexGrid>
</Dialog>
