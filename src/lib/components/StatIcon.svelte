<script lang="ts">
	import type { LoadoutType } from '$lib/scripts/loadouts';
	import { type StatGearUser } from '$lib/scripts/stats';

	type StatOrElement = StatGearUser | LoadoutType;

	let { stat = 'atk' as StatOrElement, size = '100%', style = '' } = $props();

	let img = $state('phys');
	let previous_stat = $state('atk');
	let unit = $state('none');
	let atk_kind = $state('');

	function getImage() {
		if (stat.includes('atk')) {
			atk_kind = 'atk';
		} else if (stat.includes('dmg')) {
			atk_kind = 'dmg';
		} else if (stat.includes('res')) {
			img = 'res';
		} else if (stat.includes('crit')) {
			img = 'crit';
		} else if (stat.includes('hp')) {
			img = 'hp';
		} else {
			atk_kind = 'atk';
		}

		if (atk_kind) {
			if (stat.includes('flame')) {
				img = 'flame';
			} else if (stat.includes('frost')) {
				img = 'frost';
			} else if (stat.includes('volt')) {
				img = 'volt';
			} else if (stat.includes('phys')) {
				img = 'phys';
			} else if (stat.includes('alt')) {
				img = 'alt';
			} else {
				img = 'gatk';
			}
		}

		if (img == 'res') {
			if (stat.includes('flame')) {
				img = 'res_flame';
			} else if (stat.includes('frost')) {
				img = 'res_frost';
			} else if (stat.includes('volt')) {
				img = 'res_volt';
			} else if (stat.includes('phys')) {
				img = 'res_phys';
			} else if (stat.includes('alt')) {
				img = 'res_alt';
			}
		}

		if (stat.includes('percent')) {
			unit = 'percent';
		} else {
			unit = 'none';
		}
	}

	$effect(() => {
		if (stat !== previous_stat) {
			getImage();
			previous_stat = stat;
		}
	});
</script>

<div style="position: relative; display: inline-block;">
	<img
		src="./stat_icon/{img}.webp"
		alt="Stat Icon"
		style="width: {size}; height: {size}; {style}"
	/>

	<!-- Symbol on top of the base -->
	<div style="position: absolute; top: 50%; left: 25%;">
		{#if atk_kind == 'dmg'}
			<img
				src="./stat_icon/{atk_kind}.webp"
				alt="Stat Icon"
				style="width: {size}; height: {size}; "
			/>
		{/if}
	</div>
</div>
