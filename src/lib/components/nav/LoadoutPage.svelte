<script lang="ts">
	import ActionToolbar from '$lib/components/ActionToolbar.svelte';
	import SwitchLoadout, { DEFAULT_LOADOUT } from '$lib/components/dialog/SwitchLoadout.svelte';
	import UploadScreenshot from '$lib/components/dialog/UploadScreenshot.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import { createGearView } from '$lib/scripts/gears';
	import {
		addImageToDB,
		cloneObject,
		deleteImageFromDB,
		getImageFromDB,
		getImageUrlFromDB,
		loadMatrixImages,
		loadStatIcons,
		loadWeaponImages,
		saveObject
	} from '$lib/scripts/loader';
	import {
		dedupeMatEffs,
		turnGearToEffect,
		updateSingleMatrixView,
		updateSingleRelicView,
		updateSingleWeaponView,
		updateWeaponMatrixRelicFromStore
	} from '$lib/scripts/loadout';
	import { ActionType } from '$lib/scripts/nav-metadata';
	import {
		base_weapons,
		current_loadout,
		equipped_gear_views,
		font_size,
		gear_views,
		inner_width,
		loadout_is_editing,
		loadout_new_or_duplicate_dialog_open,
		loadout_page_loaded,
		matrix_views,
		relic_views,
		reso_effects,
		stat_autoupdate,
		user_gears,
		user_loadouts,
		weapon_views
	} from '$lib/scripts/stores';
	import type {
		Elements,
		LoadoutType,
		MatrixIds,
		MatrixView,
		StatGearUser,
		UserMatrix,
		UserRelic,
		UserWeapon,
		WeaponSettingStuff,
		WeaponsIds,
		WeaponView
	} from '$lib/types/index';
	import {
		ArrowRightLeftIcon,
		CopyPlusIcon,
		PencilIcon,
		RotateCcwIcon,
		SaveIcon,
		StarIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { onDestroy, onMount } from 'svelte';
	import SwitchWeapMatrix from '../dialog/SwitchWeapMatrix.svelte';
	import StatContributions from '../StatContributions.svelte';

	// State
	let loadout_name = $state('');
	let loadout_desc = $state('');
	let loadout_icon = $state('');
	let loadout_image = $state('');

	// Used to update loadouts
	let user_weapons = $state([{}, {}, {}] as UserWeapon[]);
	let user_matrices = $state([{}, {}, {}] as UserMatrix[]);
	let user_relics = $state([{}, {}] as UserRelic[]);

	let loadout_weapmat_combined: [WeaponView, MatrixView][] = $derived(
		$weapon_views.map((weapon, i) => [weapon, $matrix_views[i]])
	);

	let all_effects = $derived([
		...$weapon_views.flatMap((weapon) => weapon.effects),
		...dedupeMatEffs($matrix_views.flatMap((matrix) => matrix.effects)),
		...$reso_effects,
		...$equipped_gear_views.flatMap((gear) => turnGearToEffect(gear))
	]);

	let is_editing = $state(false);

	// Dialog
	let upload_dialog_open = $state(false);
	let switch_loadout_dialog_open = $state(false);
	let new_or_duplicate_dialog_open = $state(false);

	let switch_gear_matrix_dialog_open = $state(false);
	let switching: 'matrix' | 'weapon' | 'relic' = $state('matrix');
	let switch_index = $state(0);

	// Stat Contrib
	let chart_width = $derived(Math.min($inner_width - 300, 700));
	$inspect('chart wid', chart_width);

	// Element options
	const ELEMENTS: { value: LoadoutType; label: string }[] = [
		{ value: 'atk', label: 'Atk' },
		{ value: 'flame', label: 'Flame' },
		{ value: 'frost', label: 'Frost' },
		{ value: 'volt', label: 'Volt' },
		{ value: 'phys', label: 'Physical' },
		{ value: 'alt', label: 'Altered' }
	];

	function saveWeaponMatrixRelicLoadout() {
		$user_loadouts[$current_loadout].equipped_weapons = user_weapons;
		$user_loadouts[$current_loadout].equipped_matrices = user_matrices;
		$user_loadouts[$current_loadout].equipped_relics = user_relics;
		saveObject('loadouts_v1', $user_loadouts);
	}

	function toggleEditing() {
		if (is_editing) {
			const prevSelectedLoadout = $current_loadout;
			$user_loadouts[prevSelectedLoadout].name = loadout_name;
			$user_loadouts[prevSelectedLoadout].description = loadout_desc;
			$user_loadouts[prevSelectedLoadout].element = loadout_icon as Elements;

			const sanitizedLoadoutName = sanitizeLoadoutKey(loadout_name);

			if (sanitizedLoadoutName !== prevSelectedLoadout) {
				// copy image
				getImageFromDB(prevSelectedLoadout).then((imageFile) => {
					if (imageFile) {
						const newFile = new File([imageFile], `${sanitizedLoadoutName}.jpg`, {
							type: imageFile.type
						});
						addImageToDB(sanitizedLoadoutName, newFile).then(() => {
							deleteImageFromDB(prevSelectedLoadout);
						});
					}
				});

				// rename loadout
				$user_loadouts[sanitizedLoadoutName] = cloneObject($user_loadouts[prevSelectedLoadout]);
				delete $user_loadouts[prevSelectedLoadout];
				$current_loadout = sanitizedLoadoutName;
			}

			saveObject('loadouts_v1', $user_loadouts);
		}

		is_editing = !is_editing;
	}

	async function handleImageUpload(file: File) {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				loadout_image = e.target?.result as string;
			};
			reader.readAsDataURL(file);

			addImageToDB($current_loadout, file);
		}
	}

	function sanitizeLoadoutKey(key: string) {
		return key.replace(/[^a-zA-Z0-9]/g, '');
	}

	/**
	 * Duplicates the current loadout
	 * @param switchToDupe - whether to switch to the new loadout after duplicating
	 */
	function duplicateLoadout(key: string = loadout_name, switchToDupe: boolean = true) {
		let newLoadoutName = loadout_name;
		let sanitizedLoadoutName = sanitizeLoadoutKey(newLoadoutName);
		let counter = 1;

		while ($user_loadouts[sanitizedLoadoutName]) {
			counter++;
			newLoadoutName = loadout_name.match(/(.*)\s(\d+)$/)
				? loadout_name.replace(/(\d+)$/, String(counter))
				: `${loadout_name} ${counter}`;
			sanitizedLoadoutName = sanitizeLoadoutKey(newLoadoutName);
		}

		$user_loadouts[sanitizedLoadoutName] = cloneObject($user_loadouts[$current_loadout]);
		$user_loadouts[sanitizedLoadoutName].name = newLoadoutName;
		$user_loadouts[sanitizedLoadoutName].description =
			loadout_desc + ` (duplicate from ${loadout_name})`;

		// copy image, fetch from db then add to db
		getImageFromDB($current_loadout).then((imageFile) => {
			if (imageFile) {
				const newFile = new File([imageFile], `${sanitizedLoadoutName}.jpg`, {
					type: imageFile.type
				});
				addImageToDB(sanitizedLoadoutName, newFile);
			}
		});

		saveObject('loadouts_v1', $user_loadouts);
		if (switchToDupe) {
			switchLoadout(sanitizedLoadoutName);
		}
	}

	/**
	 * Creates a new loadout
	 * @param switchToNew - whether to switch to the new loadout after creating
	 */
	function createNewLoadout(switchToNew: boolean = true) {
		console.error('Creating new loadout');
		let newLoadoutName = DEFAULT_LOADOUT.name;
		let sanitizedLoadoutName = sanitizeLoadoutKey(newLoadoutName);
		let counter = 1;

		while ($user_loadouts[sanitizedLoadoutName]) {
			counter++;
			newLoadoutName = loadout_name.match(/(.*)\s(\d+)$/)
				? loadout_name.replace(/(\d+)$/, String(counter))
				: `${loadout_name} ${counter}`;
			sanitizedLoadoutName = sanitizeLoadoutKey(newLoadoutName);
		}

		console.error('sanitized', sanitizedLoadoutName);

		$user_loadouts[sanitizedLoadoutName] = cloneObject(DEFAULT_LOADOUT);
		$user_loadouts[sanitizedLoadoutName].name = newLoadoutName;
		$user_loadouts[sanitizedLoadoutName].description = DEFAULT_LOADOUT.description;

		saveObject('loadouts_v1', $user_loadouts);
		if (switchToNew) {
			switchLoadout(sanitizedLoadoutName);
		}
	}

	function onNewDupeChoice(loadoutKey: string) {
		if (loadoutKey === '__NEW__') {
			createNewLoadout(true);
		} else {
			duplicateLoadout(loadoutKey, true);
		}
	}

	function deleteCurrentLoadout() {
		console.error('deleting loadout', $current_loadout);
		if (Object.keys($user_loadouts).length === 1) {
			console.error('Cannot delete last loadout!');
			return;
		}

		delete $user_loadouts[$current_loadout];
		deleteImageFromDB($current_loadout);

		// fix reactivity problem
		saveObject('loadouts_v1', $user_loadouts);
		$user_loadouts = { ...$user_loadouts };

		$current_loadout = Object.keys($user_loadouts)[0];
		switchLoadout($current_loadout);
	}

	function switchLoadout(loadout: string) {
		if (!$user_loadouts[loadout]) {
			console.error('Loadout not found:', loadout);
			return;
		}
		$stat_autoupdate = false;

		$current_loadout = loadout;

		updateAllFromStores();
		updateWeaponMatrixRelicFromStore();

		// update gear views
		Promise.all($user_gears.map((gear) => createGearView(gear, false))).then((gearViews) => {
			$gear_views = gearViews;
			$stat_autoupdate = true;
		});
	}

	/**
	 * Updates local states from stores
	 */
	function updateAllFromStores() {
		loadout_name = $user_loadouts[$current_loadout].name;
		loadout_desc = $user_loadouts[$current_loadout].description;
		loadout_icon = $user_loadouts[$current_loadout].element;
		user_weapons = $user_loadouts[$current_loadout].equipped_weapons ?? [
			{ id: 'none' },
			{ id: 'none' },
			{ id: 'none' }
		];
		user_matrices = $user_loadouts[$current_loadout].equipped_matrices ?? [
			{ id: 'none' },
			{ id: 'none' },
			{ id: 'none' }
		];
		user_relics = $user_loadouts[$current_loadout].equipped_relics ?? [
			{ id: 'none' },
			{ id: 'none' }
		];
		getImageUrlFromDB($current_loadout).then((imageUrl) => {
			if (imageUrl) {
				loadout_image = imageUrl;
			}
		});
	}

	function onSwitchMatrix(id: MatrixIds) {
		user_matrices[switch_index] = { id };
		saveWeaponMatrixRelicLoadout();
		updateWeaponMatrixRelicFromStore();
	}

	function onSwitchWeapon(id: WeaponsIds) {
		user_weapons[switch_index] = { id };
		saveWeaponMatrixRelicLoadout();
		updateWeaponMatrixRelicFromStore();
	}

	function onSwitchRelic(id: MatrixIds) {
		user_relics[switch_index] = { id };
		saveWeaponMatrixRelicLoadout();
		updateWeaponMatrixRelicFromStore();
	}

	function onWeaponSettingChange(
		weapon: WeaponView,
		index: number,
		setting: WeaponSettingStuff,
		settingIndex: number
	) {
		// get keys in settings
		if (!$base_weapons[index].setting) {
			return;
		}
		if (!weapon.setting) {
			return;
		}

		const selected_keys = weapon.setting.map((setting) => setting.id);
		const keys = Object.keys($base_weapons[index].setting.choices);

		let currKey = setting.id;
		let currInd = keys.indexOf(currKey);
		const initialCurrInd = currInd;

		while (selected_keys.indexOf(currKey) !== -1) {
			currInd = (currInd + 1) % keys.length;
			currKey = keys[currInd];

			if (currInd === initialCurrInd) {
				// avoid catastrophe
				console.error('idk why but something went wrong');
				return;
			}
		}

		if (!user_weapons[index].setting) {
			user_weapons[index].setting = $base_weapons[index].setting.default;
		}
		user_weapons[index].setting[settingIndex] = currKey;
		saveWeaponMatrixRelicLoadout();
		// nola can change elements and reso
		updateWeaponMatrixRelicFromStore();
	}

	const ACTIONS = [
		{
			id: 'reset',
			label: 'Reset to defaults',
			lucide: RotateCcwIcon,
			type: ActionType.BUTTON,
			callback: () => {
				// delete keys in localStorage
				localStorage.removeItem('loadouts_v1');
				localStorage.removeItem('gears_v1');
				// delete database
				indexedDB.deleteDatabase('tof-gear');
				// reload page
				window.location.reload();
			}
		}
	];

	$effect(() => {
		$loadout_new_or_duplicate_dialog_open = new_or_duplicate_dialog_open;
	});
	$effect(() => {
		$loadout_is_editing = is_editing;
	});

	onMount(async () => {
		if (Object.keys($user_loadouts).length === 0) {
			// skip if preload
		} else {
			updateAllFromStores();
		}
	});

	onDestroy(() => {
		$loadout_page_loaded = false;
	});
</script>

{#snippet matrix4p(matrix: MatrixView)}
	{#each [0, 1, 2, 3] as index}
		<div class="compose above" style="top: -0.5rem; left: {-0.75 + 0.5 * index}rem">
			<img
				src="./matrix/{matrix.id.replace('-4p', '')}.webp"
				alt="Matrix"
				style="height: 6rem; width:6rem;"
			/>
		</div>
	{/each}
{/snippet}

{#snippet showMatrices(matrix: MatrixView, index: number)}
	<div class="vertical center matrix-col" style="width: 6rem;">
		<span class="matrix-name">{matrix.name}</span>
		<div class="horizontal matrix-container">
			<div class="compose below border" style="width: 6rem; height: 6rem; margin-top: 0.4rem;">
				<button
					class="image"
					onclick={() => {
						switching = 'matrix';
						switch_index = index;
						switch_gear_matrix_dialog_open = true;
					}}
				>
					{#if matrix.id.includes('4p')}
						{@render matrix4p(matrix)}
					{:else if matrix.id === 'none'}
						<img
							src="./matrix/none.webp"
							alt="Matrix"
							style="height:6rem; width:6rem; filter: grayscale(100%)"
						/>
					{/if}
				</button>
				{#if matrix.id !== 'none'}
					{#each [1, 2, 3] as advSetValue, advIndex}
						<button
							class="image"
							onclick={() => {
								if (matrix.advancement === advSetValue) {
									user_matrices[index].advancement = 0;
								} else {
									user_matrices[index].advancement = advSetValue;
								}
								saveWeaponMatrixRelicLoadout();
								updateSingleMatrixView(index);
							}}
						>
							<div class="compose above" style="top: 4.5rem; left:{1.5 + advIndex}rem">
								<StarIcon
									size={$font_size}
									fill={matrix.advancement >= advSetValue ? 'white' : 'none'}
								/>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet showRelics()}
	<div class="horizontal center-vert" style="margin-top: 1rem;">
		{#each $relic_views as relic, index}
			<div class="vertical center matrix-col" style="width: 6rem;">
				<span>{relic.name}</span>
				<div class="horizontal matrix-container">
					<div class="compose below border" style="width: 6rem; height: 6rem; margin-top: 0.4rem;">
						<button
							class="image"
							onclick={() => {
								switching = 'relic';
								switch_index = index;
								switch_gear_matrix_dialog_open = true;
							}}
						>
							{#if relic.id === 'none'}
								<img
									src="./matrix/none.webp"
									alt="Matrix"
									style="height:6rem; width:6rem; filter: grayscale(100%)"
								/>
							{:else}
								<img src="./relic/{relic.id}.webp" alt="Relic" style="height:6rem; width:6rem;" />
							{/if}
						</button>
						{#if relic.id !== 'none'}
							{#each [1, 2, 3, 4, 5] as advSetValue, advIndex}
								<button
									class="image"
									onclick={() => {
										if (user_relics[index].advancement === advSetValue) {
											user_relics[index].advancement = 0;
										} else {
											user_relics[index].advancement = advSetValue;
										}
										saveWeaponMatrixRelicLoadout();
										updateSingleRelicView(index);
									}}
								>
									<div class="compose above" style="top: 4.5rem; left:{0.5 + advIndex}rem">
										<StarIcon
											size={$font_size}
											fill={(user_relics[index].advancement ?? 0) >= advSetValue ? 'white' : 'none'}
										/>
									</div>
								</button>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet showWeaponMatrix()}
	<div class="vertical weapon-matrix-cell">
		{#each loadout_weapmat_combined as [weapon, matrix], index}
			<div class="horizontal cell-row" style="margin: 0.5rem;">
				<div class="vertical center weapon-icon-name" style="width: 8rem;">
					<span class="weapon-name"> {weapon.name} </span>
					<div class="weapon-icon-container">
						<div
							class="compose below border"
							style="width: 8rem; height: 8rem; margin-top: 0.4rem;"
						>
							<div class="compose above" style="top:{weapon.id === 'none' ? '0rem' : '-0.5rem'}">
								<button
									class="image"
									onclick={() => {
										switching = 'weapon';
										switch_index = index;
										switch_gear_matrix_dialog_open = true;
									}}
								>
									<img
										src="./weapon/{weapon.id}.webp"
										alt={weapon.name}
										style="height:8rem; width:8rem; {weapon.id === 'none' ? 'opacity: 0;' : ''}"
									/>
								</button>
							</div>
							{#if weapon.setting && weapon.setting.length > 0}
								<div class="compose above" style="top: 0.5rem; left: 0.5rem;">
									{#each weapon.setting as setting, settingIndex}
										<button
											class="image"
											onclick={() => {
												onWeaponSettingChange(weapon, index, setting, settingIndex);
											}}
										>
											<div class="vertical center">
												<img
													src={setting.icon}
													alt={setting.icon}
													style="height: 1.5rem; width: 1.5rem; background-color: var(--button-bg); border-radius: 50%;"
												/>
											</div>
										</button>
									{/each}
								</div>
							{:else if weapon.id !== 'none'}
								<div class="compose above" style="top: 0.5rem; left: 0.5rem">
									<StatIcon
										stat={weapon.resonances[0] as LoadoutType}
										size="1.5rem"
										style="background-color: var(--button-bg); border-radius: 50%;"
									/>
								</div>
							{/if}

							{#if weapon.id !== 'none'}
								{#each [1, 2, 3, 4, 5, 6] as advSetValue, advIndex}
									<button
										class="image"
										onclick={() => {
											if (weapon.advancement === advSetValue) {
												user_weapons[index].advancement = 0;
											} else {
												user_weapons[index].advancement = advSetValue;
											}
											saveWeaponMatrixRelicLoadout();
											updateSingleWeaponView(index);
										}}
									>
										<div class="compose above" style="top: 6.5rem; left:{1 + advIndex}rem">
											<StarIcon
												size={$font_size}
												fill={weapon.advancement >= advSetValue ? 'white' : 'none'}
											/>
										</div>
									</button>
								{/each}
							{/if}
						</div>
					</div>

					{#if $inner_width < 370}
						<div style="margin-top: 1rem; margin-bottom: 1.5rem;">
							{@render showMatrices(matrix, index)}
						</div>
					{/if}
				</div>
				{#if $inner_width >= 370}
					{@render showMatrices(matrix, index)}
				{/if}
			</div>
		{/each}
		{@render showRelics()}
	</div>
{/snippet}

<div class="loadout-page">
	{#await (async () => {
		await Promise.all([loadStatIcons(), loadWeaponImages(), loadMatrixImages()]);
		$loadout_page_loaded = true;
	})()}
		<div class="vertical" style="gap: 0.5rem;">
			<h1>Loadout</h1>
			<p>Loading stuff, be patient...</p>
		</div>
	{:then}
		<div class="vertical" style="gap: 0.5rem;">
			<h1>Loadout</h1>

			<div class="horizontal" style="gap: 0.5rem;">
				<button
					class="image border"
					id="switch-loadout"
					onclick={() => {
						switch_loadout_dialog_open = true;
					}}
				>
					<ArrowRightLeftIcon />
					<label class="in-button" for="switch-loadout">Switch</label>
				</button>
				<button
					class="image border"
					id="new-duplicate-loadout"
					onclick={() => {
						new_or_duplicate_dialog_open = true;
					}}
				>
					<CopyPlusIcon />
					<label class="in-button" for="new-duplicate-loadout">New</label>
				</button>
				<button
					class="image border"
					id="delete-loadout"
					onclick={() => {
						deleteCurrentLoadout();
					}}
				>
					<Trash2Icon />
					<label class="in-button" for="delete-loadout">Delete</label>
				</button>
			</div>

			<div class="horizontal">
				{#if is_editing}
					<button class="image border" id="save-loadout" onclick={toggleEditing}>
						<SaveIcon />
						<label class="in-button" for="save-loadout">Save Edits</label>
					</button>
				{:else}
					<button class="image border" id="edit-loadout" onclick={toggleEditing}>
						<PencilIcon />
						<label class="in-button" for="edit-loadout">Edit Loadout</label>
					</button>
				{/if}
			</div>
		</div>

		<div class="loadout-container">
			<div class="loadout-content">
				<div class="loadout-info">
					<div class="loadout-header">
						{#if is_editing}
							<div class="element-selector">
								<select id="element-select" bind:value={loadout_icon}>
									{#each ELEMENTS as element}
										<option value={element.value}>{element.label}</option>
									{/each}
								</select>
							</div>
							<div class="editable-fields">
								<input
									id="loadout-name"
									type="text"
									bind:value={loadout_name}
									placeholder="Enter loadout name"
								/>
								<textarea
									id="loadout-description"
									bind:value={loadout_desc}
									placeholder="Enter loadout description"
									rows="3"
								></textarea>
							</div>
						{:else}
							<div class="horizontal center-hori" style="gap: 0.5rem;">
								<StatIcon stat={loadout_icon as StatGearUser} size="2rem" />
								<span>{loadout_name}</span>
							</div>
							<div class="loadout-description-display">
								<p>{loadout_desc}</p>
							</div>
						{/if}
					</div>
				</div>

				{#if loadout_image}
					<div class="loadout-image-container">
						<button
							class={loadout_image ? 'image' : 'image'}
							onclick={() => (upload_dialog_open = true)}
							disabled={!is_editing}
							aria-label="Upload image"
						>
							<img class="user-upload" id="user-upload" src={loadout_image} alt="Loadout" />
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="weapon-setup">
			<h2>Weapon Setup</h2>
			<div class="vertical-left" style="margin-bottom: 2rem;">
				<!-- button for mobile players since not enough space -->

				<!-- <button class="image border" style="width:fit-content;">
				<ChartNoAxesColumnIcon />
				<label class="in-button" for="">Stat Breakdown</label>
			</button> -->
			</div>

			<div class="horizontal">
				{@render showWeaponMatrix()}
			</div>

			<div class="horizontal">
				<p>test</p>
			</div>

			{#if chart_width > 350}
				<div class="vertical" style="margin-left: 2rem;">
					<StatContributions bind:all_effects bind:chart_width />
				</div>
			{/if}
		</div>
	{/await}
</div>

<UploadScreenshot
	bind:open={upload_dialog_open}
	onFileUpload={handleImageUpload}
	upload_type="file"
	prompt_on_open={true}
	close_on_upload={true}
/>

<!-- plain switching -->
<SwitchLoadout
	bind:open={switch_loadout_dialog_open}
	bind:selected_loadout={$current_loadout}
	onSwitchLoadout={switchLoadout}
/>

<!-- new or duplicate -->
<SwitchLoadout
	bind:open={new_or_duplicate_dialog_open}
	bind:selected_loadout={$current_loadout}
	duplicate_or_new={true}
	onSwitchLoadout={onNewDupeChoice}
/>

<SwitchWeapMatrix
	bind:open={switch_gear_matrix_dialog_open}
	bind:switching
	bind:user_weapons
	{onSwitchMatrix}
	{onSwitchWeapon}
	{onSwitchRelic}
/>

<ActionToolbar actions={ACTIONS} />

<style>
	.loadout-page {
		padding: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
	}

	.loadout-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-top: 1rem;
	}

	.loadout-content {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}

	.loadout-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.loadout-header {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.loadout-description-display {
		padding: 0.5rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.editable-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.editable-fields input,
	.editable-fields textarea,
	.element-selector select {
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid var(--border-color);
		background-color: var(--button-bg);
		color: var(--text-color);
		font-size: 1rem;
		resize: vertical;
	}
	.editable-fields input,
	.editable-fields textarea {
		width: 100%;
	}

	.element-selector select {
		width: 15%;
		min-width: 7rem;
	}

	.loadout-image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		width: 240px;
	}

	.loadout-image-container button {
		width: 240px;
		height: 240px;
		border: 2px dashed var(--border-color);
		border-radius: 1.5rem;
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		cursor: pointer;
		transition:
			border-color 0.2s,
			opacity 0.2s;
	}

	.loadout-image-container button:disabled {
		cursor: default;
		opacity: 0.8;
	}

	.loadout-image-container button:not(:disabled):hover {
		border-color: var(--accent-color);
	}

	.loadout-image-container button.image {
		border-style: solid;
	}

	.loadout-image-container .user-upload {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.weapon-setup {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--border-color);
		/* padding-top: 1.5rem; */
		margin-top: 0.5rem;
	}

	.weapon-name {
		font-size: 1.5rem;
		font-weight: bolder;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.loadout-content {
			flex-direction: column;
			align-items: center;
		}

		.loadout-info {
			width: 100%;
			order: 1;
		}

		.loadout-image-container {
			order: 2;
			margin-top: 1rem;
			margin-bottom: 1rem;
		}

		.weapon-setup {
			order: 3;
			width: 100%;
		}
	}
</style>
