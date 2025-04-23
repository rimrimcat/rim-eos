<script lang="ts">
	import type { CompoundElements, Elements, StatGearFinal, StatGearUser } from '$lib/types/index';

	type StatOrElement = StatGearUser | StatGearFinal | Elements | CompoundElements;

	let { stat = 'atk' as StatOrElement, size = '100%', gray = false, style = '' } = $props();

	let img = $state('gatk');
	let previous_stat = $state('atk');
	let unit = $state<string>('');
	let atk_kind = $state('');

	function getImage(stat: string) {
		// yet to create images for compound elements, so just get the primary one
		stat = stat.split('-')[0];

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
			} else if (stat.includes('crit')) {
				img = 'crit';
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
			unit = '';
		}
	}
	let imageWidth = $state(0);
	let imageHeight = $state(0);

	let maxIconWidth = $derived((atk_kind === 'dmg' ? 34 : 0) + (unit === 'percent' ? 13 : 0));
	const maxIconHeight = 13;

	let iconHeight = $derived(
		Math.min(Math.floor((imageWidth / maxIconWidth) * maxIconHeight), maxIconHeight)
	);
	let iconWidth = $derived(Math.min(iconHeight * (maxIconWidth / maxIconHeight), maxIconWidth));

	$effect(() => {
		if (stat !== previous_stat) {
			getImage(stat);
			previous_stat = stat;
		}
	});
</script>

<div
	class="compose below"
	style="display: inline-block; width: {size}; height: {size}; position: relative; line-height: 0;"
>
	<img
		src="./stat_icon/{img}.webp"
		alt="Stat Icon"
		style="width: 100%; height: 100%; filter: {gray
			? 'grayscale(100%)'
			: 'none'}; object-fit: cover; {style}"
		bind:clientWidth={imageWidth}
		bind:clientHeight={imageHeight}
	/>

	<!-- Symbols on top of the base -->
	<div
		class="horizontal compose above"
		style="position: absolute; top: {imageHeight - iconHeight}px; left: {imageWidth -
			iconWidth}px; gap: 0;"
	>
		{#if atk_kind == 'dmg'}
			<img
				src="./stat_icon/{atk_kind}.webp"
				alt={atk_kind}
				style="height: {iconHeight}px; filter: {gray ? 'grayscale(100%)' : 'none'};"
			/>
		{/if}
		{#if unit == 'percent'}
			<img
				src="./stat_icon/percent.webp"
				alt="Percent"
				style="height: {iconHeight}px; filter: {gray ? 'grayscale(100%)' : 'none'};"
			/>
		{/if}
	</div>

	<div class="compose above" style="position: absolute; top: 50%; left: 81%;"></div>
</div>
