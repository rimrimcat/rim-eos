<script lang="ts">
	import {
		GearParts,
		type GearSearchView,
		type GearView,
		type GearViewStatLong,
		type GearViewStatShort,
		type UserGear
	} from '$lib/scripts/gears.ts';
	import { loadObject, saveObject, StorageKey } from '$lib/scripts/loader.ts';
	import {
		STAT_CONSTANTS,
		STAT_LABELS,
		type StatGearUser as Stat,
		type StatGearTitan as TitanStat
	} from '$lib/scripts/stats.ts';

	import {
		ActionType,
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/navMetadata.svelte.ts';
	import { Format, formatValue } from '$lib/scripts/validation.ts';

	import {
		CaseSensitiveIcon,
		DiamondIcon,
		ImagePlusIcon,
		LayoutGridIcon,
		SearchSlashIcon,
		Shirt,
		SparkleIcon,
		SparklesIcon,
		SquareIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';
	import ActionToolbar from '../ActionToolbar.svelte';
	import GearSearch from '../dialog/GearSearch.svelte';
	import UploadScreenshot from '../dialog/UploadScreenshot.svelte';
	import FlexGrid from '../FlexGrid.svelte';
	import StatIcon from '../StatIcon.svelte';

	let { isMobile = $bindable(false) } = $props();

	let user_gears: UserGear[] = $state(loadObject(StorageKey.GEARS_V1));
	let gear_views: GearView[] = $state([]);
	let prev_search_query: string = $state('');
	let search_views: GearSearchView[] = $state([]);

	// Screenshot Dialog
	let screenshotDialogOpen = $state(false);
	let uploadedImageURL: string = $state('');
	let processText: string = $state('');

	// Search Dialog
	let searchDialogOpen = $state(false);
	let isSearching = $state(false);

	let hasMeasured = $state(false); // for triggering flexGrid itemWidth update

	// html
	const GRID_ORDERING = [
		{ position: 'top-left', index: 0 },
		{ position: 'top-right', index: 2 },
		{ position: 'bottom-left', index: 1 },
		{ position: 'bottom-right', index: 3 }
	];

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
		const stats: GearViewStatLong[] = [];
		const derived: GearViewStatShort[] = [];
		let id: number = -1;
		let part: GearParts = GearParts.UNKNOWN;
		let hash = '';

		Object.entries(gear).forEach(([key, value]) => {
			switch (key) {
				case 'id':
					id = value as number;
					break;
				case 'part':
					part = value as GearParts;
					hash += value;
					break;
				default:
					const _stat = key as Stat;
					const value_format = key.includes('_percent') ? Format.FLOAT_PERCENT_3D : Format.INTEGER;
					const stat_label = STAT_LABELS[_stat] ?? key;
					const stat_value_label = formatValue(value_format, value as string);

					const titan_key = 'titan_' + _stat;
					const titan_label = 'Titan ' + stat_label;
					const titan_value = getTitanValue(_stat, Number(value));
					const titan_value_label = formatValue(value_format, titan_value.toString());

					stats.push({
						stat: _stat,
						stat_label,
						value: value as number,
						value_label: stat_value_label,
						roll: getRollValue(_stat, Number(value)),
						titan_stat_label: titan_label,
						titan_value_label: titan_value_label
					});

					// normal stat
					derived.push({
						stat: _stat,
						stat_label,
						value: value as number,
						value_label: stat_value_label
					});

					// titan stat
					derived.push({
						stat: titan_key as TitanStat,
						stat_label: titan_label,
						value: titan_value,
						value_label: titan_value_label
					});

					hash += _stat + value.toString();

					break;
			}
		});
		stats.sort((a, b) => (b.roll ?? 0) - (a.roll ?? 0));

		// TODO: add other derived stats

		console.log('Created GearView for ', id, ':', stats);
		return {
			id,
			part,
			stats,
			hash,
			derived
		};
	}

	function addNewGear(gear: UserGear) {
		createGearView(gear).then((gearView) => {
			if (gear_views.some((gv) => gv.hash === gearView.hash)) {
				console.log('GearView already exists!');
				processText = 'Duplicate gear!';
				return;
			}

			user_gears.push(gear);
			gear_views.push(gearView);
			saveObject(StorageKey.GEARS_V1, user_gears);
		});
	}

	function renumberGears(start: number = 0) {
		if (start == user_gears.length) {
			// no need to renumber if removing the last index
			return;
		}

		for (let i = start; i < user_gears.length; i++) {
			user_gears[i].id--;
		}

		// iterate through gear_views, if gv_id > start, then gv_id--
		for (let i = 0; i < gear_views.length; i++) {
			if (gear_views[i].id > start) {
				gear_views[i].id--;
			}
		}
	}

	function removeGear(id: number) {
		user_gears = user_gears.filter((gear) => gear.id !== id);
		gear_views = gear_views.filter((gear) => gear.id !== id);

		renumberGears(id);

		saveObject(StorageKey.GEARS_V1, user_gears);
	}

	// OCR
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

		const id = user_gears.length;
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
					const _val = _spl[1].split(' ')[0].replace('%', '').replace(',', '').trim();
					// add .split(' ')[0] to remove random crap after the numbers

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

	async function onGearSearch(query: string) {
		console.log('Search query:', query);

		isSearching = true;
		searchDialogOpen = false;

		if (query === prev_search_query) {
			console.log('Search query is the same as before!');
			return;
		}

		function doFiltering(gear: GearView) {
			const stats = gear.derived.filter((stat) => stat.stat === query);
			if (stats[0]) {
				console.log(stats);
				search_views.push({
					id: gear.id,
					part: gear.part,
					stats
				});
			}
		}

		gear_views.map(doFiltering);
		console.log(search_views);
	}

	// register
	let bound_objects = $state({
		fourStatMode: isMobile ? false : true,
		iconStats: isMobile ? true : false,
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
				id: 'search',
				label: 'Search & Sort',
				lucide: SearchSlashIcon,
				type: ActionType.BUTTON,
				callback: () => (searchDialogOpen = true)
			},
			{
				id: 'fourStatMode',
				label: 'Extended Stats',
				type: ActionType.TOGGLE,
				callback: () => {
					bound_objects.fourStatMode = !bound_objects.fourStatMode;
					hasMeasured = false;
				},
				lucide_on: LayoutGridIcon,
				lucide_off: SquareIcon
			},
			{
				id: 'iconStats',
				label: 'Icon Stats',
				type: ActionType.TOGGLE,
				callback: () => {
					bound_objects.iconStats = !bound_objects.iconStats;
					hasMeasured = false;
				},
				lucide_on: DiamondIcon,
				lucide_off: CaseSensitiveIcon
			},
			{
				id: 'titanMode',
				label: 'Titan Stats',
				type: ActionType.TOGGLE,
				callback: () => {
					bound_objects.titanMode = !bound_objects.titanMode;
					hasMeasured = false;
				},
				lucide_on: SparklesIcon,
				lucide_off: SparkleIcon
			},
			{
				id: 'clearGears',
				label: 'Clear List',
				lucide: Trash2Icon,
				type: ActionType.BUTTON,
				callback: () => {
					user_gears = [];
					gear_views = [];
					saveObject(StorageKey.GEARS_V1, user_gears);
				}
			}
		]
	};

	onMount(() => {
		registerComponent(id, metadata);
		Promise.all(user_gears.map((gear) => createGearView(gear))).then((gearViews) => {
			gear_views = gearViews;
			console.log('Done processing user_gears');
		});
	});
</script>

<div class="gear-page">
	<div class="gear-settings">
		<h1 class="Pro">Gear List</h1>
	</div>

	<div class="gear-grid">
		<FlexGrid maxColumns={4} verticalGap="0rem" horizontalGap="5rem" bind:hasMeasured>
			{#if user_gears.length !== 0 && !isSearching}
				{#each gear_views as gear}
					<div class="gear-cell gear-id-{gear.id}">
						<div class="gear-icon">
							<div class="icon-container">
								<img
									src="./{bound_objects.titanMode ? 'titan_gear' : 'gear'}/{gear.part}.png"
									alt="Gear"
								/>
							</div>
						</div>

						{#if bound_objects.fourStatMode}
							<div class="stats-container">
								<div class="stats-grid">
									{#each GRID_ORDERING as item}
										<div class="stat-item {item.position}">
											<div class="stat-content" class:icon={bound_objects.iconStats}>
												{#if bound_objects.iconStats}
													<div class="stat-icon">
														<StatIcon stat={gear.stats[item.index].stat} size="75%" />
													</div>
												{:else}
													{gear.stats[item.index].stat_label ?? ''}
												{/if}

												{#if bound_objects.titanMode}
													+{gear.stats[item.index].titan_value_label ?? ''}
												{:else}
													+{gear.stats[item.index].value_label ?? ''}
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="single-stat">
								<div class="stat-content" class:icon={bound_objects.iconStats}>
									{#if bound_objects.iconStats}
										<div class="stat-icon">
											<StatIcon stat={gear.stats[0].stat} size="75%" />
										</div>
									{:else}
										{gear.stats[0].stat_label ?? ''}
									{/if}
									{#if bound_objects.titanMode}
										+{gear.stats[0].titan_value_label ?? ''}
									{:else}
										+{gear.stats[0].value_label ?? ''}
									{/if}
								</div>
							</div>
						{/if}

						<div class="gear-actions">
							<button class="gear-action" title="Remove Gear" onclick={() => removeGear(gear.id)}>
								<Trash2Icon />
							</button>
						</div>
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
						<div class="stat">No gears to show here!</div>
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

<GearSearch bind:open={searchDialogOpen} onConfirmSearch={onGearSearch} />

<ActionToolbar actions={metadata.actions} bind:bound_objects bind:isMobile />

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
		/* overflow-y: scroll; */
		overflow-x: hidden;
		border-top: 4px solid var(--border-color);
	}

	.gear-cell {
		background-color: var(--bg-color);
		display: flex;
		flex-direction: row;
		/* width: 80%; */
		max-width: 100%;
		min-width: 0;
		/* border: 2px solid #000; */
		padding: 1rem;
		border-bottom: 2px solid var(--border-color);
		align-items: center;
	}

	.gear-icon {
		width: 5rem;
		/* min-width: 130px; */
		margin-right: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
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
		min-width: 0;
		display: flex;
		align-items: center;
		overflow: hidden;
		text-overflow: ellipsis;
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

	.stat-icon {
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-content {
		/* padding: 5px; */
		font-size: large;
		text-align: center;
	}

	.stat-content.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: large;
		text-align: center;
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

	.gear-actions {
		margin-left: 1rem;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
	}

	.gear-action {
		display: flex;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
</style>
