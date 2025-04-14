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
		...(process.env.NODE_ENV === 'production'
			? [
					visualizer({
						open: true,
						filename: 'stats.html',
						gzipSize: true,
						brotliSize: true
					})
				]
			: [])
	],
	ssr: {
		noExternal: ['@carbon/charts']
	}
});
