<!-- Dialog.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';

	let {
		blocking = false,
		blur = false,
		closable = true,
		buttons = [],
		title = 'Dialog',
		open = $bindable(false),
		onClose = () => {},
		onConfirm = () => {},
		onCancel = () => {},
		onClickOutside = () => {},
		children
	} = $props();

	function closeDialog() {
		if (closable) {
			open = false;
			onClose();
		}
	}

	function clickButton(buttonType) {
		const btnType = buttonType.toLowerCase();

		switch (btnType) {
			case 'confirm':
				onConfirm();
				break;
			case 'cancel':
				onCancel();
				break;
		}

		closeDialog();
	}

	function keydown(event) {
		if (event.key === 'Escape' && closable) {
			closeDialog();
			onClose();
		}
	}

	function clickOutside(event) {
		onClickOutside();
		if (event.target === event.currentTarget && closable && !blocking) {
			closeDialog();
			onCancel();
			onClose();
		}
	}

	// // Set up and tear down event listeners
	onMount(() => {
		document.addEventListener('keydown', keydown);

		onDestroy(() => {
			document.removeEventListener('keydown', keydown);
		});
	});

	$effect(() => {
		if (open) {
			document.addEventListener('keydown', keydown);
		} else {
			document.removeEventListener('keydown', keydown);
		}
	});
</script>

{#if open}
	<div
		class="dialog-overlay"
		class:blocking
		class:blur
		onclick={clickOutside}
		onkeydown={clickOutside}
		role="presentation"
		tabindex="-1"
	>
		<div class="dialog-container" role="dialog" aria-modal="true">
			<div class="dialog-header">
				<h2>{title}</h2>
				{#if closable}
					<button class="close-button" aria-label="Close dialog" onclick={closeDialog}> ✕ </button>
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
							class:primary={button.toLowerCase() === 'ok'}
							onclick={() => clickButton(button)}
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
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		background-color: rgba(0, 0, 0, 0.3);
	}

	.blur {
		backdrop-filter: blur(0.3rem);
	}

	.blocking {
		pointer-events: all;
	}

	.dialog-container {
		background: white;
		border-radius: 0.7rem;
		box-shadow: 0 0.1rem 0.9rem rgba(0, 0, 0, 0.2);
		width: 100%;
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
		border-bottom: 0.1rem solid #eee;
	}

	.dialog-header h2 {
		margin: 0;
		font-size: 1.25rem;
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
	}

	.close-button:hover {
		background-color: #f5f5f5;
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
		border-top: 0.1rem solid #eee;
	}

	.dialog-button {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: 0.1rem solid #ddd;
		background-color: #f5f5f5;
		cursor: pointer;
	}

	.dialog-button:hover {
		background-color: #eee;
	}

	.dialog-button.primary {
		background-color: #4f46e5;
		color: white;
		border: 0.1rem solid #4338ca;
	}

	.dialog-button.primary:hover {
		background-color: #4338ca;
	}
</style>
