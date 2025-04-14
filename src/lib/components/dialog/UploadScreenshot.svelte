<script lang="ts">
	import { ImagePlus } from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	import Dialog from '../Dialog.svelte';

	import cv from '@techstark/opencv-js';

	type UploadCallbackType = 'canvas' | 'url' | 'file';

	let {
		open = $bindable(false),
		image = $bindable(''),
		text = $bindable(''),
		upload_type = 'canvas' as UploadCallbackType,
		prompt_on_open = true,
		close_on_upload = false,
		onFileUpload = (out: HTMLCanvasElement | string | File) => {}
	} = $props();

	function uploadImageCanvas(file: File | undefined) {
		text = 'Uploading...';

		if (file) {
			image = URL.createObjectURL(file);
			switch (upload_type) {
				case 'canvas': {
					setTimeout(() => {
						const canvas = document.createElement('canvas');
						const img = cv.imread('user-upload-full');
						cv.imshow(canvas, img);

						onFileUpload(canvas);

						img.delete();
					}, 1000);

					break;
				}
				case 'url': {
					onFileUpload(image);
					break;
				}

				case 'file': {
					onFileUpload(file);
					break;
				}

				default:
					console.error('Unknown upload type:', upload_type);
					break;
			}
		}

		if (close_on_upload) {
			open = false;
		}
	}

	function doPaste(event: ClipboardEvent) {
		if (!event.clipboardData) {
			return;
		}
		if (event.clipboardData.files.length <= 0) {
			return;
		}

		const file = event.clipboardData.files[0];
		if (file.type.startsWith('image/')) {
			uploadImageCanvas(file);
		}
	}

	function onchange(event: Event) {
		uploadImageCanvas((event.target as HTMLInputElement).files?.[0]);
	}

	onDestroy(() => {
		if (image) {
			URL.revokeObjectURL(image);
		}
	});

	$effect(() => {
		if (open && prompt_on_open) {
			// navigator.clipboard.read().then((items) => {
			// 	if (items.length > 0) {
			// 		items[0].getType('image/png').then((blob) => {
			// 			uploadImage(blob);
			// 		});
			// 	}
			// });

			document.getElementById('srcInput')?.click();
		}
	});
</script>

<Dialog title="From Screenshot" bind:open onpaste={doPaste}>
	<div class="screenshot-upload">
		<button
			class={image ? 'image' : 'icon'}
			onclick={() => document.getElementById('srcInput')?.click()}
		>
			{#if image}
				<img class="user-upload" id="user-upload" src={image} alt="Uploaded screenshot" />
				<img
					class="user-upload-full"
					id="user-upload-full"
					src={image}
					alt="Uploaded screenshot at full size"
					style="display: none"
				/>
			{:else}
				<ImagePlus size={64} class="upload-icon" />
			{/if}
		</button>

		<input type="file" id="srcInput" accept="image/*" {onchange} style="display:none;" />

		{#if image}
			<p class="upload-text">{text ?? 'Processing...'}</p>
		{:else}
			<p class="upload-text">Paste or upload screenshot here</p>
		{/if}
	</div>

	<style>
		.screenshot-upload {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 2rem;
			margin: 1rem 0;
		}

		.upload-icon {
			color: var(--text-color);
		}

		.upload-text {
			margin-top: 1rem;
			font-size: 0.9rem;
			color: var(--text-color);
		}
	</style>
</Dialog>
