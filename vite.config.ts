import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
	plugins: [
		sveltekit(),
		topLevelAwait({
			promiseExportName: '__tla',
			promiseImportName: (i) => `__tla${i}`
		}),
		visualizer({
			open: true,
			filename: 'stats.html',
			gzipSize: true,
			brotliSize: true
		})
	],
	ssr: {
		noExternal: ['@carbon/charts']
	}
});
