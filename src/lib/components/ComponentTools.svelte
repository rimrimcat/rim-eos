<!-- ComponentTools.svelte -->
<script>
	export let tools = [];
</script>

<div class="component-tools">
	<div class="tools-header">
		<span>Tools</span>
	</div>
	<div class="tools-list">
		{#each tools as tool}
			<button class="tool-item">
				<div class="tool-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						{#if tool.icon === 'refresh-cw'}
							<!-- Refresh icon -->
							<polyline points="23 4 23 10 17 10"></polyline>
							<polyline points="1 20 1 14 7 14"></polyline>
							<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
						{:else if tool.icon === 'filter'}
							<!-- Filter icon -->
							<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
						{:else if tool.icon === 'download'}
							<!-- Download icon -->
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="7 10 12 15 17 10"></polyline>
							<line x1="12" y1="15" x2="12" y2="3"></line>
						{:else if tool.icon === 'share'}
							<!-- Share icon -->
							<circle cx="18" cy="5" r="3"></circle>
							<circle cx="6" cy="12" r="3"></circle>
							<circle cx="18" cy="19" r="3"></circle>
							<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
							<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
						{:else if tool.icon === 'save'}
							<!-- Save icon -->
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
							<polyline points="17 21 17 13 7 13 7 21"></polyline>
							<polyline points="7 3 7 8 15 8"></polyline>
						{:else if tool.icon === 'rotate-ccw'}
							<!-- Reset icon -->
							<polyline points="1 4 1 10 7 10"></polyline>
							<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
						{/if}
					</svg>
				</div>
				<span class="tool-label">{tool.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.component-tools {
		width: 250px;
		background-color: #f5f5f5;
		border-left: 1px solid #e0e0e0;
		display: flex;
		flex-direction: column;
	}

	.tools-header {
		padding: 16px;
		font-weight: bold;
		border-bottom: 1px solid #e0e0e0;
	}

	.tools-list {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tool-item {
		display: flex;
		align-items: center;
		padding: 10px 12px;
		background: #ffffff;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.tool-item:hover {
		background-color: #f0f0f0;
	}

	.tool-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 10px;
		color: #555555;
	}

	.tool-label {
		flex: 1;
		color: #333333;
	}
</style>
