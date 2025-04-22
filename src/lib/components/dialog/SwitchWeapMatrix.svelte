<script lang="ts">
	import { AllMatrixIds, AllRelicIds, AllTraitIds, AllWeaponIds } from '$lib/generated/all-ids';
	import { getMatrix, getRelic, getTrait, getWeapon } from '$lib/scripts/json-loader';
	import { matrix_views, relic_views, trait_view, weapon_views } from '$lib/scripts/stores';
	import type {
		MatrixIds,
		Relic,
		RelicsIds,
		Trait,
		TraitsIds,
		UserWeapon,
		Weapon,
		WeaponsIds
	} from '$lib/types/index';
	import { XIcon } from '@lucide/svelte';
	import type { Matrix } from '@techstark/opencv-js';
	import Dialog from '../Dialog.svelte';
	import FlexGrid from '../FlexGrid.svelte';

	type SwitchType = 'matrix' | 'weapon' | 'relic' | 'trait';
	type IdType = MatrixIds[] | WeaponsIds[] | TraitsIds[] | RelicsIds[];
	type StuffArray = Matrix[] | Weapon[] | Relic[] | Trait[];
	type Stuff = Matrix | Weapon | Relic | Trait;

	let {
		open = $bindable(false),
		switching = $bindable('matrix' as SwitchType),
		user_weapons = $bindable([] as UserWeapon[]),
		onSwitchMatrix = (id: MatrixIds) => {},
		onSwitchWeapon = (id: WeaponsIds) => {},
		onSwitchRelic = (id: MatrixIds) => {},
		onSwitchTrait = (id: TraitsIds) => {}
	} = $props();

	function getValidIds(switching_: SwitchType): IdType {
		switch (switching_) {
			case 'trait': {
				return AllTraitIds.filter((id) => id !== 'none' && !($trait_view?.id === id));
			}
			case 'matrix': {
				return AllMatrixIds.filter(
					(id) => id !== 'none' && !$matrix_views.some((matrix) => matrix.id === id)
				);
			}
			case 'weapon': {
				return AllWeaponIds.filter(
					(id) => id !== 'none' && !$weapon_views.some((weapon) => weapon.id === id)
				);
			}
			case 'relic': {
				return AllRelicIds.filter(
					(id) => id !== 'none' && !$relic_views.some((relic) => relic.id === id)
				);
			}
		}
	}

	function getGetter(switching_: SwitchType) {
		switch (switching_) {
			case 'trait': {
				return getTrait;
			}
			case 'matrix': {
				return getMatrix;
			}
			case 'weapon': {
				return getWeapon;
			}
			case 'relic': {
				return getRelic;
			}
		}
	}

	function getReturner(switching_: SwitchType) {
		switch (switching_) {
			case 'trait': {
				return onSwitchTrait;
			}
			case 'matrix': {
				return onSwitchMatrix;
			}
			case 'weapon': {
				return onSwitchWeapon;
			}
			case 'relic': {
				return onSwitchRelic;
			}
		}
	}

	let valid_stuff = $derived(getValidIds(switching));
	let gettedGetter = $derived(getGetter(switching));
	let gettedReturner = $derived(getReturner(switching));
	let actual_stuff = $state([] as StuffArray);
	let search_query = $state('');

	async function stuffToDisplayNormally() {
		return [
			await gettedGetter('none'),
			...(await Promise.all(valid_stuff.map((id) => gettedGetter(id as any))))
		];
	}

	$effect(() => {
		// @ts-expect-error
		Promise.all(valid_stuff.map((id) => gettedGetter(id))).then((stuff) => {
			actual_stuff = stuff;
		});
	});

	$effect(() => {
		if (!open) {
			// reset search query after close
			search_query = '';
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

{#snippet showStuff(stuff: Stuff)}
	<div class="stuff-item vertical center" style="width: 8rem; height: 8rem;">
		<div class="compose below border" style="width: 6rem; height: 6rem;">
			<button
				class="image"
				onclick={() => {
					gettedReturner(stuff.id);
					open = false;
				}}
			>
				{#if stuff.id === 'none'}
					<XIcon size="6rem" color="var(--text-color)" />
				{:else if switching === 'matrix' && stuff.id.includes('4p')}
					{@render matrix4p(stuff.id)}
				{:else}
					<img
						src="./{switching}/{stuff.id}.webp"
						alt={switching}
						style="height:6rem; width:6rem;"
					/>
				{/if}
			</button>
		</div>
		<div class="horizontal center" style="margin-top: 0.5rem;">
			<span>{stuff.name}</span>
		</div>
	</div>
{/snippet}

<Dialog title={'Switch ' + switching} bind:open>
	<div class="vertical center-hori">
		<input
			type="text"
			bind:value={search_query}
			placeholder="Search..."
			style="width: 90%; padding: 0.5rem;"
		/>
	</div>
	<FlexGrid min_cols={3} max_cols={3} horizontal_gap="1rem" vertical_gap="1rem">
		{#await stuffToDisplayNormally()}
			<p>Loading...</p>
		{:then array_of_stuff}
			{#if search_query !== ''}
				{#each array_of_stuff.flatMap((stuff) => (stuff.name
						.toLowerCase()
						.replace(' ', '')
						.includes(search_query.toLowerCase().replace(' ', '')) ? [stuff] : [])) as stuff}
					{@render showStuff(stuff)}
				{/each}
			{:else}
				{#each array_of_stuff as stuff}
					{@render showStuff(stuff)}
				{/each}
			{/if}
		{/await}
	</FlexGrid>
</Dialog>
