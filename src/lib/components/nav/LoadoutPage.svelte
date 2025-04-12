<script lang="ts">
	import ActionToolbar from '$lib/components/ActionToolbar.svelte';
	import SwitchLoadout from '$lib/components/dialog/SwitchLoadout.svelte';
	import UploadScreenshot from '$lib/components/dialog/UploadScreenshot.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import { getEffect, getResoEffects, getWeapon } from '$lib/scripts/json-loader';
	import {
		addImageToDB,
		cloneObject,
		deleteImageFromDB,
		getImageFromDB,
		getImageUrlFromDB,
		saveObject
	} from '$lib/scripts/loader';
	import type { AllLoadouts, LoadoutType } from '$lib/scripts/loadouts';
	import { ActionType, registerComponent, type ComponentMetadata } from '$lib/scripts/nav-metadata';
	import { StatCollection } from '$lib/scripts/stat-ops';
	import { type StatGearUser } from '$lib/scripts/stats';
	import {
		WEAPON_BASE_STATS,
		type Effect,
		type ResoTriggerCounts,
		type UserWeapon,
		type Weapon,
		type WeaponView
	} from '$lib/scripts/weapons';
	import {
		ArrowRightLeftIcon,
		BoxIcon,
		CopyPlusIcon,
		ImagePlus,
		PencilIcon,
		RotateCcwIcon,
		Save,
		StarIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		is_mobile = $bindable(false),
		user_loadouts = $bindable({} as AllLoadouts),
		current_loadout = $bindable('')
	} = $props();

	// State
	let loadout_name = $state('');
	let loadout_desc = $state('');
	let loadout_icon = $state('');
	let loadout_image = $state('');
	let user_weapons = $state([{}, {}, {}] as UserWeapon[]);

	let loadout_base_weapons = $state([] as Weapon[]);
	let loadout_reso_counts = $state({} as ResoTriggerCounts);

	let loadout_weapon_views = $state([{}, {}, {}] as WeaponView[]);

	let loadout_resonance_effects = $state([] as Effect[]);
	let loadout_resonance_stat = $state(new StatCollection());

	let is_editing = $state(false);

	// Dialog
	let upload_dialog_open = $state(false);
	let switch_loadout_dialog_open = $state(false);

	let any_dialog_open = $derived(upload_dialog_open || switch_loadout_dialog_open);

	// Element options
	const ELEMENTS: { value: LoadoutType; label: string }[] = [
		{ value: 'atk', label: 'Atk' },
		{ value: 'flame', label: 'Flame' },
		{ value: 'frost', label: 'Frost' },
		{ value: 'volt', label: 'Volt' },
		{ value: 'phys', label: 'Physical' },
		{ value: 'alt', label: 'Altered' }
	];

	async function updateResoCounts() {
		loadout_reso_counts = loadout_base_weapons.reduce((counts, weapon) => {
			weapon.resonances.forEach((resonance) => {
				counts[resonance] = (counts[resonance] ?? 0) + 1;
			});
			return counts;
		}, {} as ResoTriggerCounts);
	}

	async function updateResoEffects() {
		const reso_effects: Effect[] = [];
		await Promise.all(
			loadout_base_weapons.map(async (weapon) => {
				if (weapon.reso_effects) {
					await Promise.all(
						weapon.reso_effects.map(async (eff) => {
							const effs = await getResoEffects(eff);
							// iterate through effs and check if id exists in reso_effects
							effs.forEach((eff) => {
								if (!reso_effects.some((eff2) => eff2.id === eff.id)) {
									reso_effects.push(eff);
								}
							});
						})
					);
				}
			})
		);
		// add default reso
		await getResoEffects('atk-reso').then((effs) => {
			effs.forEach((eff) => {
				if (!reso_effects.some((eff2) => eff2.id === eff.id)) {
					reso_effects.push(eff);
				}
			});
		});

		loadout_resonance_stat = new StatCollection();
		loadout_resonance_effects = [];
		reso_effects.forEach((eff) => {
			if (eff.require_reso) {
				const required_reso_count = eff.require_reso_count ?? 2;
				if ((loadout_reso_counts[eff.require_reso] ?? 0) < required_reso_count) {
					return;
				}

				// TODO: check for teamplay
				loadout_resonance_stat = loadout_resonance_stat.add(new StatCollection(eff.stats));
				loadout_resonance_effects.push(eff);
			}
		});
	}

	async function updateWeaponViews() {
		loadout_weapon_views = await Promise.all(
			loadout_base_weapons.map(async (weapon, index) => {
				const advancement = user_weapons[index].advancement ?? 6;

				// get base stat of weapon
				const _base_stat = {};
				Object.entries(WEAPON_BASE_STATS[weapon.base_stat]).forEach(([stat, value]) => {
					// @ts-expect-error
					_base_stat[stat] = value[0] + ((value[1] - value[0]) * (advancement - 1)) / 5;
				});
				const base_stat = new StatCollection(_base_stat);

				const effects: Effect[] = []; // active effects
				const wpn_effects = await Promise.all(weapon.effects.map((eff) => getEffect(eff)));
				let stat = new StatCollection();
				wpn_effects.forEach((eff) => {
					if (eff.require_reso) {
						const required_reso_count = eff.require_reso_count ?? 2;
						if (loadout_reso_counts[eff.require_reso] ?? 0 < required_reso_count) {
							return;
						}
					}

					if (eff.require_adv) {
						if (advancement < eff.require_adv) {
							return;
						}
					}

					// TEMPORARILY DISABLE ONFIELD EFFECTS
					if (eff.duration !== undefined && eff.duration === 0) {
						return;
					}

					effects.push(eff);
					stat = stat.add(new StatCollection(eff.stats));
				});

				return {
					id: weapon.id,
					name: weapon.name,
					resonances: weapon.resonances,
					onfieldness: weapon.onfieldness,
					effects,
					base_stat,
					advancement,
					stat
				} as WeaponView;
			})
		);
	}

	async function updateSingleWeaponView(index: number) {
		const weapon = loadout_base_weapons[index];
		const advancement = user_weapons[index].advancement ?? 6;

		// get base stat of weapon
		const _base_stat = {};
		Object.entries(WEAPON_BASE_STATS[weapon.base_stat]).forEach(([stat, value]) => {
			// @ts-expect-error
			_base_stat[stat] = value[0] + ((value[1] - value[0]) * (advancement - 1)) / 5;
		});
		const base_stat = new StatCollection(_base_stat);

		const wpn_effects = await Promise.all(weapon.effects.map((eff) => getEffect(eff)));
		let effect_stat = new StatCollection();
		wpn_effects.forEach((eff) => {
			if (eff.require_reso) {
				const required_reso_count = eff.require_reso_count ?? 2;
				if (loadout_reso_counts[eff.require_reso] ?? 0 < required_reso_count) {
					return;
				}
			}

			if (eff.require_adv) {
				if (advancement < eff.require_adv) {
					return;
				}
			}
			effect_stat = effect_stat.add(new StatCollection(eff.stats));
		});

		loadout_weapon_views[index] = {
			id: weapon.id,
			name: weapon.name,
			resonances: weapon.resonances,
			onfieldness: weapon.onfieldness,
			effects: wpn_effects,
			base_stat,
			advancement,
			stat: effect_stat
		};
	}

	// creates gearView and updates loadout_resonance_stat
	async function updateAll() {
		loadout_base_weapons = await Promise.all(user_weapons.map((weapon) => getWeapon(weapon.id)));

		// create counts of resonance triggers
		await updateResoCounts();

		// apply resonance effects
		await updateResoEffects();

		// iterate through weapons
		await updateWeaponViews();
	}

	function saveWeaponMatrixLoadout() {
		user_loadouts[current_loadout].equipped_weapons = user_weapons;
		saveObject('loadouts_v1', user_loadouts);
	}

	function toggleEditing() {
		if (is_editing) {
			const prevSelectedLoadout = current_loadout;
			user_loadouts[prevSelectedLoadout].name = loadout_name;
			user_loadouts[prevSelectedLoadout].description = loadout_desc;
			user_loadouts[prevSelectedLoadout].element = loadout_icon as LoadoutType;

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
				user_loadouts[sanitizedLoadoutName] = cloneObject(user_loadouts[prevSelectedLoadout]);
				delete user_loadouts[prevSelectedLoadout];
				current_loadout = sanitizedLoadoutName;
			}

			saveObject('loadouts_v1', user_loadouts);
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

			addImageToDB(current_loadout, file);
		}
	}

	function sanitizeLoadoutKey(key: string) {
		return key.replace(/[^a-zA-Z0-9]/g, '');
	}

	function duplicateLoadout(switchToDupe: boolean = true) {
		let newLoadoutName = loadout_name;
		let sanitizedLoadoutName = sanitizeLoadoutKey(newLoadoutName);
		let counter = 1;

		while (user_loadouts[sanitizedLoadoutName]) {
			counter++;
			newLoadoutName = loadout_name.match(/(.*)\s(\d+)$/)
				? loadout_name.replace(/(\d+)$/, String(counter))
				: `${loadout_name} ${counter}`;
			sanitizedLoadoutName = sanitizeLoadoutKey(newLoadoutName);
		}

		console.error('sanitized', sanitizedLoadoutName);

		user_loadouts[sanitizedLoadoutName] = cloneObject(user_loadouts[current_loadout]);
		user_loadouts[sanitizedLoadoutName].name = newLoadoutName;
		user_loadouts[sanitizedLoadoutName].description =
			loadout_desc + ` (duplicate from ${loadout_name})`;

		// copy image, fetch from db then add to db
		getImageFromDB(current_loadout).then((imageFile) => {
			if (imageFile) {
				const newFile = new File([imageFile], `${sanitizedLoadoutName}.jpg`, {
					type: imageFile.type
				});
				addImageToDB(sanitizedLoadoutName, newFile);
			}
		});

		saveObject('loadouts_v1', user_loadouts);
		if (switchToDupe) {
			switchLoadout(sanitizedLoadoutName);
		}
	}

	function deleteCurrentLoadout() {
		console.error('deleting loadout', current_loadout);
		if (Object.keys(user_loadouts).length === 1) {
			console.error('Cannot delete last loadout!');
			return;
		}

		delete user_loadouts[current_loadout];
		deleteImageFromDB(current_loadout);

		saveObject('loadouts_v1', user_loadouts);

		current_loadout = Object.keys(user_loadouts)[0];
		switchLoadout(current_loadout);
	}

	function switchLoadout(loadout: string) {
		if (!user_loadouts[loadout]) {
			console.error('Loadout not found:', loadout);
			return;
		}

		current_loadout = loadout;

		loadout_name = user_loadouts[loadout].name;
		loadout_desc = user_loadouts[loadout].description;
		loadout_icon = user_loadouts[loadout].element;
		getImageUrlFromDB(current_loadout).then((imageUrl) => {
			if (imageUrl) {
				loadout_image = imageUrl;
			}
		});
	}

	// function resetLoadout() {
	// 	loadoutName = 'Default Loadout';
	// 	loadoutDescription = 'A balanced loadout for all situations';
	// 	loadoutImageBase64 = '';
	// 	selectedWeaponPreset = 'Preset 1';
	// 	selectedElement = 'flame';
	// 	isEditing = false;
	// }

	// register
	const id = 'loadout-page';

	const metadata: ComponentMetadata = {
		id,
		label: 'Loadout',
		lucide: BoxIcon,
		showInNav: true,
		actions: [
			{
				id: 'switch',
				label: 'Switch Loadout',
				lucide: ArrowRightLeftIcon,
				type: ActionType.BUTTON,
				callback: () => {
					switch_loadout_dialog_open = true;
				}
			},
			{
				id: 'duplicate',
				label: 'Duplicate Loadout',
				lucide: CopyPlusIcon,
				type: ActionType.BUTTON,
				callback: () => {
					duplicateLoadout(true);
				}
			},
			{
				id: 'delete',
				label: 'Delete Loadout',
				lucide: Trash2Icon,
				type: ActionType.BUTTON,
				callback: () => {
					deleteCurrentLoadout();
				}
			},
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
		]
	};

	onMount(async () => {
		registerComponent(id, metadata);

		if (Object.keys(user_loadouts).length === 0) {
			// skip if preload
		} else {
			loadout_name = user_loadouts[current_loadout].name;
			loadout_desc = user_loadouts[current_loadout].description;
			loadout_icon = user_loadouts[current_loadout].element;
			user_weapons = user_loadouts[current_loadout].equipped_weapons;
			loadout_image = await getImageUrlFromDB(current_loadout);
			updateAll();
		}
	});

	// $inspect('image source', document.getElementById('user-upload')?.src);
	$inspect('loadout wepaons', user_weapons);
	$inspect('weapon views', loadout_weapon_views);
</script>

<div class="loadout-page" style={any_dialog_open ? 'overflow: hidden;' : ''}>
	<h1 class="Pro">Loadout</h1>

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
						<div class="loadout-title-area">
							<div class="element-display">
								<div class="element-icon">
									<StatIcon stat={loadout_icon as StatGearUser} size="2rem" />
								</div>
							</div>
							<div class="loadout-name-display">
								<span class="loadout-name">{loadout_name}</span>
							</div>
						</div>
						<div class="loadout-description-display">
							<p>{loadout_desc}</p>
						</div>
					{/if}

					<div class="edit-button-container">
						{#if is_editing}
							<button class="edit-button" onclick={toggleEditing} title="Save changes">
								<Save size={18} />
							</button>
						{:else}
							<button class="edit-button" onclick={toggleEditing} title="Edit loadout">
								<PencilIcon size={18} />
							</button>
						{/if}
					</div>
				</div>
			</div>

			<div class="loadout-image-container">
				<button
					class={loadout_image ? 'image' : 'image'}
					onclick={() => (upload_dialog_open = true)}
					disabled={!is_editing}
					aria-label="Upload image"
				>
					{#if loadout_image}
						<img class="user-upload" id="user-upload" src={loadout_image} alt="Loadout" />
					{:else}
						<ImagePlus size={64} class="upload-icon" />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<div class="loadout-settings">
		<h2>Weapon Presets</h2>
		<div class="vertical weapon-matrix-cell">
			{#each loadout_weapon_views as weapon, index}
				<div class="horizontal weapon-matrix-row">
					<div class="weapon-icon-container">
						<div class="compose-below">
							<img
								class="border"
								src="./weapons/{weapon.id}.webp"
								alt="Weapon"
								style="height: 8rem; width:8rem;"
							/>
							{#each [1, 2, 3, 4, 5, 6] as advSetValue, advIndex}
								<button
									class="image"
									onclick={() => {
										if (weapon.advancement === advSetValue) {
											user_weapons[index].advancement = 0;
										} else {
											user_weapons[index].advancement = advSetValue;
										}
										saveWeaponMatrixLoadout();
										updateSingleWeaponView(index);
									}}
								>
									<div class="compose-above" style="top: 6.5rem; left:{1 + advIndex}rem">
										<StarIcon
											size={16}
											fill={weapon.advancement >= advSetValue ? 'white' : 'none'}
										/>
									</div>
								</button>
							{/each}
						</div>
					</div>

					<div class="vertical weapon-name-matrix-col">
						<span class="weapon-name">{weapon.name}</span>
						<div class="horizontalmatrix-container">
							<img src="" alt="Matrix" />
							<span>Matrix {index + 1}</span>
						</div>
					</div>
				</div>
			{/each}

			<p>Suggest good bg color pls...</p>
		</div>
	</div>
</div>

<UploadScreenshot
	bind:open={upload_dialog_open}
	onFileUpload={handleImageUpload}
	upload_type="file"
	prompt_on_open={true}
	close_on_upload={true}
/>

<SwitchLoadout
	bind:open={switch_loadout_dialog_open}
	bind:loadouts={user_loadouts}
	bind:selected_loadout={current_loadout}
	onSwitchLoadout={switchLoadout}
/>

<ActionToolbar actions={metadata.actions} bind:is_mobile />

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

	.loadout-title-area {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.element-display {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background-color: var(--bg-secondary);
		border-radius: 0.25rem;
		height: 1rem;
		width: 1rem;
	}

	.loadout-name-display {
		padding: 0.5rem;
		height: 2rem;
		display: flex;
		align-items: center;
	}

	.loadout-name {
		font-size: large;
		font-weight: 500;
	}

	.loadout-description-display {
		padding: 0.5rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.edit-button-container {
		position: absolute;
		right: 0;
		top: 0.5rem;
		display: flex;
		gap: 0.5rem;
	}

	.edit-button {
		padding: 0.25rem;
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.edit-button:hover {
		background-color: var(--hover-bg);
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

	.loadout-settings {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-top: 1px solid var(--border-color);
		padding-top: 1.5rem;
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

		.loadout-settings {
			order: 3;
			width: 100%;
		}
	}
</style>
