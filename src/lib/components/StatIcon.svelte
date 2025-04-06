<script lang="ts">
	import { StatGearUser } from '$lib/scripts/stats';

	let { stat = StatGearUser.ATK as StatGearUser, size = '100%' } = $props();

	let element = $state('phys');
	let kind = $state('none');
	let unit = $state('none');

	if (stat.includes('flame')) {
		element = 'flame';
	} else if (stat.includes('frost')) {
		element = 'frost';
	} else if (stat.includes('volt')) {
		element = 'volt';
	} else if (stat.includes('phys')) {
		element = 'phys';
	} else if (stat.includes('alt')) {
		element = 'alt';
	} else {
		element = 'phys';
	}

	if (stat.includes('atk')) {
		kind = 'atk';
	} else if (stat.includes('dmg')) {
		kind = 'dmg';
	} else if (stat.includes('res')) {
		kind = 'res';
	} else {
		kind = 'none';
	}

	if (stat.includes('percent')) {
		unit = 'percent';
	} else {
		unit = 'none';
	}
</script>

<div style="position: relative; display: inline-block;">
	<img src="./stat_icon/{element}.webp" alt="Stat Icon" style="width: {size}; height: {size};" />
</div>
