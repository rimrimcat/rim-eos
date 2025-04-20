<script lang="ts">
	import { AllMatrixIds, AllRelicIds, AllTraitIds, AllWeaponIds } from '$lib/generated/all-ids';
	import { getMatrix, getRelic, getTrait, getWeapon } from '$lib/scripts/json-loader';
	import { matrix_views, relic_views, trait_view, weapon_views } from '$lib/scripts/stores';
	import type { MatrixIds, TraitsIds, UserWeapon, WeaponsIds } from '$lib/types/index';
	import { XIcon } from '@lucide/svelte';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	type SwitchType = 'matrix' | 'weapon' | 'relic' | 'trait';

	let {
		open = $bindable(false),
		switching = $bindable('matrix' as SwitchType),
		user_weapons = $bindable([] as UserWeapon[]),
		onSwitchMatrix = (id: MatrixIds) => {},
		onSwitchWeapon = (id: WeaponsIds) => {},
		onSwitchRelic = (id: MatrixIds) => {},
		onSwitchTrait = (id: TraitsIds) => {}
	} = $props();

	let searchable = $derived.by(() => {
		switch (switching) {
			case 'matrix':
				return AllMatrixIds.filter(
					(id) => id === 'none' || !$matrix_views.some((matrix) => matrix.id === id)
				);
			case 'weapon':
				return AllWeaponIds.filter(
					(id) => id === 'none' || !$weapon_views.some((weapon) => weapon.id === id)
				);
			case 'relic':
				return AllRelicIds.filter(
					(id) => id === 'none' || !$relic_views.some((relic) => relic.id === id)
				);
			case 'trait':
				return AllTraitIds.filter((id) => id === 'none' || !($trait_view?.id === id));
		}
	});
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

<Dialog title={'Switch ' + switching} bind:open>
	<FlexGrid max_cols={3} horizontal_gap="1rem" vertical_gap="1rem">
		{#if switching === 'matrix'}
			{#each AllMatrixIds.filter((id) => id === 'none' || !$matrix_views.some((matrix) => matrix.id === id)) as matrix_id}
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
			{#each AllWeaponIds.filter((id) => id === 'none' || !$weapon_views.some((weapon) => weapon.id === id)) as weapon_id}
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
		{:else if switching === 'relic'}
			{#each AllRelicIds.filter((id) => id === 'none' || !$relic_views.some((relic) => relic.id === id)) as relic_id}
				{#await getRelic(relic_id) then relic}
					<div class="matrix-item vertical center" style="width: 8rem; height: 8rem;">
						<div class="compose below border" style="width: 6rem; height: 6rem;">
							<button
								class="image"
								onclick={() => {
									onSwitchRelic(relic_id);
									open = false;
								}}
							>
								{#if relic.id === 'none'}
									<XIcon size="6rem" color="var(--text-color)" />
								{:else}
									<img src="./relic/{relic.id}.webp" alt="Relic" style="height:6rem; width:6rem;" />
								{/if}
							</button>
						</div>
						<div class="horizontal center" style="margin-top: 0.5rem;">
							<span>{relic.name}</span>
						</div>
					</div>
				{/await}
			{/each}
		{:else if switching === 'trait'}
			{#each AllTraitIds.filter((id) => id === 'none' || !($trait_view?.id === id)) as trait_id}
				{#await getTrait(trait_id) then trait}
					<div class="matrix-item vertical center" style="width: 8rem; height: 8rem;">
						<div class="compose below border" style="width: 6rem; height: 6rem;">
							<button
								class="image"
								onclick={() => {
									onSwitchTrait(trait_id);
									open = false;
								}}
							>
								{#if trait.id === 'none'}
									<XIcon size="6rem" color="var(--text-color)" />
								{:else}
									<img src="./trait/{trait.id}.webp" alt="Trait" style="height:6rem; width:6rem;" />
								{/if}
							</button>
						</div>
						<div class="horizontal center" style="margin-top: 0.5rem;">
							<span>{trait.name}</span>
						</div>
					</div>
				{/await}
			{/each}
		{/if}
	</FlexGrid>
</Dialog>
