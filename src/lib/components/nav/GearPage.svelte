<script lang="ts">
	import ActionToolbar from '$lib/components/ActionToolbar.svelte';
	import GearInfo from '$lib/components/dialog/GearInfo.svelte';
	import GearSearch from '$lib/components/dialog/GearSearch.svelte';
	import UploadScreenshot from '$lib/components/dialog/UploadScreenshot.svelte';
	import FlexGrid from '$lib/components/FlexGrid.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import {
		ALL_STATS_REGEX,
		createGearView,
		GearPart,
		VALID_GEAR_PARTS
	} from '$lib/scripts/gears.ts';
	import { loadGearImages, loadStatIcons, saveObject } from '$lib/scripts/loader.ts';
	import { ActionType } from '$lib/scripts/nav-metadata';
	import {
		current_loadout,
		gear_page_loaded,
		gear_search_dialog_open,
		gear_views,
		is_mobile,
		user_gears,
		user_loadouts
	} from '$lib/scripts/stores';
	import type {
		AllStats,
		GearAugment,
		GearSearchView,
		GearView,
		StatGearUser as Stat,
		UserGear,
		ValidGearPart
	} from '$lib/types/index';
	import { eval as evil, parse } from '@casbin/expression-eval';
	import {
		CaseSensitiveIcon,
		DiamondIcon,
		ImagePlusIcon,
		LayoutGridIcon,
		SearchIcon,
		SearchXIcon,
		ShirtIcon,
		SlashIcon,
		SparkleIcon,
		SparklesIcon,
		SquareIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	import { createWorker } from 'tesseract.js';

	let prev_search_query: string = $state('');
	let search_views: GearSearchView[] = $state([]);

	let is_showing_equipped_gears = $state(false);
	let equipped_gears: number[] = $state([]);
	let span_length = $derived(Math.ceil(Math.log10($gear_views.length || 10)) + 1);

	// Screenshot Dialog
	let screenshot_dialog_open = $state(false);
	let uploaded_image_url: string = $state('');
	let process_text: string = $state('');

	// Search Dialog
	let search_dialog_open = $state(false);
	let is_searching = $state(false);

	// Gear Info Dialog
	let gear_info_dialog_open = $state(false);
	let gear_info_index = $state(-1);

	let has_measured = $state(false); // for triggering flexGrid itemWidth update

	// html
	const GRID_ORDERING = [
		{ position: 'top-left', index: 0 },
		{ position: 'top-right', index: 2 },
		{ position: 'bottom-left', index: 1 },
		{ position: 'bottom-right', index: 3 }
	];

	const OCR_RANDOM_STAT_MAP: Record<string, string> = {
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
	};

	const OCR_AUGMENT_STAT_MAP: Record<string, GearAugment> = {
		delay: 'delay',
		'increased healing': 'increased_healing',
		lifesteal: 'lifesteal',
		'hp recovery': 'hp_recovery',
		block: 'block',
		'damage reduction': 'dmg_reduction',
		'damage boost': 'dmg_boost',
		'weak point damage boost': 'weakpoint',
		'normal attack damage boost': 'normal_atk_dmg_boost',
		'dodge attack damage boost': 'dodge_atk_dmg_boost',
		'skill damage boost': 'skill_dmg_boost',
		'discharge damage boost': 'discharge_dmg_boost'
	};

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

	function decrementGearId(start: number = 0) {
		if (start == $user_gears.length) {
			// no need to renumber if removing the last index
			return;
		}

		for (let i = start; i < $user_gears.length; i++) {
			$user_gears[i].id--;
		}

		// iterate through $gear_views, if gv_id > start, then gv_id--
		for (let i = 0; i < $gear_views.length; i++) {
			if ($gear_views[i].id > start) {
				$gear_views[i].id--;
			}
		}

		// same with search_views
		for (let i = 0; i < search_views.length; i++) {
			if (search_views[i].id > start) {
				search_views[i].id--;
			}
		}

		// same with $user_loadouts
		for (const key in $user_loadouts) {
			for (const gearKey in $user_loadouts[key].equipped_gears) {
				if (
					$user_loadouts[key].equipped_gears[gearKey as ValidGearPart] !== null &&
					// @ts-expect-error
					$user_loadouts[key].equipped_gears[gearKey as ValidGearPart] > start
				) {
					// @ts-expect-error
					$user_loadouts[key].equipped_gears[gearKey as ValidGearPart]--;
				}
			}
		}

		saveObject('loadouts_v1', $user_loadouts);
	}

	function addNewGear(gear: UserGear, equip: boolean = false) {
		createGearView(gear, equip).then((gearView) => {
			if ($gear_views.some((gv) => gv.hash === gearView.hash)) {
				console.log('GearView already exists!');
				process_text = 'Duplicate gear!';
				return;
			}

			// force update
			user_gears.update((gears) => [...gears, gear]);
			gear_views.update((views) => [...views, gearView]);

			if (equip) {
				equipGear(gear.id);
			}
			saveObject('gears_v1', $user_gears);

			// reset searching after adding gear
			search_views = [];
			prev_search_query = '';
			is_searching = false;
			console.log('Gear added!');
		});
	}

	function equipGear(id: number) {
		// search for equipped gear with same part
		const part = $gear_views[id].part;
		if (part === GearPart.UNKNOWN) {
			console.error('Cannot equip UNKNOWN gear!');
			return;
		}

		const prevEquippedGearId = $user_loadouts[$current_loadout].equipped_gears[part];
		if (prevEquippedGearId !== null) {
			unequipGear(prevEquippedGearId, false);
		}

		$user_loadouts[$current_loadout].equipped_gears[part] = id;
		$gear_views[id].isEquipped = true;
		saveObject('loadouts_v1', $user_loadouts);
	}

	function unequipGear(id: number, saveAfter: boolean = true) {
		const part = $gear_views[id].part;
		if (part === GearPart.UNKNOWN || id === -1) {
			return;
		}

		$user_loadouts[$current_loadout].equipped_gears[part] = null;
		$gear_views[id].isEquipped = false;

		if (saveAfter) {
			saveObject('loadouts_v1', $user_loadouts);
		}

		updateEquippedGears();
	}

	function removeGear(id: number) {
		if ($gear_views[id].part !== GearPart.UNKNOWN) {
			$user_loadouts[$current_loadout].equipped_gears[$gear_views[id].part] = null;
		}
		$user_gears = $user_gears.filter((gear) => gear.id !== id);
		$gear_views = $gear_views.filter((gear) => gear.id !== id);
		search_views = search_views.filter((gear) => gear.id !== id);

		// simple renumbering
		decrementGearId(id);

		saveObject('gears_v1', $user_gears);
		saveObject('loadouts_v1', $user_loadouts);

		updateEquippedGears();
	}

	// TODO: USE EQUIPPED GEARS FROM STORE
	function updateEquippedGears() {
		equipped_gears = [];
		for (const part in VALID_GEAR_PARTS) {
			const gearId = $user_loadouts[$current_loadout].equipped_gears[VALID_GEAR_PARTS[part]];
			if (gearId !== null) {
				equipped_gears.push(gearId);
			} else {
				equipped_gears.push(-1);
			}
		}
	}

	// OCR
	async function doGearOCR(canvas: HTMLCanvasElement) {
		const worker = await createWorker('eng');
		const data_url = canvas.toDataURL();

		process_text = 'Detecting fields...';
		const ret = await worker.recognize(data_url);

		await worker.terminate();

		let txt = ret.data.text
			.toLowerCase()
			.replace(/^[^\s]{1,3} /gm, '') // remove 2-3 characters followed by space at the start of a line
			.split('\n'); // those characters are noise from trying to read symbols

		const random_stats_index = txt.findIndex((line) => line.includes('random stats'));
		const augment_stat_index = txt.findIndex((line) => line.includes('augmentation stats'));

		const id = $user_gears.length;

		const partCleanedStr = txt[0]
			.replace('titan ', '')
			.replace('fortress ', '')
			.replace('tactics ', '')
			.replace('combat ', '')
			.split(' ')[0];
		const part = OCR_PART_MAP[partCleanedStr] ?? GearPart.UNKNOWN;
		const isTitan = txt[0].includes('titan') || augment_stat_index !== -1; // also include augmented gear as titan
		const equip =
			txt[0].includes('equipped') && // check if any gear is equipped in current loadout
			part !== GearPart.UNKNOWN &&
			$user_loadouts[$current_loadout].equipped_gears[part] === null;
		const dateAdded = new Date().toISOString();

		const newGear: UserGear = {
			id,
			part,
			dateAdded
		};

		// console.log('part text clean', partCleanedStr);
		// console.log('Titan', isTitan);
		// console.log('Equipped', equip);
		// console.log('Text has equip', txt[0].includes('equipped'));
		// console.log('Part is null', $user_loadouts[$current_loadout].equipped_gear[part] === null);
		console.log('TEXT', txt);

		let foundStats = 0;
		if (random_stats_index) {
			const statLines = txt.slice(random_stats_index + 1);

			for (let _i = 0; _i < statLines.length; _i++) {
				const line = statLines[_i];

				const _spl = line.split('+');

				const _base = OCR_RANDOM_STAT_MAP[_spl[0].trim()];
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

					console.log('Found all stats, assuming we are done here.');
					break;
				}
			}

			if (foundStats < 4) {
				console.error('Found less than 4 stats!');
				process_text = 'Failed to OCR!';
				return;
			} else {
				console.log('Found all stats?', foundStats);
			}
		} else {
			console.error('I CANT FIND RANDOM STATS!');
			console.error('Perhaps I should go for reverse order...');
			console.error('(I havent encountered this yet)');
			return;
		}

		if (augment_stat_index) {
			const augmentLines = txt.slice(augment_stat_index + 1);

			for (let _i = 0; _i < augmentLines.length; _i++) {
				const line = augmentLines[_i];

				const _spl = line.split('+');
				const _base = OCR_AUGMENT_STAT_MAP[_spl[0].trim()];
				if (_spl[1] && _base) {
					newGear.augment = [_base, parseInt(_spl[1].trim())];
					console.log('Found augment.');
					break;
				}
			}
		}

		addNewGear(newGear, equip);
		process_text = 'Done!';
	}

	function onFileUpload(canvas: HTMLCanvasElement) {
		if (uploaded_image_url && canvas) {
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

		$gear_views.map(doFiltering);
		search_views.sort((a, b) => b.stats[0].value - a.stats[0].value);
	}

	async function advancedGearSearch(query: string) {
		console.log('Advanced search query:', query);

		search_views = [];
		prev_search_query = query;

		const extractedVars = [...new Set(query.match(ALL_STATS_REGEX))] as AllStats[];

		function doFiltering(gear: GearView) {
			const variables: { [key in AllStats]?: number } & {
				gear?: ValidGearPart;
				isEquipped?: number;
			} = {};

			extractedVars.forEach((varName) => {
				variables[varName] = gear.derived.find((stat) => stat.stat === varName)?.value ?? 0;
			});
			// override for gear
			if (gear.part === GearPart.UNKNOWN) {
				return;
			}
			variables.gear = gear.part;
			variables.isEquipped = gear.isEquipped ? 1 : 0;

			// @ts-expect-error
			console.log('query', query);
			console.log('variables', variables);
			const new_query = query.replace(ALL_STATS_REGEX, (match) => variables[match].toString());
			console.log('new_query', new_query);
			const result = evil(parse(new_query), {});

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

		$gear_views.map(doFiltering);
		search_views.sort((a, b) => b.stats[0].value - a.stats[0].value);
	}

	async function onGearSearch(query: string) {
		is_searching = true;
		search_dialog_open = false;

		// disable these while in search mode
		bound_objects.fourStatMode = false;
		bound_objects.titanMode = false;

		if (query === prev_search_query) {
			console.log('Search query is the same as before!');
			return;
		}

		await advancedGearSearch(query as AllStats);
	}

	function showGearInfo(index: number) {
		gear_info_index = index;
		gear_info_dialog_open = true;
	}

	onDestroy(() => {
		$gear_page_loaded = false;
	});

	// register
	let bound_objects = $state({
		fourStatMode: $is_mobile ? false : true,
		iconStats: $is_mobile ? true : false,
		titanMode: false
	});

	const ACTIONS = [
		{
			id: 'fourStatMode',
			label: 'Extended Stats',
			type: ActionType.TOGGLE,
			callback: () => {
				if (is_searching) {
					return;
				}
				bound_objects.fourStatMode = !bound_objects.fourStatMode;
				has_measured = false;
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
				has_measured = false;
			},
			lucide_on: DiamondIcon,
			lucide_off: CaseSensitiveIcon
		},
		{
			id: 'titanMode',
			label: 'Titan Stats',
			type: ActionType.TOGGLE,
			callback: () => {
				if (is_searching) {
					return;
				}

				bound_objects.titanMode = !bound_objects.titanMode;
				has_measured = false;
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
				$user_gears = [];
				$gear_views = [];
				saveObject('gears_v1', $user_gears);
			}
		}
	];

	$effect(() => {
		$gear_search_dialog_open = search_dialog_open;
	});
</script>

{#snippet gear_actions(gear: GearView)}
	{#if gear}
		<div class="gear-actions">
			<button class="gear-action" title="Remove Gear" onclick={() => removeGear(gear.id)}>
				<Trash2Icon />
			</button>
			<button
				class="gear-action"
				title={gear.isEquipped ? 'Unequip Gear' : 'Equip Gear'}
				onclick={() => (gear.isEquipped ? unequipGear(gear.id) : equipGear(gear.id))}
			>
				<div style="position: relative; height: 24px;">
					<ShirtIcon />
					{#if gear.isEquipped}
						<div style="position: absolute; top: 0%; left: 0%;">
							<SlashIcon />
						</div>
					{/if}
				</div>
			</button>
		</div>
	{/if}
{/snippet}

{#snippet gear_icon(gear: GearView, partIfNoGear: ValidGearPart = GearPart.HELMET)}
	<div class="gear-icon">
		<div class="icon-container">
			{#if gear}
				<button class="gear-button icon" onclick={() => showGearInfo(gear.id)} style="opacity: 1">
					<img
						src="./{bound_objects.titanMode ? 'gear/titan' : 'gear'}/{gear.part}.png"
						alt="Gear"
					/>
				</button>
			{:else}
				<img
					src="./{bound_objects.titanMode ? 'gear/titan' : 'gear'}/{partIfNoGear}.png"
					alt="Gear"
					style="filter:grayscale(100%)"
				/>
			{/if}
		</div>
	</div>
{/snippet}

<div class="full-width">
	{#await (async () => {
		await Promise.all([loadGearImages(), loadStatIcons()]);
		has_measured = false;
		$gear_page_loaded = true;
	})()}
		<div class="block">
			<h1>Gear List</h1>
			<p>Still loading, be patient...</p>
		</div>
	{:then}
		<div class="block">
			<h1>Gear List</h1>

			{#if Object.keys($user_loadouts).length > 0 && $current_loadout}
				<div class="horizontal" style="gap: 1rem; margin: 1rem;">
					<div class="hori-item">
						<StatIcon stat={$user_loadouts[$current_loadout].element as Stat} size="2rem" />
					</div>
					<div class="hori-item">
						<span>{$user_loadouts[$current_loadout].name}</span>
					</div>
				</div>
			{/if}

			{#if is_searching}
				<p>Searching for: {prev_search_query}</p>

				<button class="border red-bg" id="stop-search" onclick={() => (is_searching = false)}>
					<SearchXIcon />
					<label class="in-button" for="stop-search"> Stop Searching </label>
				</button>
			{:else if is_showing_equipped_gears}
				<p>Showing equipped gears.</p>

				<button
					class="border red-bg"
					id="stop-show"
					onclick={() => {
						is_showing_equipped_gears = false;
						has_measured = false;
					}}
				>
					<SearchXIcon />
					<label class="in-button" for="stop-show"> Stop Showing </label>
				</button>
			{:else}
				<div class="horizontal">
					<button class="border" id="add-gear" onclick={() => (screenshot_dialog_open = true)}>
						<ImagePlusIcon />
						<label class="in-button" for="add-gear">Add Gear</label>
					</button>
					<button class="border" id="start-search" onclick={() => (search_dialog_open = true)}>
						<SearchIcon />
						<label class="in-button" for="start-search">Search & Sort Gear</label>
					</button>
					<button
						class="border"
						id="show-equipped"
						onclick={() => {
							updateEquippedGears();
							is_showing_equipped_gears = true;
							has_measured = false;
						}}
					>
						<ShirtIcon />
						<label class="in-button" for="show-equipped">Show Equipped</label>
					</button>
				</div>
			{/if}
		</div>

		<div class="noslider-x gear-grid">
			<FlexGrid
				by_column={false}
				max_cols={is_showing_equipped_gears ? 2 : 4}
				vertical_gap="0rem"
				horizontal_gap="0.5rem"
				bind:has_measured
				expand_width={false}
			>
				{#if $gear_views.length !== 0 && !is_searching && !is_showing_equipped_gears}
					{#each $gear_views as gear}
						<div class="gear-cell gear-id-{gear.id}">
							<span style="width: {span_length * 0.75}rem">{gear.id}</span>
							{@render gear_icon(gear)}

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

							{#if !$is_mobile}
								{@render gear_actions(gear)}
							{/if}
						</div>
					{/each}
				{:else if search_views.length !== 0 && is_searching}
					{#each search_views as gear}
						<div class="gear-cell gear-id-{gear.id}">
							<span style="width: {span_length * 0.75}rem">{gear.id}</span>
							{@render gear_icon($gear_views[gear.id])}

							<div class="single-stat">
								<div class="stat-content" class:icon={bound_objects.iconStats}>
									+{gear.stats[0].value_label ?? ''}
								</div>
							</div>

							{#if !$is_mobile}
								{@render gear_actions($gear_views[gear.id])}
							{/if}
						</div>
					{/each}
				{:else if is_showing_equipped_gears}
					{#each equipped_gears as gearId, partIndex}
						<div class="gear-cell gear-id-{gearId}">
							<span style="max-width: {span_length * 0.75}rem; width: {span_length * 0.75}rem"
								>{gearId === -1 ? '' : gearId}</span
							>
							{@render gear_icon($gear_views[gearId], VALID_GEAR_PARTS[partIndex])}

							{@render gear_actions($gear_views[gearId])}
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
	{/await}
</div>

<UploadScreenshot
	{onFileUpload}
	bind:open={screenshot_dialog_open}
	bind:image={uploaded_image_url}
	bind:text={process_text}
/>

<GearInfo
	bind:open={gear_info_dialog_open}
	bind:gear={$gear_views[gear_info_index]}
	onRemoveGear={removeGear}
	onEquipGear={equipGear}
	onUnequipGear={unequipGear}
/>

<GearSearch bind:open={search_dialog_open} onConfirmSearch={onGearSearch} />

<ActionToolbar actions={ACTIONS} bind:bound_objects />

<style>
	.gear-grid {
		margin-top: 1rem;
		border-top: 4px solid var(--border-color);
	}

	.gear-cell {
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
		gap: 1.5rem;
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

	.red-bg {
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
