<script lang="ts">
	import ActionToolbar from '$lib/components/ActionToolbar.svelte';
	import SwitchLoadout from '$lib/components/dialog/SwitchLoadout.svelte';
	import UploadScreenshot from '$lib/components/dialog/UploadScreenshot.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
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
	import { type StatGearUser } from '$lib/scripts/stats';
	import {
		ArrowRightLeftIcon,
		BoxIcon,
		CopyPlusIcon,
		ImagePlus,
		PencilIcon,
		RotateCcwIcon,
		Save,
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

	let selected_weapon_preset = $state('Preset 1');
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

	// Weapon preset options
	const WEAPON_PRESETS = ['Preset 1', 'Preset 2', 'Preset 3', 'Custom Preset'];

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
			loadout_image = await getImageUrlFromDB(current_loadout);
		}
	});

	// $inspect('image source', document.getElementById('user-upload')?.src);
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
		<div class="weapon-preset-container">
			<label for="weapon-preset">Select a weapon preset:</label>
			<select id="weapon-preset" bind:value={selected_weapon_preset}>
				{#each WEAPON_PRESETS as preset}
					<option value={preset}>{preset}</option>
				{/each}
			</select>
		</div>

		<p>Ignore this for now, not implemented yet.</p>
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

	.weapon-preset-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 300px;
	}

	.weapon-preset-container select {
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid var(--border-color);
		background-color: var(--button-bg);
		color: var(--text-color);
		font-size: 1rem;
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
