<script lang="ts">
	import { StatGearUser } from '$lib/scripts/stats';
	import { onMount } from 'svelte';

	let { stat = StatGearUser.ATK as StatGearUser, size = '100%' } = $props();

	let img = $state('phys');
	let unit = $state('none');
	let kind = $state('');

	onMount(() => {
		if (stat.includes('atk')) {
			kind = 'atk';
		} else if (stat.includes('dmg')) {
			kind = 'dmg';
		} else if (stat.includes('res')) {
			img = 'res';
		} else if (stat.includes('crit')) {
			img = 'crit';
		} else {
			img = 'none';
		}

		if (kind) {
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
				img = 'phys';
			}
		}

		if (stat.includes('percent')) {
			unit = 'percent';
		} else {
			unit = 'none';
		}
	});
</script>

<div style="position: relative; display: inline-block;">
	<img src="./stat_icon/{img}.webp" alt="Stat Icon" style="width: {size}; height: {size};" />

	<!-- Symbol on top of the base -->
	<!-- <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
		<svg width={25} height={25}>
			<polygon points="25,5 30,20 45,20 32,30 35,45 25,35 15,45 18,30 5,20 20,20" fill="gold" />
		</svg>
	</div> -->
</div>
