<script lang="ts">
	import {
		ALL_STATS_REGEX,
		GearPart,
		type GearSearchView,
		type GearView,
		type GearViewStatLong,
		type GearViewStatShort,
		type UserGear,
		type ValidGearPart
	} from '$lib/scripts/gears.ts';
	import { saveObject } from '$lib/scripts/loader.ts';
	import {
		STAT_CONSTANTS,
		STAT_LABELS,
		type AllStats,
		type StatGearUser as Stat,
		type StatGearTitan as TitanStat
	} from '$lib/scripts/stats.ts';

	import {
		ActionType,
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/navMetadata.svelte.ts';
	import { Format, formatValue } from '$lib/scripts/validation.ts';

	import type { AllLoadouts } from '$lib/scripts/loadouts';
	import {
		CaseSensitiveIcon,
		DiamondIcon,
		ImagePlusIcon,
		LayoutGridIcon,
		SearchIcon,
		SearchXIcon,
		Shirt,
		ShirtIcon,
		SparkleIcon,
		SparklesIcon,
		SquareIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';
	import ActionToolbar from '../ActionToolbar.svelte';
	import GearInfo from '../dialog/GearInfo.svelte';
	import GearSearch from '../dialog/GearSearch.svelte';
	import UploadScreenshot from '../dialog/UploadScreenshot.svelte';
	import FlexGrid from '../FlexGrid.svelte';
	import StatIcon from '../StatIcon.svelte';

	let {
		isMobile = $bindable(false),
		user_gears = $bindable([] as UserGear[]),
		user_loadouts = $bindable({} as AllLoadouts),
		current_loadout = $bindable('')
	} = $props();

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

	// Gear Info Dialog
	let gearInfoDialogOpen = $state(false);
	let gearInfoGear: GearView | null = $state(null);

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

	const OCR_PART_MAP: Record<string, GearPart> = {
		helm: GearPart.HELMET,
		helmet: GearPart.HELMET,
		spaulders: GearPart.SPAULDERS,
		armor: GearPart.ARMOR,
		bracers: GearPart.BRACERS,
		armbands: GearPart.BRACERS,
		belt: GearPart.BELT,
		legguards: GearPart.LEGGUARDS,
		//
		handguards: GearPart.GLOVES,
		sabatons: GearPart.BOOTS,
		//
		eyepiece: GearPart.VISOR,
		engine: GearPart.ENGINE,
		exoskeleton: GearPart.EXOSKELETON,
		microreactor: GearPart.REACTOR
	};

	const RAINBOW_TITAN_STATS: TitanStat[] = [
		'titan_flame_atk',
		'titan_frost_atk',
		'titan_volt_atk',
		'titan_phys_atk'
	];

	function getRollValue(stat: Stat, value: number): number {
		const stc = STAT_CONSTANTS[stat];
		return ((value - stc.base) * 2) / (stc.high_roll + stc.low_roll);
	}

	function getTitanValue(stat: Stat, value: number): number {
		const stc = STAT_CONSTANTS[stat];
		return stc.titan_base + stc.titan_multiplier * (value - stc.base);
	}

	function reverseTitanValue(stat: Stat, titanValue: number): number {
		const stc = STAT_CONSTANTS[stat];
		return (
			(titanValue - stc.titan_base + stc.titan_multiplier * stc.base) / (1 + stc.titan_multiplier)
		);
	}

	function decrementGearId(start: number = 0) {
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

		// same with search_views
		for (let i = 0; i < search_views.length; i++) {
			if (search_views[i].id > start) {
				search_views[i].id--;
			}
		}

		// same with user_loadouts
		for (const key in user_loadouts) {
			for (const gearKey in user_loadouts[key].equipped_gear) {
				if (
					user_loadouts[key].equipped_gear[gearKey as ValidGearPart] !== null &&
					// @ts-expect-error
					user_loadouts[key].equipped_gear[gearKey as ValidGearPart] > start
				) {
					// @ts-expect-error
					user_loadouts[key].equipped_gear[gearKey as ValidGearPart]--;
				}
			}
		}

		saveObject('loadouts_v1', user_loadouts);
	}

	async function createGearView(gear: UserGear, equip: boolean = false): Promise<GearView> {
		const stats: GearViewStatLong[] = [];
		const derived: GearViewStatShort[] = [];
		let id: number = -1;
		let part: GearPart = GearPart.UNKNOWN;
		let hash = '';

		Object.entries(gear).forEach(([key, value]) => {
			switch (key) {
				case 'id':
					id = value as number;
					break;
				case 'part':
					part = value as GearPart;
					hash += value;
					break;
				case 'dateAdded':
					break;
				default:
					const isTitan = key.startsWith('titan_');
					const value_format = key.includes('_percent') ? Format.FLOAT_PERCENT_3D : Format.INTEGER;

					let _stat: Stat;
					let _stat_value: number;
					let stat_label: string;
					let stat_value_label: string;

					let titan_key: TitanStat;
					let titan_label: string;
					let titan_value: number;
					let titan_value_label: string;

					if (isTitan) {
						// derive normal stat from corresponding titan stat
						titan_key = key as TitanStat;
						titan_label = STAT_LABELS[titan_key] ?? key;
						titan_value = Number(value);
						titan_value_label = formatValue(value_format, value as string);

						_stat = key.replace('titan_', '') as Stat;
						_stat_value = reverseTitanValue(_stat, titan_value);
						stat_label = STAT_LABELS[_stat] ?? key;
						stat_value_label = formatValue(value_format, _stat_value.toString());
					} else {
						_stat = key as Stat;
						_stat_value = Number(value);
						stat_label = STAT_LABELS[_stat] ?? key;
						stat_value_label = formatValue(value_format, _stat_value.toString());

						titan_key = 'titan_' + _stat;
						titan_label = 'Titan ' + stat_label;
						titan_value = getTitanValue(_stat, _stat_value) + _stat_value;
						titan_value_label = formatValue(value_format, titan_value.toString());
					}

					stats.push({
						stat: _stat,
						stat_label,
						value: _stat_value,
						value_label: stat_value_label,
						roll: getRollValue(_stat, _stat_value),
						titan_stat_label: titan_label,
						titan_value_label: titan_value_label
					});

					// normal stat
					derived.push({
						stat: _stat,
						stat_label,
						value: _stat_value,
						value_label: stat_value_label
					});

					// titan stat
					derived.push({
						stat: titan_key as TitanStat,
						stat_label: titan_label,
						value: titan_value,
						value_label: titan_value_label
					});

					hash += _stat + stat_value_label;

					break;
			}
		});
		stats.sort((a, b) => (b.roll ?? 0) - (a.roll ?? 0));

		// get highest roll stat
		const bestRoll = stats[0];

		if (bestRoll.stat.includes('_atk') && !bestRoll.stat.includes('percent')) {
			const eleAtkStats = stats.filter(
				(stat) => stat.stat.includes('_atk') && !stat.stat.includes('percent')
			);

			if (eleAtkStats.length >= 2) {
				// rainbow gear!

				const rainbowTitanValue =
					getTitanValue(bestRoll.stat, bestRoll.value) * 0.95 + bestRoll.value;
				const rainbowTitanValueLabel = formatValue(Format.INTEGER, rainbowTitanValue.toString());
				RAINBOW_TITAN_STATS.forEach((rainbowStat) => {
					const statIdx = derived.findIndex((der) => der.stat === rainbowStat);

					if (statIdx === -1) {
						// add rainbow stat if missing
						derived.push({
							stat: rainbowStat,
							stat_label: STAT_LABELS[rainbowStat],
							value: rainbowTitanValue,
							value_label: rainbowTitanValueLabel
						});
					} else {
						// replace value if rainbow is higher
						if (rainbowTitanValue > derived[statIdx].value) {
							derived[statIdx].value = rainbowTitanValue;
							derived[statIdx].value_label = rainbowTitanValueLabel;
						}
					}
				});
			}

			// todo: the same for atk%
		}

		// TODO: add other derived stats

		const isEquipped =
			equip ||
			(part !== GearPart.UNKNOWN &&
				user_loadouts[current_loadout].equipped_gear[gear.part as ValidGearPart] === gear.id);

		return {
			id,
			part,
			stats,
			hash,
			derived,
			isEquipped
		};
	}

	function addNewGear(gear: UserGear, equip: boolean = false) {
		createGearView(gear, equip).then((gearView) => {
			if (gear_views.some((gv) => gv.hash === gearView.hash)) {
				console.log('GearView already exists!');
				processText = 'Duplicate gear!';
				return;
			}

			user_gears.push(gear);
			gear_views.push(gearView);
			if (equip) {
				equipGear(gear.id);
			}
			saveObject('gears_v1', user_gears);

			// reset searching after adding gear
			search_views = [];
			prev_search_query = '';
			isSearching = false;
		});
	}

	function equipGear(id: number) {
		// search for equipped gear with same part
		if (gear_views[id].part === GearPart.UNKNOWN) {
			console.error('Cannot equip UNKNOWN gear!');
			return;
		}

		const previousPart = user_loadouts[current_loadout].equipped_gear[gear_views[id].part];
		if (previousPart !== null) {
			gear_views[previousPart].isEquipped = false;
		}

		user_loadouts[current_loadout].equipped_gear[gear_views[id].part] = id;
		gear_views[id].isEquipped = true;
		saveObject('loadouts_v1', user_loadouts);
	}

	function removeGear(id: number) {
		if (gear_views[id].part !== GearPart.UNKNOWN) {
			user_loadouts[current_loadout].equipped_gear[gear_views[id].part] = null;
		}
		user_gears = user_gears.filter((gear) => gear.id !== id);
		gear_views = gear_views.filter((gear) => gear.id !== id);
		search_views = search_views.filter((gear) => gear.id !== id);

		// simple renumbering
		decrementGearId(id);

		saveObject('gears_v1', user_gears);
		saveObject('loadouts_v1', user_loadouts);
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

		const partCleanedStr = txt[0]
			.replace('titan ', '')
			.replace('fortress ', '')
			.replace('tactics ', '')
			.replace('combat ', '')
			.split(' ')[0];
		const part = OCR_PART_MAP[partCleanedStr] ?? GearPart.UNKNOWN;
		const isTitan = txt[0].includes('titan');
		const equip =
			txt[0].includes('equipped') && // check if any gear is equipped in current loadout
			part !== GearPart.UNKNOWN &&
			user_loadouts[current_loadout].equipped_gear[part] === null;
		const dateAdded = new Date();

		// console.log('part text clean', partCleanedStr);
		// console.log('Titan', isTitan);
		// console.log('Equipped', equip);
		// console.log('Text has equip', txt[0].includes('equipped'));
		// console.log('Part is null', user_loadouts[current_loadout].equipped_gear[part] === null);
		// console.log('TEXT', txt);

		const newGear: UserGear = {
			id,
			part,
			dateAdded
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
					const _stat =
						(isTitan ? 'titan_' : '') + _base + (_spl[1].includes('%') ? '_percent' : '');
					const _val = _spl[1].split(' ')[0].replace('%', '').replace(',', '').trim();

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
			return;
		}

		addNewGear(newGear, equip);
		processText = 'Done!';
	}

	function onFileUpload(canvas: HTMLCanvasElement) {
		if (uploadedImageURL && canvas) {
			doGearOCR(canvas);
		}
	}

	async function simpleGearSearch(query: AllStats) {
		console.log('Simple search query:', query);

		search_views = [];
		prev_search_query = query;

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
		search_views.sort((a, b) => b.stats[0].value - a.stats[0].value);
	}

	async function advancedGearSearch(query: string) {
		console.log('Advanced search query:', query);

		search_views = [];
		prev_search_query = query;

		const extractedVars = [...new Set(query.match(ALL_STATS_REGEX))] as AllStats[];

		function doFiltering(gear: GearView) {
			const variables: { [key in AllStats]?: number } & { gear?: GearPart } = {};

			extractedVars.forEach((varName) => {
				variables[varName] = gear.derived.find((stat) => stat.stat === varName)?.value ?? 0;
			});
			// override for gear
			variables.gear = gear.part;

			// @ts-expect-error
			const new_query = query.replace(ALL_STATS_REGEX, (match) => variables[match].toString());
			const result = eval(new_query);

			if (result) {
				search_views.push({
					id: gear.id,
					part: gear.part,
					stats: [
						{
							stat: 'atk',
							stat_label: 'Result',
							value: result,
							value_label: result.toFixed(2).toString()
						}
					]
				});
			}
		}

		gear_views.map(doFiltering);
		search_views.sort((a, b) => b.stats[0].value - a.stats[0].value);
	}

	async function onGearSearch(query: string) {
		isSearching = true;
		searchDialogOpen = false;

		// disable these while in search mode
		bound_objects.fourStatMode = false;
		bound_objects.titanMode = false;

		if (query === prev_search_query) {
			console.log('Search query is the same as before!');
			return;
		}

		await advancedGearSearch(query as AllStats);
	}

	function showGearInfo(gear: GearView) {
		gearInfoGear = gear;
		gearInfoDialogOpen = true;
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
		actions: [
			// {
			// 	id: 'screenshot',
			// 	label: 'From Screenshot',
			// 	lucide: ImagePlusIcon,
			// 	type: ActionType.BUTTON,
			// 	callback: () => (screenshotDialogOpen = true)
			// },
			// {
			// 	id: 'search',
			// 	label: 'Search & Sort',
			// 	lucide: SearchIcon,
			// 	type: ActionType.BUTTON,
			// 	callback: () => (searchDialogOpen = true)
			// },
			{
				id: 'fourStatMode',
				label: 'Extended Stats',
				type: ActionType.TOGGLE,
				callback: () => {
					if (isSearching) {
						return;
					}
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
					if (isSearching) {
						return;
					}

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
					saveObject('gears_v1', user_gears);
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
		<h1>Gear List</h1>
		{#if isSearching}
			<p>Searching for: {prev_search_query}</p>

			<button class="border stop-search" id="stop-search" onclick={() => (isSearching = false)}>
				<SearchXIcon />
				<label class="in-button" for="stop-search"> Stop Searching </label>
			</button>
		{:else}
			<div class="horizontal">
				<button class="border" id="start-search" onclick={() => (searchDialogOpen = true)}>
					<SearchIcon />
					<label class="in-button" for="start-search">Search Gear</label>
				</button>
				<button class="border" id="add-gear" onclick={() => (screenshotDialogOpen = true)}>
					<ImagePlusIcon />
					<label class="in-button" for="add-gear">Add Gear</label>
				</button>
			</div>
		{/if}
	</div>

	<div class="gear-grid">
		<FlexGrid
			by_column={false}
			maxColumns={4}
			verticalGap="0rem"
			horizontalGap="5rem"
			bind:hasMeasured
		>
			{#if gear_views.length !== 0 && !isSearching}
				{#each gear_views as gear}
					<div class="gear-cell gear-id-{gear.id}">
						<span>{gear.id}</span>
						<div class="gear-icon">
							<div class="icon-container">
								<!-- TODO: dialog for this button -->
								<button
									class="gear-button icon"
									onclick={() => showGearInfo(gear)}
									style="opacity: 1"
								>
									<img
										src="./{bound_objects.titanMode ? 'titan_gear' : 'gear'}/{gear.part}.png"
										alt="Gear"
									/>
								</button>
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

						{#if !isMobile}
							<div class="gear-actions">
								<button class="gear-action" title="Remove Gear" onclick={() => removeGear(gear.id)}>
									<Trash2Icon />
								</button>
								<button
									class="gear-action"
									class:no-pointer={gear.isEquipped}
									title="Equip Gear"
									onclick={() => (gear.isEquipped ? {} : equipGear(gear.id))}
								>
									<ShirtIcon opacity={gear.isEquipped ? 0.5 : 1} />
								</button>
							</div>
						{/if}
					</div>
				{/each}
			{:else if search_views.length !== 0 && isSearching}
				{#each search_views as gear}
					<div class="gear-cell gear-id-{gear.id}">
						<span>{gear.id}</span>
						<div class="gear-icon">
							<div class="icon-container">
								<img
									src="./{bound_objects.titanMode ? 'titan_gear' : 'gear'}/{gear.part}.png"
									alt="Gear"
								/>
							</div>
						</div>

						<div class="single-stat">
							<div class="stat-content" class:icon={bound_objects.iconStats}>
								{#if bound_objects.iconStats}
									<div class="stat-icon">
										<StatIcon stat={gear.stats[0].stat.replace('titan_', '') as Stat} size="75%" />
									</div>
								{:else}
									{gear.stats[0].stat_label ?? ''}
								{/if}
								+{gear.stats[0].value_label ?? ''}
							</div>
						</div>

						<div class="gear-actions">
							<button class="gear-action" title="Remove Gear" onclick={() => removeGear(gear.id)}>
								<Trash2Icon />
							</button>
							<button
								class="gear-action"
								class:no-pointer={gear_views[gear.id].isEquipped}
								title="Equip Gear"
								onclick={() => (gear_views[gear.id].isEquipped ? {} : equipGear(gear.id))}
							>
								<ShirtIcon opacity={gear_views[gear.id].isEquipped ? 0.5 : 1} />
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

<GearInfo
	bind:open={gearInfoDialogOpen}
	bind:gear={gearInfoGear}
	bind:isMobile
	bind:user_gears
	bind:gear_views
	onRemoveGear={removeGear}
	onEquipGear={equipGear}
/>

<GearSearch bind:open={searchDialogOpen} bind:isMobile onConfirmSearch={onGearSearch} />

<ActionToolbar actions={metadata.actions} bind:bound_objects bind:isMobile />

<style>
	.gear-page {
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
		gap: 0.5rem;
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

	.gear-action.no-pointer {
		cursor: auto;
	}

	.stop-search {
		display: flex;
		background: none;
		border: 2px solid var(--border-color);
		border-radius: 0.25rem;
		cursor: pointer;
		padding: 0.5rem;
		height: 100%;
		align-items: center;
		justify-content: center;
		background-color: rgb(125 58 58);
		color: var(--text-color);
	}
</style>
