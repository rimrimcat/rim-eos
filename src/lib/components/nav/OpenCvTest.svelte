<script lang="ts">
	import { registerComponent, type ComponentMetadata } from '$lib/scripts/navMetadata.svelte.ts';

	import { Trash2, Download, FilePlus2, ImagePlus, Image as ImageIcon } from '@lucide/svelte';
	import NavTools from '../NavTools.svelte';
	import { onMount } from 'svelte';

	import cv from '@techstark/opencv-js';
	import { createWorker } from 'tesseract.js';

	let templateImage: HTMLImageElement | null = $state(null);
	let sourceImage: HTMLImageElement | null = $state(null);
	let matchScore: number = $state(0);
	let resultImageSrc: string = $state('');

	let sourceImage2: HTMLImageElement | null = $state(null);
	let resultImageSrc2: string = $state('');
	let matchScore2: number = $state(0);

	let sourceImage3: HTMLImageElement | null = $state(null);
	let resultImageSrc3: string = $state('');
	let tesseractResult: string = $state('');

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
		if (templateImage && sourceImage && document !== undefined) {
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

	function* boxIterator(w: number, h: number, off_x: number = 0, off_y: number = 0) {
		const box_width = Math.round(0.23 * w);
		const box_height = Math.round(0.047 * h);

		const box_start_x = Math.round(0.061 * w) + off_x;
		const box_start_y = 0.922 * h + off_y;

		const box_start_x_2 = Math.round(0.625 * w) + off_x;

		const box_height_diff = h / 8;

		for (let i = 0; i < 8; i++) {
			yield new cv.Rect(
				box_start_x,
				Math.round(box_start_y - i * box_height_diff),
				box_width,
				box_height
			);
			yield new cv.Rect(
				box_start_x_2,
				Math.round(box_start_y - i * box_height_diff),
				box_width,
				box_height
			);
		}
	}

	function matchCharacterStats(src_mat: cv.Mat, minimumMatch: number = 0.9) {
		// remove possibly white pixels from top
		const _W = src_mat.cols;
		const _H = src_mat.rows;
		const midX = Math.floor(_W / 2);
		let consecutiveWhitePixels = 0;
		let maxConsecutiveWhitePixels = 0;

		for (let y = 0; y < Math.round(0.05 * _H); y++) {
			const pixel = src_mat.ucharPtr(y, midX);
			if (pixel[0] > 200 && pixel[1] > 200 && pixel[2] > 200) {
				consecutiveWhitePixels++;
				maxConsecutiveWhitePixels = Math.max(maxConsecutiveWhitePixels, consecutiveWhitePixels);
			} else {
				break;
			}
		}

		if (maxConsecutiveWhitePixels > 0) {
			const roi = new cv.Rect(0, maxConsecutiveWhitePixels, _W, _H - maxConsecutiveWhitePixels);
			src_mat = src_mat.roi(roi);
		}

		// constants
		const W = src_mat.size().width;
		const H = src_mat.size().height;
		console.error('W/H: ', W, H);

		const minmrh = Math.min(W, (16 / 9) * H);
		const some_factor = W > minmrh ? Math.round(2 * Math.log10(W - minmrh) - 2) / 100 : 0;
		console.error('minmrh', minmrh);
		console.error('some_factor: ', some_factor);

		const expected_template_size_x = Math.round(minmrh / 58);
		const expected_template_size_y = Math.round(minmrh / 55);
		console.error('Template Size: ', expected_template_size_x, expected_template_size_y);

		let resized_template = new cv.Mat();

		// assumes that we would get image with less res than template
		cv.resize(
			cv.imread('templateImage').clone(),
			resized_template,
			new cv.Size(expected_template_size_x, expected_template_size_y),
			cv.INTER_AREA
		);

		function smolMatching() {
			console.error('RUNNING SMOL MATCHING');

			const search_center_x = W * (0.64 + some_factor);
			const search_center_y = H * 0.52;

			let cropped_src = src_mat.clone();
			const roi_start_x = search_center_x - 2 * expected_template_size_x;
			const roi_start_y = search_center_y - 2 * expected_template_size_y;
			const roi = new cv.Rect(
				roi_start_x,
				roi_start_y,
				expected_template_size_x * 4,
				expected_template_size_y * 4
			);

			cropped_src = cropped_src.roi(roi);

			// Perform template matching
			const result = new cv.Mat();
			cv.matchTemplate(cropped_src, resized_template, result, cv.TM_CCOEFF_NORMED);

			// Find the best match location
			// @ts-ignore
			const minMax = cv.minMaxLoc(result);
			const maxLoc = minMax.maxLoc;
			const maxVal = minMax.maxVal;

			// draw rectangles
			const search_p1 = new cv.Point(roi_start_x, roi_start_y);
			const search_p2 = new cv.Point(
				roi_start_x + expected_template_size_x * 4,
				roi_start_y + expected_template_size_y * 4
			);

			const best_p1 = new cv.Point(search_p1.x + maxLoc.x, search_p1.y + maxLoc.y);
			const best_p2 = new cv.Point(
				best_p1.x + expected_template_size_x,
				best_p1.y + expected_template_size_y
			);

			const stat_p1 = new cv.Point(best_p1.x, best_p1.y - Math.round(minmrh / 26.5));
			const stat_p2 = new cv.Point(
				stat_p1.x + Math.round(minmrh / 3),
				stat_p1.y + Math.round(H / 2.09)
			);

			result.delete();
			resized_template.delete();
			cropped_src.delete();

			if (maxVal > minimumMatch) {
				// test iterator
				for (const _rect of boxIterator(
					stat_p2.x - stat_p1.x,
					stat_p2.y - stat_p1.y,
					stat_p1.x,
					stat_p1.y
				)) {
					(async () => {
						const _crop = src_mat.roi(_rect);
						const canvas = document.createElement('canvas');
						cv.imshow(canvas, _crop);
						const data_url = canvas.toDataURL();

						const worker = await createWorker('eng');
						const ret = await worker.recognize(data_url);
						console.error('ret.data.text: ', ret.data.text);
						await worker.terminate();
					})();
				}

				cv.rectangle(src_mat, best_p1, best_p2, new cv.Scalar(255, 0, 0, 255), 2); // best match
				cv.rectangle(src_mat, search_p1, search_p2, new cv.Scalar(0, 0, 255, 255), 2); // search area
				cv.rectangle(src_mat, stat_p1, stat_p2, new cv.Scalar(0, 255, 0, 255), 2); // stat area
			}

			return maxVal;
		}

		function beegMatching() {
			// Perform template matching
			const result = new cv.Mat();
			cv.matchTemplate(src_mat, resized_template, result, cv.TM_CCOEFF_NORMED);

			// Find the best match location
			// @ts-ignore
			const minMax = cv.minMaxLoc(result);
			const maxLoc = minMax.maxLoc;
			const maxVal = minMax.maxVal;

			// Draw rectangle around the matched region on original source

			const best_p1 = new cv.Point(maxLoc.x, maxLoc.y);
			const best_p2 = new cv.Point(
				best_p1.x + expected_template_size_x,
				best_p1.y + expected_template_size_y
			);

			result.delete();
			resized_template.delete();

			if (maxVal > minimumMatch) {
				cv.rectangle(src_mat, best_p1, best_p2, new cv.Scalar(255, 0, 0, 255), 2); // best match
			}

			return maxVal;
		}

		const maxVal = smolMatching();
		if (maxVal > minimumMatch) {
			return {
				image: src_mat,
				score: maxVal
			};
		}
		return {
			image: src_mat,
			score: beegMatching()
		};
	}

	function handleSourceUploadCrit(event: Event) {
		function doMatch() {
			if (sourceImage2 && document !== undefined) {
				const source = cv.imread(sourceImage2);
				const match_obj = matchCharacterStats(source);

				const canvas = document.createElement('canvas');
				cv.imshow(canvas, match_obj.image);
				resultImageSrc2 = canvas.toDataURL();

				matchScore2 = match_obj.score;

				source.delete();
				match_obj.image.delete();
			}
		}

		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				sourceImage2 = new Image();
				sourceImage2.src = e.target?.result as string;
				sourceImage2.onload = doMatch;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleTesseractUpload(event: Event) {
		function startTess() {
			if (sourceImage3 && document !== undefined) {
				const source = cv.imread(sourceImage3);
				const canvas = document.createElement('canvas');
				cv.imshow(canvas, source);
				resultImageSrc3 = canvas.toDataURL();

				source.delete();
			}

			(async () => {
				const worker = await createWorker('eng');
				// const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
				const ret = await worker.recognize(sourceImage3.src);
				tesseractResult = ret.data.text;
				await worker.terminate();
			})();
		}

		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				sourceImage3 = new Image();
				sourceImage3.src = e.target?.result as string;
				sourceImage3.onload = startTess;
			};
			reader.readAsDataURL(file);
		}
	}

	// register
	const id = 'opencv-test';

	const metadata: ComponentMetadata = {
		id,
		label: 'OpenCV Test',
		lucide: ImageIcon,
		showInNav: true,
		order: 10
	};

	onMount(() => {
		registerComponent(id, metadata);
	});
</script>

<img
	id="templateImage"
	src="./template/template_crit.png"
	alt="Template for crit"
	style="display: none"
/>

<div class="opencv-test">
	<h1>OpenCV Test</h1>
	<div class="image-upload">
		<div class="upload-container">
			<label for="templateInput">Upload Template Image</label>
			<input type="file" id="templateInput" accept="image/*" onchange={handleTemplateUpload} />
		</div>

		<div class="upload-container">
			<label for="sourceInput">Upload Source Image</label>
			<input type="file" id="sourceInput" accept="image/*" onchange={handleSourceUpload} />
		</div>
	</div>
	<div class="result-display">
		{#if resultImageSrc}
			<img src={resultImageSrc} alt="Result with best match" />
			<p>Match Score: {matchScore}</p>
		{/if}
	</div>

	<h1>OpenCV Test: Crit Only</h1>
	<div class="image-upload">
		<div class="upload-container">
			<label for="sourceInput2">Upload Source Image 2</label>
			<input type="file" id="sourceInput2" accept="image/*" onchange={handleSourceUploadCrit} />
		</div>
	</div>

	<div class="result-display">
		{#if resultImageSrc2}
			<img src={resultImageSrc2} alt="Result with best match" />
			<p>Match Score: {matchScore2}</p>
		{/if}
	</div>

	<h1>Tesseract Test</h1>

	<div class="image-upload">
		<div class="upload-container">
			<label for="sourceInput3">Upload Source Image 3</label>
			<input type="file" id="sourceInput3" accept="image/*" onchange={handleTesseractUpload} />
		</div>
	</div>
	<div class="result-display">
		{#if resultImageSrc3 || tesseractResult}
			<img src={resultImageSrc3} alt="Result with best match" />
			<p>{tesseractResult}</p>
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
		max-width: 80vw;
	}

	.result-display img {
		max-width: 75%;
		height: auto;
	}
</style>
