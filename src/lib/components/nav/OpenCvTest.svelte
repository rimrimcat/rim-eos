<script lang="ts">
	import {
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/componentMetadata.svelte.ts';

	import { Trash2, Download, FilePlus2, ImagePlus, Image as ImageIcon } from '@lucide/svelte';
	import NavTools from '../NavTools.svelte';
	import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';

	let templateImage: HTMLImageElement;
	let sourceImage: HTMLImageElement;
	let matchScore: number = 0;
	let resultImageSrc: string = '';

	function handleTemplateUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				templateImage = new Image();
				templateImage.src = e.target?.result as string;
				templateImage.onload = findBestMatch;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleSourceUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				sourceImage = new Image();
				sourceImage.src = e.target?.result as string;
				sourceImage.onload = findBestMatch;
			};
			reader.readAsDataURL(file);
		}
	}

	function findBestMatch() {
		if (templateImage && sourceImage) {
			const source = cv.imread(sourceImage);
			const template = cv.imread(templateImage);
			const result = new cv.Mat();
			const mask = new cv.Mat();
			cv.matchTemplate(source, template, result, cv.TM_CCOEFF_NORMED, mask);
			const minMax = cv.minMaxLoc(result);
			matchScore = minMax.maxVal;

			const maxPoint = minMax.maxLoc;
			const point1 = new cv.Point(maxPoint.x, maxPoint.y);
			const point2 = new cv.Point(maxPoint.x + template.cols, maxPoint.y + template.rows);
			cv.rectangle(source, point1, point2, [0, 255, 0, 255], 2);

			const canvas = document.createElement('canvas');
			cv.imshow(canvas, source);
			resultImageSrc = canvas.toDataURL();

			source.delete();
			template.delete();
			result.delete();
			mask.delete();
		}
	}

	// register
	const id = 'opencv-test';

	const metadata: ComponentMetadata = {
		id,
		label: 'OpenCV Test',
		lucide: ImageIcon,
		showInNav: true,
		order: 10,
		tools: [
			{ id: 'screenshot', label: 'From Screenshot', lucide: ImagePlus },
			{ id: 'import', label: 'Import', lucide: FilePlus2 },
			{ id: 'export', label: 'Export', lucide: Download },
			{ id: 'reset', label: 'Reset', lucide: Trash2 },
			{ id: 'share', label: 'Share' }
		]
	};

	onMount(() => {
		registerComponent(id, metadata);
	});
</script>

<div class="opencv-test">
	<div class="image-upload">
		<div class="upload-container">
			<label for="templateInput">Upload Template Image</label>
			<input type="file" id="templateInput" accept="image/*" on:change={handleTemplateUpload} />
		</div>

		<div class="upload-container">
			<label for="sourceInput">Upload Source Image</label>
			<input type="file" id="sourceInput" accept="image/*" on:change={handleSourceUpload} />
		</div>
	</div>
	<div class="result-display">
		{#if resultImageSrc}
			<img src={resultImageSrc} alt="Result with best match" />
			<p>Match Score: {matchScore}</p>
		{/if}
	</div>
</div>

<NavTools tools={metadata.tools} />

<style>
	.opencv-test {
		max-width: 35rem;
	}

	.image-upload {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.upload-container {
		margin: 1rem;
	}

	.result-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 1rem;
		padding-top: 3rem;
	}

	.result-display img {
		max-width: 75%;
		height: auto;
	}
</style>
