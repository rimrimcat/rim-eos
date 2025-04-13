<script lang="ts">
	import ActionToolbar from '$lib/components/ActionToolbar.svelte';
	import SwitchLoadout from '$lib/components/dialog/SwitchLoadout.svelte';
	import UploadScreenshot from '$lib/components/dialog/UploadScreenshot.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import type { MatrixEffectsIds, ResoEffectsIds, WeaponEffectsIds } from '$lib/generated/ids';
	import {
		getMatrix,
		getMatrixEffect,
		getResoEffects,
		getWeapon,
		getWeaponEffect
	} from '$lib/scripts/json-loader';
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
		type MatrixFinalEffect,
		type MatrixView,
		type ResoEffect,
		type ResoTriggerCounts,
		type UserMatrix,
		type UserWeapon,
		type Weapon,
		type WeaponEffect,
		type WeaponSettingStuff,
		type WeaponView
	} from '$lib/scripts/weapons';
	import {
		ArrowRightLeftIcon,
		BoxIcon,
		ChartNoAxesColumnIcon,
		CopyPlusIcon,
		PencilIcon,
		RotateCcwIcon,
		Save,
		StarIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		isMobile = $bindable(false),
		user_loadouts = $bindable({} as AllLoadouts),
		current_loadout = $bindable(''),
		font_size = $bindable(16),
		inner_width = $bindable(1000)
	} = $props();

	// State
	let loadout_name = $state('');
	let loadout_desc = $state('');
	let loadout_icon = $state('');
	let loadout_image = $state('');

	let user_weapons = $state([{}, {}, {}] as UserWeapon[]);
	let user_matrices = $state([{}, {}, {}] as UserMatrix[]);

	let loadout_base_weapons = $state([] as Weapon[]);
	let loadout_reso_counts = $state({} as ResoTriggerCounts);

	let loadout_weapon_views = $state([{}, {}, {}] as WeaponView[]);
	let loadout_matrix_views = $state([] as MatrixView[]);
	let loadout_weapmat_combined: [WeaponView, MatrixView][] = $state([]);

	let loadout_resonance_effects = $state([] as ResoEffect[]);
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

	// helper function for updateResoEffects
	async function pushValidResoEffect(effectIds: ResoEffectsIds[], reso_effects_: ResoEffect[]) {
		await Promise.all(
			effectIds.map(async (eff) => {
				const effect = await getResoEffects(eff);
				if (effect && effect.id && !reso_effects_.some((eff2) => eff2.id === effect.id)) {
					reso_effects_.push(effect);
				}
			})
		);
	}
	// helper function for weapon views
	async function pushAllValidWeaponEffects(
		effs: WeaponEffectsIds[],
		advancement: number,
		effects_: WeaponEffect[],
		stat_: StatCollection[]
	) {
		await Promise.all(
			effs.map(async (eff_) => {
				const eff = await getWeaponEffect(eff_);
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

				effects_.push(eff);
				stat_[0] = stat_[0].add(new StatCollection(eff.stats));
			})
		);
	}

	// helper function for matrix views
	async function pushAllValidMatrixEffects(
		effs: MatrixEffectsIds[],
		advancement: number,
		effects_: MatrixFinalEffect[],
		stat_: StatCollection[]
	) {
		await Promise.all(
			effs.map(async (eff_) => {
				const eff = await getMatrixEffect(eff_);
				if (eff.require_reso) {
					const required_reso_count = eff.require_reso_count ?? 2;
					if (loadout_reso_counts[eff.require_reso] ?? 0 < required_reso_count) {
						return;
					}
				}

				// TEMPORARILY DISABLE ONFIELD EFFECTS
				if (eff.duration !== undefined && eff.duration === 0) {
					return;
				}

				const keys = Object.keys(eff.stats);
				const finalEffect = {
					...eff,
					stats: {}
				};
				keys.forEach((key) => {
					// @ts-expect-error
					finalEffect.stats[key] = eff.stats[key][advancement];
				});

				effects_.push(finalEffect);
				stat_[0] = stat_[0].add(new StatCollection(finalEffect.stats));
			})
		);
	}

	async function updateResoCounts() {
		loadout_reso_counts = loadout_base_weapons.reduce((counts, weapon, index) => {
			weapon.resonances.forEach((resonance) => {
				counts[resonance] = (counts[resonance] ?? 0) + 1;
			});
			if (weapon.setting) {
				const selected_settings = user_weapons[index].setting ?? weapon.setting.default;
				selected_settings.forEach((setting) => {
					// @ts-expect-error
					const setting_data = weapon.setting.choices[setting];
					if (setting_data.resonances) {
						setting_data.resonances.forEach((resonance) => {
							counts[resonance] = (counts[resonance] ?? 0) + 1;
						});
					}
				});
			}

			return counts;
		}, {} as ResoTriggerCounts);
	}

	async function updateResoEffects() {
		console.log('Updating reso effects...');
		const reso_effects: ResoEffect[] = [];

		await Promise.all(
			loadout_base_weapons.map(async (weapon, index) => {
				if (weapon.reso_effects) {
					await pushValidResoEffect(weapon.reso_effects, reso_effects);
				}

				if (weapon.setting) {
					const selected_settings = user_weapons[index].setting ?? weapon.setting.default;

					await Promise.all(
						selected_settings.map(async (setting) => {
							// @ts-expect-error
							const setting_data = weapon.setting.choices[setting];
							if (setting_data.reso_effects) {
								await pushValidResoEffect(setting_data.reso_effects, reso_effects);
							}
						})
					);
				}
			})
		);
		// add default reso
		reso_effects.push(await getResoEffects('atk'));
		reso_effects.push(await getResoEffects('atk-teamplay'));
		reso_effects.push(await getResoEffects('bene'));
		reso_effects.push(await getResoEffects('bene-teamplay'));
		reso_effects.push(await getResoEffects('armor-dissolve'));
		reso_effects.push(await getResoEffects('armor-dissolve-teamplay'));
		reso_effects.push(await getResoEffects('force-impact'));
		reso_effects.push(await getResoEffects('force-impact-teamplay'));

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

				// active effects
				const effects: WeaponEffect[] = [];
				const stat_ = [new StatCollection()];

				await pushAllValidWeaponEffects(weapon.effects ?? [], advancement, effects, stat_);
				const setting_ids = user_weapons[index].setting ?? weapon.setting?.default ?? [];
				const setting: WeaponSettingStuff[] = setting_ids.map((setting_) => {
					// @ts-expect-error
					return weapon.setting.choices[setting_];
				});

				if (weapon.setting) {
					await Promise.all(
						setting_ids.map(async (setting_) => {
							// @ts-expect-error
							const setting_data = weapon.setting.choices[setting_];
							if (setting_data.effects) {
								return await pushAllValidWeaponEffects(
									setting_data.effects,
									advancement,
									effects,
									stat_
								);
							}
						})
					);
				}
				const stat = stat_[0];

				return {
					id: weapon.id,
					name: weapon.name,
					resonances: weapon.resonances,
					onfieldness: weapon.onfieldness,
					advancement,
					setting,

					base_stat,
					effects,
					stat
				} as WeaponView;
			})
		);
	}

	async function updateMatrixViews() {
		loadout_matrix_views = await Promise.all(
			user_matrices.map(async (matrix, index) => {
				const advancement = matrix.advancement ?? 3;

				const effects: MatrixFinalEffect[] = [];
				const stat_ = [new StatCollection()];
				const matrix_ = await getMatrix(matrix.id);

				await pushAllValidMatrixEffects(matrix_.effects, advancement, effects, stat_);
				const stat = stat_[0];

				return {
					id: matrix_.id,
					name: matrix_.name,
					advancement,
					effects,
					stat
				} as MatrixView;
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

		// active effects
		const effects: WeaponEffect[] = [];
		const stat_ = [new StatCollection()];

		await pushAllValidWeaponEffects(weapon.effects ?? [], advancement, effects, stat_);
		const setting_ids = user_weapons[index].setting ?? weapon.setting?.default ?? [];
		const setting: WeaponSettingStuff[] = setting_ids.map((setting_) => {
			// @ts-expect-error
			return weapon.setting.choices[setting_];
		});

		if (weapon.setting) {
			await Promise.all(
				setting_ids.map(async (setting) => {
					// @ts-expect-error
					const setting_data = weapon.setting.choices[setting];
					if (setting_data.effects) {
						return await pushAllValidWeaponEffects(
							setting_data.effects,
							advancement,
							effects,
							stat_
						);
					}
				})
			);
		}
		const stat = stat_[0];

		loadout_weapon_views[index] = {
			id: weapon.id,
			name: weapon.name,
			resonances: weapon.resonances,
			onfieldness: weapon.onfieldness,
			advancement,
			setting,

			base_stat,
			effects,
			stat
		} as WeaponView;

		loadout_weapmat_combined[index][0] = loadout_weapon_views[index];
	}

	async function updateSingleMatrixView(index: number) {
		const matrix = user_matrices[index];
		const advancement = matrix.advancement ?? 3;

		const effects: MatrixFinalEffect[] = [];
		const stat_ = [new StatCollection()];
		const matrix_ = await getMatrix(matrix.id);

		await pushAllValidMatrixEffects(matrix_.effects, advancement, effects, stat_);
		const stat = stat_[0];

		loadout_matrix_views[index] = {
			id: matrix_.id,
			name: matrix_.name,
			advancement,
			effects,
			stat
		} as MatrixView;

		loadout_weapmat_combined[index][1] = loadout_matrix_views[index];
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

		// ... and matrices
		await updateMatrixViews();

		loadout_weapmat_combined = loadout_weapon_views.map((item, i) => [
			item,
			loadout_matrix_views[i]
		]);
	}

	function saveWeaponMatrixLoadout() {
		user_loadouts[current_loadout].equipped_weapons = user_weapons;
		user_loadouts[current_loadout].equipped_matrices = user_matrices;
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
			user_matrices = user_loadouts[current_loadout].equipped_matrices;
			loadout_image = await getImageUrlFromDB(current_loadout);

			await updateAll();
		}
	});

	// $inspect('image source', document.getElementById('user-upload')?.src);
	$inspect('loadout weapons', user_weapons);
	$inspect('weapon views', loadout_weapon_views);
	$inspect('matrix views', loadout_matrix_views);
	$inspect('weapmat', loadout_weapmat_combined);
</script>

{#snippet matrix4p(matrix: MatrixView, sizeScale: number = 1)}
	{#each [0, 1, 2, 3] as index}
		<div class="compose-above" style="top: -0.5rem; left: {-0.75 + 0.5 * index}rem">
			<img
				src="./matrix/{matrix.id.replace('-4p', '')}.webp"
				alt="Matrix"
				style="height: 6rem; width:6rem;"
			/>
		</div>
	{/each}
{/snippet}

{#snippet showMatrices(matrix: MatrixView, index: number, sizeScale: number = 1)}
	<div class="vertical center matrix-col" style="width: 6rem;">
		<span class="matrix-name">{matrix.name}</span>
		<div class="horizontal matrix-container">
			<div class="compose below border" style="width: 6rem; height: 6rem; margin-top: 0.4rem;">
				{#if matrix.id.includes('4p')}
					{@render matrix4p(matrix)}
				{/if}
				{#each [1, 2, 3] as advSetValue, advIndex}
					<button
						class="image"
						onclick={() => {
							if (matrix.advancement === advSetValue) {
								user_matrices[index].advancement = 0;
							} else {
								user_matrices[index].advancement = advSetValue;
							}
							saveWeaponMatrixLoadout();
							updateSingleMatrixView(index);
						}}
					>
						<div class="compose above" style="top: 4.5rem; left:{1.5 + advIndex}rem">
							<StarIcon
								size={font_size}
								fill={matrix.advancement >= advSetValue ? 'white' : 'none'}
							/>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/snippet}

<div class="loadout-page" style={any_dialog_open ? 'overflow: hidden;' : ''}>
	<h1>Loadout</h1>

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

	<div class="loadout-settings">
		<h2>Weapon Presets</h2>
		<div class="vertical-left" style="margin-bottom: 2rem;">
			<!-- button for mobile players since not enough space -->
			<button class="image border" style="width:fit-content;">
				<ChartNoAxesColumnIcon />
				<label class="in-button" for="">Stat Breakdown</label>
			</button>
		</div>

		<div class="horizontal">
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
									<div class="compose above" style="top:-0.5rem">
										<img
											src="./weapon/{weapon.id}.webp"
											alt="Weapon"
											style="height:8rem; width:8rem;"
										/>
									</div>
									{#if weapon.setting && weapon.setting.length > 0}
										<div class="compose above" style="top: 0.5rem; left: 0.5rem;">
											{#each weapon.setting as setting, settingIndex}
												<button
													class="image"
													onclick={() => {
														// get keys in settings
														if (!loadout_base_weapons[index].setting) {
															return;
														}

														const selected_keys = weapon.setting.map((setting) => setting.id);
														const keys = Object.keys(loadout_base_weapons[index].setting.choices);

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
															user_weapons[index].setting =
																loadout_base_weapons[index].setting.default;
														}
														user_weapons[index].setting[settingIndex] = currKey;
														saveWeaponMatrixLoadout();
														// nola can change elements and reso
														updateAll();
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
									{:else}
										<div class="compose above" style="top: 0.5rem; left: 0.5rem">
											<StatIcon
												stat={weapon.resonances[0] as LoadoutType}
												size="1.5rem"
												style="background-color: var(--button-bg); border-radius: 50%;"
											/>
										</div>
									{/if}

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
													size={font_size}
													fill={weapon.advancement >= advSetValue ? 'white' : 'none'}
												/>
											</div>
										</button>
									{/each}
								</div>
							</div>

							{#if inner_width < 500}
								<div style="margin-top: 1rem; margin-bottom: 1.5rem;">
									{@render showMatrices(matrix, index)}
								</div>
							{/if}
						</div>
						{#if inner_width >= 500}
							{@render showMatrices(matrix, index)}
						{/if}
					</div>
				{/each}
			</div>
			{#if inner_width > 700}
				<div class="vertical" style="margin-left: 2rem;">
					<p>wher am i</p>
				</div>
			{/if}
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

<ActionToolbar actions={metadata.actions} bind:is_mobile={isMobile} />

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

		.loadout-settings {
			order: 3;
			width: 100%;
		}
	}
</style>
