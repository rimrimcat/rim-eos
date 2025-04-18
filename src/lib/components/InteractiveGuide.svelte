<script module>
	import type { GuideItem } from '$lib/types';
	import { writable } from 'svelte/store';

	export const on_loadout_page = writable(false);

	export const GUIDE_GEAR_ELEMENT: GuideItem[] = [
		{
			// @ts-expect-error
			snippet: gear_element_req
		},
		{
			text: "First, let's go to loadout page.",
			disable_next: true,
			proceed_on: on_loadout_page
		},
		{
			text: 'test'
		}
	];
</script>

<script lang="ts">
</script>

{#snippet gear_element_req()}
	<p>In order to get started, we will need the following:</p>
	<ul>
		<li>Loadout (Weapon, Matrix, Traits, Relics)</li>
		<li>Equipped Gears</li>
		<li>Character stats (including shown base attack stats)</li>
	</ul>
	<p>If you do not have access to them, then you might not be able to complete the tutorial.</p>
{/snippet}
