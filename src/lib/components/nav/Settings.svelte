<script>
	import { onMount } from 'svelte';
	import ComponentTools from '../ComponentTools.svelte';
	import { registerComponent } from '$lib/scripts/componentMetadata.svelte.ts';

	// Component ID
	const id = 'settings';

	// Define this component's metadata including tools
	const metadata = {
		id,
		label: 'Settings',
		icon: 'settings',
		showInNav: true,
		order: 2, // After analytics
		tools: [
			{ id: 'save', label: 'Save', icon: 'save' },
			{ id: 'reset', label: 'Reset', icon: 'rotate-ccw' }
		]
	};

	onMount(() => {
		// Register only once on mount
		registerComponent(id, metadata);
	});

	// Settings component logic here
	let notifications = true;
	let darkMode = false;
	let autoSave = true;
</script>

<div class="settings-container">
	<div class="settings-content">
		<h1>Settings</h1>

		<div class="settings-section">
			<h2>User Preferences</h2>

			<div class="setting-item">
				<div class="setting-info">
					<h3>Notifications</h3>
					<p>Receive notifications about updates and activity</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={notifications} />
					<span class="toggle-slider"></span>
				</label>
			</div>

			<div class="setting-item">
				<div class="setting-info">
					<h3>Dark Mode</h3>
					<p>Switch between light and dark theme</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={darkMode} />
					<span class="toggle-slider"></span>
				</label>
			</div>

			<div class="setting-item">
				<div class="setting-info">
					<h3>Auto Save</h3>
					<p>Automatically save changes</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={autoSave} />
					<span class="toggle-slider"></span>
				</label>
			</div>
		</div>
	</div>

	<ComponentTools tools={metadata.tools} />
</div>

<style>
	.settings-container {
		display: flex;
		height: 100%;
	}

	.settings-content {
		flex: 1;
		padding: 20px;
		overflow-y: auto;
	}

	.settings-section {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		margin-top: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px 0;
		border-bottom: 1px solid #e0e0e0;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-info h3 {
		margin: 0 0 5px 0;
	}

	.setting-info p {
		margin: 0;
		color: #666;
		font-size: 14px;
	}

	.toggle {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 24px;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 24px;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .toggle-slider {
		background-color: #4c9aff;
	}

	input:checked + .toggle-slider:before {
		transform: translateX(26px);
	}
</style>
