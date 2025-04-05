<script lang="ts">
	import {
		GearParts,
		type GearView,
		type GearViewStatItem,
		type UserGear
	} from '$lib/scripts/gears.ts';
	import { loadObject, saveObject, StorageKey } from '$lib/scripts/loader.ts';
	import { StatGearUser as Stat, STAT_CONSTANTS, STAT_LABELS } from '$lib/scripts/stats.ts';

	import {
		ActionType,
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/navMetadata.svelte.ts';
	import { Format, formatValue } from '$lib/scripts/validation.ts';

	import {
		ImagePlusIcon,
		LayoutGridIcon,
		Shirt,
		SparkleIcon,
		SparklesIcon,
		SquareIcon
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';
	import UploadScreenshot from '../dialog/UploadScreenshot.svelte';
	import FlexGrid from '../FlexGrid.svelte';
	import NavToolbar from '../NavToolbar.svelte';

	let user_gears: UserGear[] = $state(loadObject(StorageKey.GEARS_V1));
	let gear_views: GearView[] = $state([]);

	let screenshotDialogOpen = $state(false);
	let uploadedImageURL: string = $state('');
	let processText: string = $state('');

	let hasMeasured = $state(false); // for triggering flexGrid itemWidth update

	const OCR_KEY_MAP = {
		hp: 'hp',
		atk: 'atk',
		crit: 'crit',
		'flame attack': 'flame_atk',
		'frost attack': 'frost_atk',
		'volt attack': 'volt_atk',
		'physical attack': 'phys_atk',
		'alt attack': 'alt_atk',
		'flame damage': 'flame_dmg',
		'frost damage': 'frost_dmg',
		'volt damage': 'volt_dmg',
		'physical damage': 'phys_dmg',
		'alt damage': 'alt_dmg',
		resistance: 'res',
		'flame resistance': 'flame_res',
		'frost resistance': 'frost_res',
		'volt resistance': 'volt_res',
		'physical resistance': 'phys_res',
		'alt resistance': 'alt_res'
	} as const;

	// reference: https://tof-tools.vercel.app/stats
	function getRollValue(stat: Stat, value: number): number {
		const stc = STAT_CONSTANTS[stat];
		return ((value - stc.base) * 2) / (stc.high_roll + stc.low_roll);
	}

	function getTitanValue(stat: Stat, value: number): number {
		const stc = STAT_CONSTANTS[stat];
		return value + stc.titan_base + stc.titan_multiplier * (value - stc.base);
	}

	function getGearPart(part: string) {
		switch (part) {
			case 'helm':
				return GearParts.HELMET;
			case 'spaulders':
				return GearParts.SPAULDERS;
			case 'armor':
				return GearParts.ARMOR;
			case 'bracers':
				return GearParts.BRACERS;
			case 'belt':
				return GearParts.BELT;
			case 'legguards':
				return GearParts.LEGGUARDS;
			//
			case 'handguards':
				return GearParts.GLOVES;
			case 'sabatons':
				return GearParts.BOOTS;
			//
			case 'eyepiece':
				return GearParts.VISOR;
			case 'visor':
				return GearParts.VISOR;
			case 'engine':
				return GearParts.ENGINE;
			case 'exoskeleton':
				return GearParts.EXOSKELETON;
			case 'microreactor':
				return GearParts.REACTOR;
			default:
				console.error('UNKNOWN PART:', part);
				return GearParts.UNKNOWN;
		}
	}

	async function createGearView(gear: UserGear): Promise<GearView> {
		const stats: GearViewStatItem[] = [];
		let id: number = -1;
		let part: GearParts = GearParts.UNKNOWN;

		Object.entries(gear).forEach(([key, value]) => {
			switch (key) {
				case 'id':
					id = value as number;
					break;
				case 'part':
					part = value as GearParts;
					break;
				default:
					const _stat = key as Stat;
					// @ts-expect-error
					const stat_label = STAT_LABELS[_stat] ?? key;

					const titan_key = 'titan_' + _stat;
					const titan_value = getTitanValue(_stat, Number(value));

					stats.push({
						stat: _stat,
						stat_label,
						value: value as number,
						value_label: formatValue(
							key.includes('_percent') ? Format.FLOAT_PERCENT_3D : Format.INTEGER,
							value as string
						),
						roll: getRollValue(_stat, Number(value)),
						titan_stat_label: 'Titan ' + stat_label,
						titan_value_label: formatValue(
							key.includes('_percent') ? Format.FLOAT_PERCENT_3D : Format.INTEGER,
							titan_value.toString()
						)
					});
					// add titan stats
					// derived.push({
					// 	stat: titan_key as TitanStat,
					// 	stat_label: 'Titan ' + stat_label,
					// 	value: titan_value,
					// 	value_label: formatValue(
					// 		key.includes('_percent') ? Format.FLOAT_PERCENT_3D : Format.INTEGER,
					// 		titan_value.toString()
					// 	)
					// });
					break;
			}
		});
		stats.sort((a, b) => (b.roll ?? 0) - (a.roll ?? 0));

		console.log('Created GearView for ', id, ':', stats);
		return {
			id,
			part,
			stats
		};
	}

	function addNewGear(gear: UserGear) {
		user_gears.push(gear);
		saveObject(StorageKey.GEARS_V1, user_gears);

		createGearView(gear).then((gearView) => {
			gear_views.push(gearView);
		});
	}

	async function doGearOCR(canvas: HTMLCanvasElement) {
		const worker = await createWorker('eng');
		const data_url = canvas.toDataURL();

		processText = 'Detecting fields...';
		const ret = await worker.recognize(data_url);

		await worker.terminate();

		let txt = ret.data.text
			.toLowerCase()
			.replace(/^[^\s]{1,3} /gm, '') // remove 2-3 characters followed by space at the start of a line
			.split('\n'); // those characters are noise from trying to read symbols

		const id = user_gears.length + 1;
		const part = getGearPart(
			txt[0].replace('fortress ', '').replace('tactics ', '').replace('combat ', '').split(' ')[0]
		);

		const newGear: UserGear = {
			id,
			part
		};

		const rsIndex = txt.findIndex((line) => line.includes('random stats'));
		let foundStats = 0;
		if (rsIndex) {
			const statLines = txt.slice(rsIndex + 1);

			for (let _i = 0; _i < statLines.length; _i++) {
				const line = statLines[_i];

				const _spl = line.split('+');

				// @ts-expect-error
				const _base = OCR_KEY_MAP[_spl[0].trim()];
				if (_spl[1] && _base) {
					const _stat = _base + (_spl[1].includes('%') ? '_percent' : '');
					const _val = _spl[1].replace('%', '').replace(',', '').trim();

					// @ts-expect-error
					newGear[_stat] = _val;
					foundStats++;
				} else {
					if (foundStats < 4) {
						console.error('bad OCR or empty line?:', line);
						continue;
					}
					console.log('Found 4 stats, assuming we are done here.');
					break;
				}
			}
		} else {
			console.error('I CANT FIND RANDOM STATS!');
			console.error('Perhaps I should go for reverse order...');
			console.error('(I havent encountered this yet)');
		}

		addNewGear(newGear);
		processText = 'Done!';
	}

	function onFileUpload(canvas: HTMLCanvasElement) {
		if (uploadedImageURL && canvas) {
			doGearOCR(canvas);
		}
	}

	Promise.all(user_gears.map((gear) => createGearView(gear))).then((gearViews) => {
		gear_views = gearViews;
		console.log('Done processing user_gears');
	});

	// register
	let bound_objects = $state({
		fourStatMode: true,
		titanMode: false
	});

	const id = 'gear-page';

	const metadata: ComponentMetadata = {
		id,
		label: 'Gears',
		lucide: Shirt,
		showInNav: true,
		order: 1,
		actions: [
			{
				id: 'screenshot',
				label: 'From Screenshot',
				lucide: ImagePlusIcon,
				type: ActionType.BUTTON,
				callback: () => (screenshotDialogOpen = true)
			},
			{
				id: 'fourStatMode',
				label: 'Extended Stats',
				type: ActionType.TOGGLE,
				callback: () => {
					hasMeasured = false;
				},
				lucide_on: LayoutGridIcon,
				lucide_off: SquareIcon
			},
			{
				id: 'titanMode',
				label: 'Titan Stats',
				type: ActionType.TOGGLE,
				callback: () => {
					hasMeasured = false;
				},
				lucide_on: SparklesIcon,
				lucide_off: SparkleIcon
			}
		]
	};

	onMount(() => {
		registerComponent(id, metadata);
	});
</script>

<div class="gear-page">
	<div class="gear-settings">
		<h1 class="Pro">Gear List</h1>
	</div>

	<div class="gear-grid">
		<FlexGrid maxColumns={4} verticalGap="0rem" horizontalGap="5rem" bind:hasMeasured>
			{#if user_gears.length !== 0}
				{#each gear_views as gear}
					<div class="gear-cell gear-id-{gear.id}">
						<div class="gear-icon">
							<div class="icon-container">
								<img src="./gear/{gear.part}.png" alt="Gear" />
							</div>
						</div>

						{#if bound_objects.fourStatMode}
							<div class="stats-container">
								<div class="stats-grid">
									<div class="stat-item top-left">
										<div class="stat-content">
											{#if bound_objects.titanMode}
												{gear.stats[0].titan_stat_label ?? ''}
												+{gear.stats[0].titan_value_label ?? ''}
											{:else}
												{gear.stats[0].stat_label ?? ''}
												+{gear.stats[0].value_label ?? ''}
											{/if}
										</div>
									</div>
									<div class="stat-item top-right">
										<div class="stat-content">
											{#if bound_objects.titanMode}
												{gear.stats[2].titan_stat_label ?? ''}
												+{gear.stats[2].titan_value_label ?? ''}
											{:else}
												{gear.stats[2].stat_label ?? ''}
												+{gear.stats[2].value_label ?? ''}
											{/if}
										</div>
									</div>
									<div class="stat-item bottom-left">
										<div class="stat-content">
											{#if bound_objects.titanMode}
												{gear.stats[1].titan_stat_label ?? ''}
												+{gear.stats[1].titan_value_label ?? ''}
											{:else}
												{gear.stats[1].stat_label ?? ''}
												+{gear.stats[1].value_label ?? ''}
											{/if}
										</div>
									</div>
									<div class="stat-item bottom-right">
										<div class="stat-content">
											{#if bound_objects.titanMode}
												{gear.stats[3].titan_stat_label ?? ''}
												+{gear.stats[3].titan_value_label ?? ''}
											{:else}
												{gear.stats[3].stat_label ?? ''}
												+{gear.stats[3].value_label ?? ''}
											{/if}
										</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="single-stat">
								<!-- <div class="stat">Stat 1</div> -->
								<div class="stat-content">
									{#if bound_objects.titanMode}
										{gear.stats[0].titan_stat_label ?? ''}
										+{gear.stats[0].titan_value_label ?? ''}
									{:else}
										{gear.stats[0].stat_label ?? ''}
										+{gear.stats[0].value_label ?? ''}
									{/if}
								</div>
							</div>
						{/if}

						<div class="gear-actions"></div>
					</div>
				{/each}
			{:else}
				<div class="gear-cell">
					<div class="gear-icon">
						<div class="icon-container-nogear">
							<img src="./gear/A.png" alt="Armor" />
						</div>
					</div>
					<div class="single-stat">
						<div class="stat">Add gears first!</div>
					</div>
				</div>
			{/if}
		</FlexGrid>
	</div>
</div>

<UploadScreenshot
	{onFileUpload}
	bind:open={screenshotDialogOpen}
	bind:uploadedImageURL
	bind:processText
/>

<NavToolbar actions={metadata.actions} bind:bound_objects />

<style>
	.gear-page {
		margin-top: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
		margin-right: 3vw;
	}

	.gear-settings {
		display: block;
		padding: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
	}

	.gear-grid {
		margin-top: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
		overflow: scroll;
		margin-right: 3vw;
		border-top: 4px solid var(--border-color);
	}

	.gear-cell {
		background-color: var(--bg-color);
		display: flex;
		flex-direction: row;
		width: 100%;
		/* border: 2px solid #000; */
		padding: 1rem;
		border-bottom: 2px solid var(--border-color);
	}

	.gear-icon {
		width: 5rem;
		/* min-width: 130px; */
		margin-right: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-container,
	.icon-container-nogear {
		max-width: 3rem;
		max-height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-container-nogear {
		filter: grayscale(100%);
	}

	.gear-icon img {
		display: block;
		width: 90%;
		height: 90%;
		object-fit: contain;
	}

	.stats-container {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 1rem;
		width: 100%;
		height: 100%;
	}

	.stat-item {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-content {
		/* padding: 5px; */
		font-size: large;
		/* text-transform: capitalize; */
	}

	.single-stat {
		flex: 1;
		/* padding: 1rem; */
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
	}
</style>
