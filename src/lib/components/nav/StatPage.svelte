<script lang="ts">
	import ActionToolbar from '$lib/components/ActionToolbar.svelte';
	import UploadScreenshot from '$lib/components/dialog/UploadScreenshot.svelte';
	import FlexGrid from '$lib/components/FlexGrid.svelte';
	import type { UserGear } from '$lib/scripts/gears';
	import { saveObject, TEMPLATE_USER_ATTRIBUTES } from '$lib/scripts/loader.ts';
	import type { AllLoadouts } from '$lib/scripts/loadouts';
	import {
		ActionType,
		registerComponent,
		type ComponentMetadata
	} from '$lib/scripts/navMetadata.svelte.ts';
	import { type AttributeItem } from '$lib/scripts/stats';
	import { FLOAT_PERCENT_3D, INTEGER, validateValue } from '$lib/scripts/validation.ts';
	import { ChartNoAxesColumn, ImagePlus, Trash2 } from '@lucide/svelte';
	import cv from '@techstark/opencv-js';
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';

	let {
		is_mobile = $bindable(false),
		user_gears = $bindable([] as UserGear[]),
		user_loadouts = $bindable({} as AllLoadouts),
		current_loadout = $bindable('')
	} = $props();

	// State
	let user_attributes: AttributeItem[] = $state([]);
	let validated_attributes: AttributeItem[] = $state([]);
	let edit_value: string = $state('');
	let editing_index: number | null = $state(null);
	let screenshot_dialog_open = $state(false);
	let uploaded_image_url: string = $state('');
	let process_text: string = $state('');

	// Process and validate attributes
	function processAttributes() {
		validated_attributes = user_attributes.map((attr, index) => {
			const __val = attr.value;
			const __use_percent = index === 2 || index === 10;
			return {
				...attr,
				value: __use_percent
					? validateValue(FLOAT_PERCENT_3D, __val)
					: validateValue(INTEGER, __val)
			};
		});
	}

	function saveAttributes(attributes: AttributeItem[]) {
		// get stringified array of values
		const base_stats = attributes.map((attr) => attr.value);
		user_loadouts[current_loadout].base_stats = base_stats;
		saveObject('loadouts_v1', user_loadouts);
	}

	function startEditCell(index: number) {
		editing_index = index;
		const user_value = user_attributes[index].value;
		edit_value = user_value !== undefined ? user_value : '';

		// Automatically select all content when starting to edit the cell
		setTimeout(() => {
			const input = document.getElementsByClassName('stat-value')[0] as HTMLInputElement;
			if (input) {
				input.select();
			}
		}, 0);
	}

	function saveEditCell(index: number) {
		// Update the source attributes array
		user_attributes[index].value = edit_value;

		saveAttributes(user_attributes);

		// Update validated attributes
		const __use_percent = index === 2 || index === 10;
		validated_attributes[index].value = __use_percent
			? validateValue(FLOAT_PERCENT_3D, edit_value)
			: validateValue(INTEGER, edit_value);

		editing_index = null;
		edit_value = '';
	}

	function handleKeyDown(e: any, index: number) {
		if (e.key === 'Enter') {
			saveEditCell(index);
		}
	}

	// actions
	function* iterateBoxes(w: number, h: number, off_x: number = 0, off_y: number = 0) {
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

	async function processBoxes(
		src_mat_orig: cv.Mat,
		stat_p1: cv.Point,
		stat_p2: cv.Point,
		src_mat_edit: cv.Mat | null = null,
		imageUpdateCallback: ((img: cv.Mat) => Promise<void>) | null = null
	) {
		const attr_arr: number[] = [7, 15, 6, 14, 5, 13, 4, 12, 3, 11, 2, 10, 1, 9, 0, 8];

		const worker = await createWorker('eng');
		let done_tasks = 0;

		async function doTask(rect: cv.Rect, index: number) {
			const _crop = src_mat_orig.roi(rect);

			const canvas = document.createElement('canvas');

			cv.imshow(canvas, _crop);
			const data_url = canvas.toDataURL();

			const ret = await worker.recognize(data_url);
			user_attributes[attr_arr[index]].value = ret.data.text.replace('%', '').replace('/', '');

			// Clean up resources
			_crop.delete();
			canvas.remove();

			done_tasks++;
			console.log('OCR Text:', ret.data.text);
			console.info('Done tasks:', done_tasks);
		}

		try {
			// Process boxes in sequence rather than spawning parallel promises
			for (const [_i, _rect] of Array.from(
				iterateBoxes(stat_p2.x - stat_p1.x, stat_p2.y - stat_p1.y, stat_p1.x, stat_p1.y)
			).entries()) {
				// Update image visualization if callback provided
				if (src_mat_edit && imageUpdateCallback) {
					const stat_box_p1 = new cv.Point(_rect.x, _rect.y);
					const stat_box_p2 = new cv.Point(_rect.x + _rect.width, _rect.y + _rect.height);
					cv.rectangle(src_mat_edit, stat_box_p1, stat_box_p2, new cv.Scalar(0, 0, 0, 255), 2);
				}

				console.info('Starting task ' + { _i });
				doTask(_rect, _i);
			}

			// Wait for done_tasks to be equal to 16
			while (done_tasks < 16) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			if (src_mat_edit && imageUpdateCallback) {
				await imageUpdateCallback(src_mat_edit);
			}
		} finally {
			src_mat_orig.delete();
			if (src_mat_edit) {
				src_mat_edit.delete();
			}
			await worker.terminate();

			// TODO: add a new prompt here asking if user wants to save stats
			saveAttributes(user_attributes);
			processAttributes();
			process_text = 'Done!';
		}
	}

	async function matchCharacterStats(
		src_mat: cv.Mat,
		imageUpdateCallback: ((img: cv.Mat) => Promise<void>) | null = null,
		minimumMatch: number = 0.9
	) {
		let edit_src_mat: cv.Mat = new cv.Mat(); // for callback

		process_text = 'Cropping...';
		// remove possibly white pixels from top
		const _W = src_mat.cols;
		const _H = src_mat.rows;
		const ylimit = Math.round(0.05 * _H);
		const midX = Math.floor(_W / 2);
		let consecutiveWhitePixels = 0;
		let maxConsecutiveWhitePixels = 0;

		for (let y = 0; y < ylimit; y++) {
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

		if (imageUpdateCallback) {
			// cropped image
			edit_src_mat = src_mat.clone();
			imageUpdateCallback(edit_src_mat);
		}

		process_text = 'Determining template size...';
		// constants
		const W = src_mat.size().width;
		const H = src_mat.size().height;
		console.info('W/H: ', W, H);

		const minmrh = Math.min(W, (16 / 9) * H);
		console.info('minmrh', minmrh);
		const some_factor = W > minmrh ? Math.round(2 * Math.log10(W - minmrh) - 2) / 100 : 0;
		console.info('some_factor: ', some_factor);

		const expected_template_size_x = Math.round(minmrh / 58);
		const expected_template_size_y = Math.round(minmrh / 55);
		console.info('Template Size: ', expected_template_size_x, expected_template_size_y);

		const resized_template = new cv.Mat();

		// assumes that we would get image with less res than template
		cv.resize(
			cv.imread('templateImage').clone(),
			resized_template,
			new cv.Size(expected_template_size_x, expected_template_size_y),
			cv.INTER_AREA
		);

		async function smolMatching() {
			process_text = 'Matching template...';

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
			// points for ROI
			const search_p1 = new cv.Point(roi_start_x, roi_start_y);
			const search_p2 = new cv.Point(
				roi_start_x + expected_template_size_x * 4,
				roi_start_y + expected_template_size_y * 4
			);
			if (imageUpdateCallback) {
				cv.rectangle(edit_src_mat, search_p1, search_p2, new cv.Scalar(0, 0, 255, 255), 2); // search area
			}

			cropped_src = cropped_src.roi(roi);

			// Perform template matching
			const result = new cv.Mat();
			cv.matchTemplate(cropped_src, resized_template, result, cv.TM_CCOEFF_NORMED);

			// Find the best match location
			// @ts-expect-error : should work fine
			const minMax = cv.minMaxLoc(result);
			const maxLoc = minMax.maxLoc;
			const maxVal = minMax.maxVal;

			const best_p1 = new cv.Point(search_p1.x + maxLoc.x, search_p1.y + maxLoc.y);
			const best_p2 = new cv.Point(
				best_p1.x + expected_template_size_x,
				best_p1.y + expected_template_size_y
			);
			if (imageUpdateCallback) {
				cv.rectangle(edit_src_mat, best_p1, best_p2, new cv.Scalar(255, 0, 0, 255), 2); // best match
			}

			const stat_p1 = new cv.Point(best_p1.x, best_p1.y - Math.round(minmrh / 26.5));
			const stat_p2 = new cv.Point(
				stat_p1.x + Math.round(minmrh / 3),
				stat_p1.y + Math.round(H / 2.09)
			);
			if (imageUpdateCallback) {
				cv.rectangle(edit_src_mat, stat_p1, stat_p2, new cv.Scalar(0, 255, 0, 255), 2); // stat area
				imageUpdateCallback(edit_src_mat);
			}

			result.delete();
			resized_template.delete();
			cropped_src.delete();

			if (maxVal > minimumMatch) {
				process_text = 'Reading fields...';
				await processBoxes(src_mat, stat_p1, stat_p2, edit_src_mat, imageUpdateCallback);
			} else {
				process_text = 'No match found!';
			}

			return maxVal;
		}

		const maxVal = await smolMatching();
		if (maxVal > minimumMatch) {
			return {
				image: src_mat,
				score: maxVal
			};
		}
	}

	function onFileUpload(canvas: HTMLCanvasElement) {
		if (uploaded_image_url && canvas) {
			const img = cv.imread(canvas); // cant read unless from canvas or img id

			matchCharacterStats(img, async (img) => {
				const canvas = document.createElement('canvas');
				cv.imshow(canvas, img);
				uploaded_image_url = canvas.toDataURL();
			});
		}
	}

	function resetStats() {
		// user_attributes = loadObject('stats_main', true);
		// saveObject('stats_main', user_attributes);
		// processAttributes();
	}

	// register
	const id = 'stat-page';

	const metadata: ComponentMetadata = {
		id,
		label: 'Stats',
		lucide: ChartNoAxesColumn,
		showInNav: true,
		actions: [
			{
				id: 'screenshot',
				label: 'From Screenshot',
				lucide: ImagePlus,
				type: ActionType.BUTTON,
				callback: () => (screenshot_dialog_open = true)
			},
			{ id: 'reset', label: 'Reset', lucide: Trash2, type: ActionType.BUTTON, callback: resetStats }
			// { id: 'share', label: 'Share' }
		]
	};

	onMount(() => {
		registerComponent(id, metadata);

		// load and process attributes
		if (Object.keys(user_loadouts).length > 0) {
			user_attributes = TEMPLATE_USER_ATTRIBUTES.map((attr, index) => {
				return {
					...attr,
					value: user_loadouts[current_loadout].base_stats[index]
				};
			});
			processAttributes();
		}
	});
</script>

<div style="display: none">
	<img id="templateImage" src={'./template/template_crit.png'} alt="User uploaded screenshot" />
</div>

<div class="stat-panel">
	<h1 class="head">Character Stats</h1>
	<p>This page might undergo overhaul soon, just waiting for gear page to be completed.</p>

	<FlexGrid
		horizontal_gap="0.9rem"
		vertical_gap="1rem"
		min_cols={1}
		max_cols={2}
		prefer_divisible={false}
	>
		{#each validated_attributes as attribute}
			<div class="stat-cell">
				<div class="stat-content">
					<div class="stat-icon">
						<img src={attribute.icon} alt={attribute.name + ' icon'} />
					</div>
					<div class="stat-info">
						<div class="stat-name">{attribute.name}</div>
						<div class="stat-value-container">
							{#if editing_index === attribute.index}
								<input
									type="text"
									class="stat-value"
									bind:value={edit_value}
									onblur={() => saveEditCell(attribute.index)}
									onkeydown={(e) => handleKeyDown(e, attribute.index)}
								/>
							{:else}
								<div
									class="stat-value-text"
									style="font-size: 1.25rem"
									role="textbox"
									tabindex={10 + attribute.index}
									ondblclick={() => startEditCell(attribute.index)}
								>
									{attribute.value}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</FlexGrid>

	<h1 class="Pro">Character Stats</h1>
</div>

<UploadScreenshot
	{onFileUpload}
	bind:open={screenshot_dialog_open}
	bind:image={uploaded_image_url}
	bind:text={process_text}
	upload_type="canvas"
	prompt_on_open={true}
/>

<ActionToolbar actions={metadata.actions} bind:is_mobile />

<style>
	.stat-panel {
		padding: 1rem;
		color: var(--text-color);
		background-color: var(--bg-color);
		width: 100%;
		max-width: 100%;
	}

	.head {
		color: var(--title-color);
	}

	.stat-cell {
		background-color: var(--bg-color);
	}

	.stat-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: none;
		filter: invert(75%);
	}

	.stat-info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.stat-name {
		font-size: 1rem;
		font-weight: bold;
		padding-left: 0.4rem;
		color: var(--text-color);
	}

	.stat-value-container {
		font-size: 1rem;
		width: 40%;
		border-radius: 2rem;
	}

	.stat-value {
		background-color: var(--button-bg);
		border: 1px solid var(--button-border);
		border-radius: 0.1rem;
		color: var(--button-text);
		padding: 2px 6px;
		width: 100%;
		font-size: 1rem;
	}

	.stat-value-text {
		padding: 2px 6px;
		color: var(--text-color);
		cursor: pointer;
	}
</style>
