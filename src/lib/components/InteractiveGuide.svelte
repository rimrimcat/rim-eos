<script module lang="ts">
	import {
		gear_page_loaded,
		gear_search_dialog_open,
		loadout_is_editing,
		loadout_new_or_duplicate_dialog_open,
		loadout_page_loaded,
		stat_adjustment_dialog_open,
		stat_page_loaded
	} from '$lib/scripts/stores';
	import type { GuideItem } from '$lib/types';

	// exports

	export const GUIDE_GEAR_ELEMENT: GuideItem[] = [
		{
			// @ts-expect-error
			snippet: gear_element_req,
			move_to: { x: '50%', y: '50%' },
			preload: ['./example/sabatons.png']
		},
		{
			text: "First, let's go to loadout page.",
			proceed_on: loadout_page_loaded,
			move_to: { x: '50%', y: '70%' },
			make_glow: ['toolbar-collapse-toggle', 'nav-item-loadout-page']
		},
		{
			text: "Let's create a new loadout. Click on the 'New' button",
			proceed_on: loadout_new_or_duplicate_dialog_open,
			make_glow: ['new-duplicate-loadout']
		},
		{
			text: 'Click on the Create New Loadout button with phys element',
			proceed_on: loadout_new_or_duplicate_dialog_open,
			require_false: true,
			make_glow: ['switch-to-__NEW__']
		},
		{
			text: "Let's edit the loadout",
			proceed_on: loadout_is_editing,
			make_glow: ['edit-loadout']
		},
		{
			text: "Set the loadout name, description, and element as needed, then save. If you are uninspired, then just set the loadout name as 'uwu' and description as 'I'm stinky'",
			proceed_on: loadout_is_editing,
			require_false: true,
			make_glow: ['save-loadout']
		},
		{
			text: 'Next, scroll down and you can set your weapon and matrix advancements. Set your loadout then continue.'
		},
		{
			text: "Let's go to the gear page next.",
			proceed_on: gear_page_loaded,
			make_glow: ['toolbar-collapse-toggle', 'nav-item-gear-page']
		},
		{
			// @ts-expect-error
			snippet: upload_gear_example,
			make_glow: ['add-gear']
		},
		{
			text: "Don't forget to equip your gears. Click the shirt icon to equip it. If it is already equipped, it will become shirt/slash icon and clicking it will unequip it."
		},
		{
			text: 'Assuming that you have uploaded all your gears, lets go to the stat page next.',
			proceed_on: stat_page_loaded,
			make_glow: ['toolbar-collapse-toggle', 'nav-item-stat-page'],
			preload: ['./example/stat.png']
		},
		{
			// @ts-expect-error
			snippet: upload_stat_example,
			make_glow: ['upload-stats']
		},
		{
			text: 'You can manually adjust the stats if the OCR misread it. Next is to adjust the stats.',
			proceed_on: stat_adjustment_dialog_open,
			make_glow: ['stat-adjustment']
		},
		{
			text: 'Input the base attack (first value you get after clicking on the stat screen). You may adjust for enhanced blade shot (drug) or supercompute. Click finalize after you are done.',
			proceed_on: stat_adjustment_dialog_open,
			require_false: true
		},
		{
			text: "Great, we now have everything needed to compare our gears. Let's go back to gear page",
			proceed_on: gear_page_loaded,
			make_glow: ['toolbar-collapse-toggle', 'nav-item-gear-page']
		},
		{
			text: "Let's search and sort our gears.",
			proceed_on: gear_search_dialog_open,
			make_glow: ['start-search']
		},
		{
			text: 'Click on MULTIPLIER then start searching',
			proceed_on: gear_search_dialog_open,
			require_false: true
		},
		{
			text: 'Now we can see our gears sorted by multiplier. The higher the multiplier, the higher the contribution of that gear to your output. The next step is to replace the worst gear. We are done, you may now close me.'
		}
	];
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

{#snippet upload_gear_example()}
	<p>Upload your gears by uploading a cropped screenshot like shown below.</p>
	<p>It should show "Random Stats"</p>
	<p>
		If augmented, it should also show "Augmentation Stats" and the augment (normal attack damage
		boost, hp recovery, etc.)
	</p>
	<img class="user-upload" src="./example/sabatons.png" alt="Example gear screenshot" />
{/snippet}

{#snippet upload_stat_example()}
	<p>Upload your character stats by uploading a FULL screenshot like shown below.</p>
	<p>If windowed, put TOF in fullscreen first</p>
	<img class="user-upload" src="./example/stat.png" alt="Example stat screenshot" />
{/snippet}
