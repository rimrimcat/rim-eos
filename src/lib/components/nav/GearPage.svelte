<script lang="ts">
	import {
		GearParts,
		loadObject,
		saveObject,
		GearStat as Stat,
		StorageKey,
		type Gear,
		type GearStatItem,
		type GearView
	} from '$lib/scripts/loader.ts';
	import {
		ActionType,
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/navMetadata.svelte.ts';
	import { Format, formatValue } from '$lib/scripts/validation.ts';

	import { ImagePlus, LayoutGrid, Shirt } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';
	import UploadScreenshot from '../dialog/UploadScreenshot.svelte';
	import FlexGrid from '../FlexGrid.svelte';
	import NavToolbar from '../NavToolbar.svelte';

	let user_gears: Gear[] = $state(loadObject(StorageKey.GEARS_V1));
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

	const STAT_LABEL = {
		[Stat.HP]: 'HP',
		[Stat.HP_PERCENT]: 'HP',
		[Stat.CRIT]: 'Crit',
		[Stat.CRIT_PERCENT]: 'Crit',
		[Stat.CRIT_DMG]: 'Crit Dmg',
		[Stat.RES]: 'Res',
		[Stat.RES_PERCENT]: 'Res',
		[Stat.ATK]: 'ATK',
		[Stat.PHYS_ATK]: 'Phys Atk',
		[Stat.PHYS_ATK_PERCENT]: 'Phys Atk',
		[Stat.PHYS_DMG_PERCENT]: 'Phys Dmg',
		[Stat.PHYS_RES]: 'Phys Res',
		[Stat.PHYS_RES_PERCENT]: 'Phys Res',
		[Stat.FLAME_ATK]: 'Flame Atk',
		[Stat.FLAME_ATK_PERCENT]: 'Flame Atk',
		[Stat.FLAME_DMG_PERCENT]: 'Flame Dmg',
		[Stat.FLAME_RES]: 'Flame Res',
		[Stat.FLAME_RES_PERCENT]: 'Flame Res',
		[Stat.FROST_ATK]: 'Frost Atk',
		[Stat.FROST_ATK_PERCENT]: 'Frost Atk',
		[Stat.FROST_DMG_PERCENT]: 'Frost Dmg',
		[Stat.FROST_RES]: 'Frost Res',
		[Stat.FROST_RES_PERCENT]: 'Frost Res',
		[Stat.VOLT_ATK]: 'Volt Atk',
		[Stat.VOLT_ATK_PERCENT]: 'Volt Atk',
		[Stat.VOLT_DMG_PERCENT]: 'Volt Dmg',
		[Stat.VOLT_RES]: 'Volt Res',
		[Stat.VOLT_RES_PERCENT]: 'Volt Res',
		[Stat.ALT_ATK]: 'Alt Atk',
		[Stat.ALT_ATK_PERCENT]: 'Alt Atk',
		[Stat.ALT_DMG_PERCENT]: 'Alt Dmg',
		[Stat.ALT_RES]: 'Alt Res',
		[Stat.ALT_RES_PERCENT]: 'Alt Res'
	} as const;

	function getRollValue(stat: Stat, value: number): number {
		let base;
		let low_roll;
		let high_roll;
		switch (stat) {
			case Stat.HP:
				base = 4125;
				low_roll = 7480;
				high_roll = 18700;
				break;
			case Stat.HP_PERCENT:
				base = 0.94;
				low_roll = 1.08;
				high_roll = 1.08;
				break;
			case Stat.ATK:
				base = 52;
				low_roll = 93;
				high_roll = 234;
				break;
			case Stat.CRIT:
				base = 258;
				low_roll = 468;
				high_roll = 1169;
				break;
			case Stat.CRIT_PERCENT:
				base = 1.05;
				low_roll = 1.19;
				high_roll = 1.19;
				break;
			case Stat.RES:
				base = 64;
				low_roll = 117;
				high_roll = 292;
				break;
			case Stat.ALT_ATK:
				base = 137;
				low_roll = 249;
				high_roll = 623;
				break;
			case Stat.ALT_RES:
				base = 215;
				low_roll = 390;
				high_roll = 974;
				break;
			case Stat.ALT_RES_PERCENT:
				base = 7.87;
				low_roll = 9;
				high_roll = 9;
				break;
			default:
				if (stat.includes('_atk_percent')) {
					base = 1.26;
					low_roll = 1.44;
					high_roll = 1.44;
				} else if (stat.includes('_atk')) {
					base = 69;
					low_roll = 125;
					high_roll = 312;
				} else if (stat.includes('_dmg_percent')) {
					base = 0.65;
					low_roll = 0.72;
					high_roll = 0.72;
				} else if (stat.includes('_res_percent')) {
					base = 7.87;
					low_roll = 9;
					high_roll = 9;
				} else if (stat.includes('_res')) {
					base = 215;
					low_roll = 390;
					high_roll = 974;
				} else {
					console.error('Unknown stat:', stat);
					return 0;
				}
		}

		return ((value - base) * 2) / (high_roll + low_roll);
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

	async function createGearView(gear: Gear): Promise<GearView> {
		const stats: GearStatItem[] = [];
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
					stats.push({
						stat: key as Stat,
						// @ts-expect-error
						stat_label: STAT_LABEL[key as Stat] ?? key,
						value: value as number,
						value_label: formatValue(
							key.includes('_percent') ? Format.FLOAT_PERCENT_3D : Format.INTEGER,
							value as string
						),
						roll: getRollValue(key as Stat, Number(value))
					});
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

	function addNewGear(gear: Gear) {
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

		const newGear: Gear = {
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
		fourStatMode: true
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
				lucide: ImagePlus,
				type: ActionType.BUTTON,
				callback: () => (screenshotDialogOpen = true)
			},
			{
				id: 'fourStatMode',
				label: 'Extended Stats',
				lucide: LayoutGrid,
				type: ActionType.TOGGLE,
				callback: () => {
					hasMeasured = false;
				}
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
											{gear.stats[0].stat_label ?? ''}
											+{gear.stats[0].value_label ?? ''}
										</div>
									</div>
									<div class="stat-item top-right">
										<div class="stat-content">
											{gear.stats[2].stat_label ?? ''}
											+{gear.stats[2].value_label ?? ''}
										</div>
									</div>
									<div class="stat-item bottom-left">
										<div class="stat-content">
											{gear.stats[1].stat_label ?? ''}
											+{gear.stats[1].value_label ?? ''}
										</div>
									</div>
									<div class="stat-item bottom-right">
										<div class="stat-content">
											{gear.stats[3].stat_label ?? ''}
											+{gear.stats[3].value_label ?? ''}
										</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="single-stat">
								<!-- <div class="stat">Stat 1</div> -->
								<div class="stat-content">
									{gear.stats[0].stat_label ?? ''}
									+{gear.stats[0].value_label ?? ''}
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
