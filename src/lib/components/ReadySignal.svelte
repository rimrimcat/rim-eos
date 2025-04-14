<script lang="ts">
	import { onMount } from 'svelte';

	let { signal = $bindable(false) } = $props();

	onMount(() => {
		signal = true;
	});
</script>
