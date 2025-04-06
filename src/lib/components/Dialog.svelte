<script lang="ts">
	function doClose() {
		open = false;
	}

	function doClickOutside(event: MouseEvent) {
		if (event.target === event.currentTarget && closable && !blocking) {
			doClose();
		}
	}

	function doKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && closable) {
			doClose();
		}
	}

	function doPaste(event: ClipboardEvent) {
		console.error("You can't paste here!");
	}

	function doButtonPress(buttonType: string) {
		doClose();
	}

	let {
		blocking = false,
		blur = false,
		closable = true,
		buttons = [],
		title = 'Dialog',
		open = $bindable(false),
		primary = 'OK',
		width = $bindable('50vw'),
		onButtonPress = doButtonPress,
		onClickOutside = doClickOutside,
		onkeydown = doKeydown,
		onpaste = doPaste,
		children
	} = $props();
</script>

{#if open}
	<div
		class="dialog-overlay"
		class:blocking
		class:blur
		onclick={onClickOutside}
		{onkeydown}
		{onpaste}
		role="presentation"
		tabindex="-1"
	>
		<div class="dialog-container" role="dialog" aria-modal="true" style="width: {width};">
			<div class="dialog-header">
				<h2>{title}</h2>
				{#if closable}
					<button class="close-button" aria-label="Close dialog" onclick={doClose}> ✕ </button>
				{/if}
			</div>

			<div class="dialog-content">
				{@render children()}
			</div>

			{#if buttons.length > 0}
				<div class="dialog-buttons">
					{#each buttons as button}
						<button
							class="dialog-button"
							class:primary={button.toLowerCase() === primary.toLowerCase()}
							onclick={() => onButtonPress(button)}
						>
							{button}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		display: flex;
		width: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		background-color: var(--overlay-bg);
	}

	.blur {
		backdrop-filter: blur(0.3rem);
	}

	.blocking {
		pointer-events: all;
	}

	.dialog-container {
		background: var(--bg-color);
		color: var(--text-color);
		border-radius: 0.7rem;
		box-shadow: 0 0.2rem 1rem var(--shadow-color);
		min-width: 30vw;
		min-height: 30vh;
		max-width: 70vw;
		max-height: 90vh;

		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.2rem;
		border-bottom: 0.1rem solid var(--border-color);
	}

	.dialog-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--title-color);
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color);
	}

	.close-button:hover {
		background-color: var(--hover-bg);
	}

	.dialog-content {
		padding: 1.25rem;
		overflow-y: auto;
		flex: 1;
	}

	.dialog-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-top: 0.1rem solid var(--border-color);
	}

	.dialog-button {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: 0.1rem solid var(--button-border);
		background-color: var(--button-bg);
		color: var(--button-text);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dialog-button:hover {
		background-color: var(--button-hover-bg);
	}

	.dialog-button.primary {
		background-color: var(--button-primary-bg);
		color: var(--button-primary-text);
		border: 0.1rem solid var(--button-primary-border);
	}

	.dialog-button.primary:hover {
		background-color: var(--button-primary-hover-bg);
	}
</style>
