<script lang="ts">
	import GearTable from '$lib/components/GearTable.svelte';
	import FloatingWindow from '$lib/components/FloatingWindow.svelte';
	import StatPanel from '$lib/components/StatPanel.svelte';
	import App from '$lib/components/App.svelte';
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->

<App />

<!-- <FloatingWindow
	title="Main Gear"
	initialX={150}
	initialY={100}
	initialWidth={780}
	initialHeight={810}
	initialMinimizedX={50}
	initialMinimizedY={50}
	startMinimized={false}
>
	<GearTable fixed_row={true} />
</FloatingWindow> -->

<!-- <FloatingWindow
	title="Character Stats"
	initialX={150}
	initialY={150}
	initialWidth={700}
	initialHeight={525}
	initialMinimizedX={50}
	initialMinimizedY={100}
	startMinimized={true}
>
	<StatPanel />
</FloatingWindow> -->
