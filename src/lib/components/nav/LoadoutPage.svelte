<script lang="ts">
	import {
		ActionType,
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/navMetadata.svelte.ts';

	import {
		BoxIcon,
		Download,
		FilePlus2,
		ImagePlus,
		PencilIcon,
		Save,
		Trash2,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import ActionToolbar from '../ActionToolbar.svelte';
	import StatIcon from '../StatIcon.svelte';
	import UploadScreenshot from '../dialog/UploadScreenshot.svelte';

	let { isMobile = $bindable(false) } = $props();

	// State
	let loadoutName = $state('Default Loadout');
	let loadoutDescription = $state('A balanced loadout for all situations');
	let loadoutImageBase64 = $state('');
	let selectedWeaponPreset = $state('Preset 1');
	let selectedElement = $state('flame');
	let isEditing = $state(false);

	// Dialog
	let uploadDialogOpen = $state(false);
	let processText = $state('');

	// Element options
	const elements = [
		{ value: 'flame', label: 'Flame' },
		{ value: 'frost', label: 'Frost' },
		{ value: 'volt', label: 'Volt' },
		{ value: 'phys', label: 'Physical' },
		{ value: 'alt', label: 'Altered' }
	];

	// Weapon preset options
	const weaponPresets = ['Preset 1', 'Preset 2', 'Preset 3', 'Custom Preset'];

	function toggleEditing() {
		isEditing = !isEditing;
	}

	function handleImageUpload(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = 200;
				canvas.height = 200;
				ctx?.drawImage(img, 0, 0, 200, 200);
				loadoutImageBase64 = canvas.toDataURL('image/jpeg');
			};
			img.src = e.target?.result as string;
		};
		reader.readAsDataURL(file);
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
				id: 'screenshot',
				label: 'Upload Image',
				lucide: ImagePlus,
				type: ActionType.BUTTON,
				callback: () => document.getElementById('srcInput')?.click()
			},
			{ id: 'import', label: 'Import', lucide: FilePlus2 },
			{ id: 'export', label: 'Export', lucide: Download },
			{
				id: 'reset',
				label: 'Reset',
				lucide: Trash2,
				type: ActionType.BUTTON,
				callback: resetLoadout
			}
		]
	};

	function resetLoadout() {
		loadoutName = 'Default Loadout';
		loadoutDescription = 'A balanced loadout for all situations';
		loadoutImageBase64 = '';
		selectedWeaponPreset = 'Preset 1';
		selectedElement = 'flame';
		isEditing = false;
	}

	onMount(() => {
		registerComponent(id, metadata);
	});

	$inspect('b64 image:', loadoutImageBase64);
	// $inspect('image source', document.getElementById('user-upload')?.src);
</script>

<div class="loadout-page">
	<h1 class="Pro">Loadout</h1>

	<div class="loadout-container">
		<div class="loadout-content">
			<div class="loadout-info">
				<div class="loadout-header">
					{#if isEditing}
						<div class="element-selector">
							<select id="element-select" bind:value={selectedElement}>
								{#each elements as element}
									<option value={element.value}>{element.label}</option>
								{/each}
							</select>
						</div>
						<div class="editable-fields">
							<input
								id="loadout-name"
								type="text"
								bind:value={loadoutName}
								placeholder="Enter loadout name"
							/>
							<textarea
								id="loadout-description"
								bind:value={loadoutDescription}
								placeholder="Enter loadout description"
								rows="3"
							></textarea>
						</div>
					{:else}
						<div class="loadout-title-area">
							<div class="element-display">
								<div class="element-icon">
									<StatIcon
										stat={(selectedElement + '_atk') as import('$lib/scripts/stats').StatGearUser}
										size="2rem"
									/>
								</div>
							</div>
							<div class="loadout-name-display">
								<span class="loadout-name">{loadoutName}</span>
							</div>
						</div>
						<div class="loadout-description-display">
							<p>{loadoutDescription}</p>
						</div>
					{/if}

					<div class="edit-button-container">
						{#if isEditing}
							<button class="edit-button" onclick={toggleEditing} title="Save changes">
								<Save size={18} />
							</button>
							<button class="cancel-button" onclick={toggleEditing} title="Cancel editing">
								<X size={18} />
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
					class={loadoutImageBase64 ? 'image' : 'image'}
					onclick={() => (uploadDialogOpen = true)}
					disabled={!isEditing}
					aria-label="Upload image"
				>
					{#if loadoutImageBase64}
						<img class="user-upload" id="user-upload" src={loadoutImageBase64} alt="Loadout" />
					{:else}
						<ImagePlus size={64} class="upload-icon" />
					{/if}
				</button>
			</div>
		</div>

		<div class="loadout-settings">
			<div class="weapon-preset-container">
				<label for="weapon-preset">Weapon Preset:</label>
				<select id="weapon-preset" bind:value={selectedWeaponPreset}>
					{#each weaponPresets as preset}
						<option value={preset}>{preset}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</div>

<div class="hidden-stuff"></div>

<UploadScreenshot
	bind:open={uploadDialogOpen}
	onFileUpload={handleImageUpload}
	bind:processText
	uploadType="file"
	promptOnOpen={true}
	closeOnUpload={true}
/>
<ActionToolbar actions={metadata.actions} bind:isMobile />

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

	.edit-button,
	.cancel-button {
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

	.edit-button:hover,
	.cancel-button:hover {
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
		width: 75%;
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
