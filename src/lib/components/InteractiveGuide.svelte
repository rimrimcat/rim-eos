<script module>
	import type { Snippet } from 'svelte';
	// @ts-expect-error
	export const GUIDE_GEAR_ELEMENT: (Snippet | string)[] = [gear_element_req, 'some string'];
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
