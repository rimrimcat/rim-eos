<script lang="ts">
	import { validateValue, FLOAT_PERCENT_3D, INTEGER } from '$lib/scripts/validation.ts';
	import { LOCAL_STATS_MAIN, loadObject, saveObject } from '$lib/scripts/loader.ts';
	import { type AttributeItem } from '$lib/scripts/loader.ts';
	import { registerComponent, type ComponentMetadata } from '$lib/scripts/navMetadata.svelte.ts';

	import {
		ChartNoAxesColumn,
		Shirt,
		Download,
		FilePlus2,
		ImagePlus,
		Asterisk
	} from '@lucide/svelte';
	import NavTools from '../NavTools.svelte';
	import { onMount } from 'svelte';
	import UploadScreenshot from '../dialog/UploadScreenshot.svelte';
	import cv from '@techstark/opencv-js';
	import { createWorker } from 'tesseract.js';
	import FlexGrid from '../FlexGrid.svelte';

	let user_gears;
	let validated_gears;
	let fourStatMode = $state(true);

	let screenshotDialogOpen = $state(false);
	let uploadedImageURL: string = $state('');
	let processText: string = $state('');

	const ocr_stat_map = {
		atk: 'atk'
	};

	async function testRawCV(canvas: HTMLCanvasElement) {
		const worker = await createWorker('eng');
		const data_url = canvas.toDataURL();

		const ret = await worker.recognize(data_url);

		await worker.terminate();

		let txt = ret.data.text
			.toLowerCase()
			.replace(/^[^\s]{1,3} /gm, '')
			.split('\n');

		const armorType = txt[0];
		console.log(armorType);

		const rsIndex = txt.findIndex((line) => line.includes('random stats'));
		if (rsIndex) {
			txt.slice(rsIndex + 1).forEach((line) => {
				let spl = line.split('+');

				console.log(line);
			});
		}

		// console.log(txt);

		// const startReadIndex = txt.indexOf('random stats');

		// if (startReadIndex !== -1) {
		// 	console.error('start read index', startReadIndex);
		// 	txt = txt.slice(startReadIndex);
		// }

		// txt.split('\n').forEach((line) => {
		// 	console.log(line);
		// });
	}

	function onFileUpload(canvas: HTMLCanvasElement) {
		if (uploadedImageURL && canvas) {
			testRawCV(canvas);

			// const img = cv.imread(canvas); // cant read unless from canvas or img id
			// matchCharacterStats(img, async (img) => {
			// 	const canvas = document.createElement('canvas');
			// 	cv.imshow(canvas, img);
			// 	uploadedImageURL = canvas.toDataURL();
			// });
		}
	}

	// register
	const id = 'gear-page';

	const metadata: ComponentMetadata = {
		id,
		label: 'Gears',
		lucide: Shirt,
		showInNav: true,
		order: 1,
		tools: [
			{
				id: 'screenshot',
				label: 'From Screenshot',
				lucide: ImagePlus,
				action: () => (screenshotDialogOpen = true)
			}
		]
	};

	onMount(() => {
		registerComponent(id, metadata);
	});
</script>

<div class="gear-page">
	<FlexGrid maxColumns={1}>
		<div class="gear-cell">
			<div class="gear-icon">
				<div class="icon-container">
					<img src="./gear/helmet.png" alt="Helmet" />
				</div>
			</div>

			{#if fourStatMode}
				<div class="stats-container">
					<div class="stats-grid">
						<div class="stat-item top-left">
							<div class="stat-content">Stat 1</div>
						</div>
						<div class="stat-item top-right">
							<div class="stat-content">Stat 2</div>
						</div>
						<div class="stat-item bottom-left">
							<div class="stat-content">Stat 3</div>
						</div>
						<div class="stat-item bottom-right">
							<div class="stat-content">Stat 4</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="single-stat">
					<div class="stat">Stat 1</div>
				</div>
			{/if}
		</div>
	</FlexGrid>
</div>

<UploadScreenshot
	{onFileUpload}
	bind:open={screenshotDialogOpen}
	bind:uploadedImageURL
	bind:processText
/>

<NavTools tools={metadata.tools} />

<style>
	.gear-page {
		padding: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
		overflow: scroll;
	}

	.gear-cell {
		background-color: var(--bg-color);
		display: flex;
		flex-direction: row;
		width: 100%;
		/* border: 2px solid #000; */
		padding: 1rem;
	}

	.gear-icon {
		width: 5rem;
		/* min-width: 130px; */
		margin-right: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-container {
		width: 100%;
		height: 100%;
		/* border: 2px solid #000; */
		/* border-radius: 2rem;
		background-color: #ffffff; */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.gear-icon img {
		display: block;
		width: 90%;
		height: 90%;
		object-fit: contain;
	}

	.stats-container {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 1rem;
		width: 100%;
		height: 130px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-content {
		padding: 5px;
	}

	.single-stat {
		flex: 1;
		padding: 1rem;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
