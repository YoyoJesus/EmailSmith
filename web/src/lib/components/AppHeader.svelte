<script lang="ts" module>
	export type ViewMode = 'preview' | 'html' | 'typst';
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { nextMenuIndex } from '$lib/menu-navigation';
	import { footerStore } from '$lib/footer-store';
	import type { CopyAction, CopyOutcome } from '$lib/clipboard';
	import type { DownloadKind } from '$lib/download';

	let {
		viewMode = $bindable(),
		copyStatus,
		copied,
		onCopySignature,
		onCopyHtml,
		onCopyTypst,
		onDownload,
		onClearData,
	}: {
		viewMode: ViewMode;
		copyStatus: string;
		copied: { action: CopyAction; outcome: CopyOutcome } | null;
		onCopySignature: () => void;
		onCopyHtml: () => void;
		onCopyTypst: () => void;
		onDownload: (kind: DownloadKind) => void;
		onClearData: () => void;
	} = $props();

	const viewModes: { id: ViewMode; label: string }[] = [
		{ id: 'preview', label: 'Preview' },
		{ id: 'html', label: 'HTML' },
		{ id: 'typst', label: 'Typst' },
	];

	const SIGNATURE_LABELS: Record<CopyOutcome, string> = {
		copied: 'Copied',
		fallback: 'Copied as HTML',
		failed: 'Copy failed',
	};
	let signatureLabel = $derived(
		copied?.action === 'signature' ? SIGNATURE_LABELS[copied.outcome] : 'Copy signature',
	);

	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement>();
	let menuPanel = $state<HTMLDivElement>();

	function menuItems() {
		return Array.from(menuPanel?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
	}

	async function openMenu(focus: 'first' | 'last' = 'first') {
		menuOpen = true;
		await tick();
		const items = menuItems();
		items[focus === 'first' ? 0 : items.length - 1]?.focus();
	}

	function closeMenu(restoreFocus = true) {
		if (!menuOpen) return;
		menuOpen = false;
		if (restoreFocus) menuButton?.focus();
	}

	// Focus returns to the trigger before the action runs, so a dialog it opens restores focus there.
	function choose(action: () => void) {
		closeMenu();
		action();
	}

	function toggleFooter() {
		footerStore.toggle();
		footerStore.saveToStorage();
	}

	function onMenuButtonKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		void openMenu(event.key === 'ArrowDown' ? 'first' : 'last');
	}

	function onMenuKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeMenu();
			return;
		}
		if (event.key === 'Tab') {
			closeMenu();
			return;
		}
		const items = menuItems();
		const next = nextMenuIndex(event.key, items.indexOf(document.activeElement as HTMLElement), items.length);
		if (next === null) return;
		event.preventDefault();
		items[next].focus();
	}

	function isInsideMenu(target: EventTarget | null) {
		return target instanceof Node && (menuPanel?.contains(target) || menuButton?.contains(target));
	}

	$effect(() => {
		if (!menuOpen) return;
		const dismiss = (event: PointerEvent) => {
			if (!isInsideMenu(event.target)) closeMenu(false);
		};
		document.addEventListener('pointerdown', dismiss);
		return () => document.removeEventListener('pointerdown', dismiss);
	});
</script>

{#snippet menuItem(label: string, hint: string, action: () => void)}
	<button
		type="button"
		role="menuitem"
		tabindex="-1"
		class="menu-item block w-full text-left hover:bg-gray-100 focus:bg-blue-50 focus:outline-none"
		onclick={() => choose(action)}
	>
		<span class="block text-sm font-medium text-gray-900">{label}</span>
		<span class="block text-xs text-gray-500">{hint}</span>
	</button>
{/snippet}

<header class="relative z-30 bg-white shadow-sm">
	<div class="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
		<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
			<h1 class="text-xl lg:text-2xl font-bold text-gray-900">EmailSmith</h1>
			<div class="relative ml-auto flex items-center gap-2 max-sm:w-full max-sm:flex-wrap">
				<div class="flex rounded-md bg-gray-200 p-0.5" role="group" aria-label="Right panel view">
					{#each viewModes as mode (mode.id)}
						<button
							type="button"
							class="segment text-sm {viewMode === mode.id
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-600 hover:text-gray-900'}"
							aria-pressed={viewMode === mode.id}
							onclick={() => (viewMode = mode.id)}>{mode.label}</button
						>
					{/each}
				</div>
				<button
					bind:this={menuButton}
					type="button"
					class="secondary compact text-sm inline-flex items-center gap-1 max-sm:ml-auto"
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					aria-controls="header-more-menu"
					onclick={() => (menuOpen ? closeMenu() : void openMenu())}
					onkeydown={onMenuButtonKeydown}
				>
					More
					<span class="disclosure-chevron icon-[lucide--chevron-down] h-4 w-4" aria-hidden="true"></span>
				</button>
				<button type="button" class="primary compact text-sm" onclick={onCopySignature}>{signatureLabel}</button
				>
				{#if menuOpen}
					<div
						bind:this={menuPanel}
						id="header-more-menu"
						class="absolute right-0 top-full z-40 mt-2 max-h-[70vh] w-72 max-w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg sm:max-w-none"
						role="menu"
						aria-label="More actions"
						tabindex="-1"
						onkeydown={onMenuKeydown}
						onfocusout={(event) => {
							if (event.relatedTarget && !isInsideMenu(event.relatedTarget)) closeMenu(false);
						}}
					>
						<div role="group" aria-labelledby="header-menu-formats">
							<p id="header-menu-formats" class="menu-heading">Other formats</p>
							{@render menuItem('Copy HTML', 'Raw HTML source for clients that accept it', onCopyHtml)}
							{@render menuItem('Copy Typst', 'Typst source for rendering an image or PDF', onCopyTypst)}
						</div>
						<div class="my-1 border-t border-gray-200" role="separator"></div>
						<div role="group" aria-labelledby="header-menu-downloads">
							<p id="header-menu-downloads" class="menu-heading">Download</p>
							{@render menuItem('HTML file', 'For clients that attach a signature file, such as Thunderbird', () =>
								onDownload('html'),
							)}
							{@render menuItem('Typst file', 'Compile locally to a PDF or image', () => onDownload('typst'))}
							{@render menuItem('PNG image', 'For tools that do not accept HTML', () => onDownload('png'))}
						</div>
						<div class="my-1 border-t border-gray-200" role="separator"></div>
						<div role="group" aria-labelledby="header-menu-view">
							<p id="header-menu-view" class="menu-heading">View</p>
							{@render menuItem(
								$footerStore ? 'Show footer' : 'Hide footer',
								'Credits and project links',
								toggleFooter,
							)}
						</div>
						<div class="my-1 border-t border-gray-200" role="separator"></div>
						<div role="group" aria-labelledby="header-menu-data">
							<p id="header-menu-data" class="menu-heading">Your data</p>
							<button
								type="button"
								role="menuitem"
								tabindex="-1"
								class="menu-item block w-full text-left text-red-700 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
								onclick={() => choose(onClearData)}
							>
								<span class="block text-sm font-medium">Delete saved data</span>
								<span class="block text-xs text-red-600">Remove saved data from this browser</span>
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
		<p
			class="{copyStatus
				? ''
				: 'sr-only'} absolute right-4 top-full z-20 mt-2 max-w-sm rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg sm:right-6 lg:right-8"
			role="status"
			aria-live="polite"
		>
			{copyStatus}
		</p>
	</div>
</header>

<style>
	.disclosure-chevron {
		transform: rotate(0deg);
	}

	button[aria-expanded='true'] .disclosure-chevron {
		transform: rotate(180deg);
	}

	/* The global button rule in app.css is unlayered, so these sizes are set here rather than with utilities. */
	.segment {
		padding: 0.375rem 0.75rem;
	}

	.compact {
		padding: 0.5rem 0.75rem;
		white-space: nowrap;
	}

	@media (width < 40rem) {
		.segment,
		.compact {
			padding-inline: 0.5rem;
		}
	}

	.menu-item {
		padding: 0.5rem 0.75rem;
		font-weight: 400;
	}

	.menu-heading {
		padding: 0.375rem 0.75rem 0.125rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		color: var(--color-gray-500);
	}

	@media (prefers-reduced-motion: no-preference) {
		button {
			transition:
				background-color 140ms ease-out,
				color 140ms ease-out,
				box-shadow 140ms ease-out,
				opacity 140ms ease-out,
				transform 100ms ease-out;
		}

		button:active:not(:disabled) {
			transform: translateY(1px);
		}

		.disclosure-chevron {
			transition: transform 160ms ease-out;
		}

		#header-more-menu {
			animation: menu-reveal 160ms ease-out;
		}
	}

	@keyframes menu-reveal {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
