<script lang="ts">
	import type { ViewMode } from './AppHeader.svelte';
	import { CLIENT_MODES, simulateClient, type ClientMode, type CompatibilityWarning } from '$lib/email-compat';
	import InstallGuide from './InstallGuide.svelte';

	let {
		viewMode,
		signatureHtml,
		typstCode,
		warnings,
		onCopy,
	}: {
		viewMode: ViewMode;
		signatureHtml: string;
		typstCode: string;
		warnings: CompatibilityWarning[];
		onCopy: (action: 'html' | 'typst') => Promise<boolean>;
	} = $props();

	let copied = $state(false);
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;
	let code = $derived(viewMode === 'html' ? signatureHtml : typstCode);
	let codeLabel = $derived(viewMode === 'html' ? 'HTML' : 'Typst');
	let clientMode: ClientMode = $state('browser');
	let previewHtml = $derived(simulateClient(signatureHtml, clientMode));
	let modeHint = $derived(CLIENT_MODES.find((mode) => mode.id === clientMode)?.hint ?? '');

	async function copyCode() {
		if (!(await onCopy(viewMode === 'html' ? 'html' : 'typst'))) return;
		copied = true;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => (copied = false), 1500);
	}
</script>

<div
	class="flex h-[calc(100vh-10rem)] flex-col items-center overflow-hidden rounded-lg bg-gray-500 p-4 shadow lg:h-full"
>
	<h2 class="text-lg font-semibold mb-4 text-white">
		{viewMode === 'preview' ? 'Signature Preview' : `${codeLabel} Code`}
	</h2>

	{#if viewMode === 'preview'}
		<div class="mb-3 flex flex-wrap justify-center rounded-md bg-gray-600 p-0.5" role="group" aria-label="Simulate email client">
			{#each CLIENT_MODES as mode (mode.id)}
				<button
					type="button"
					class="segment text-xs {clientMode === mode.id
						? 'bg-white text-gray-900 shadow-sm'
						: 'text-gray-100 hover:bg-gray-500'}"
					aria-pressed={clientMode === mode.id}
					title={mode.hint}
					onclick={() => (clientMode = mode.id)}>{mode.label}</button
				>
			{/each}
		</div>
		<div class="flex min-h-0 w-full flex-1 flex-col items-center overflow-auto">
			<div class="my-auto flex w-full flex-col items-center py-2">
				<div
					class="max-w-full overflow-auto rounded-lg p-6 shadow-lg {clientMode === 'dark' ? 'bg-[#1f1f1f]' : 'bg-white'}"
				>
					<div class="signature-preview" class:dark-sim={clientMode === 'dark'}>
						{@html previewHtml}
					</div>
				</div>
				<p class="mt-3 text-center text-xs text-gray-200" aria-live="polite">
					{clientMode === 'browser' ? 'Live preview. Email clients may render small differences.' : `Approximation: ${modeHint}.`}
				</p>
				{#if warnings.length > 0}
					<section
						class="mt-3 w-full max-w-xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
						aria-labelledby="compat-warnings"
					>
						<h3 id="compat-warnings" class="mb-1 flex items-center gap-1.5 font-semibold">
							<span class="icon-[lucide--triangle-alert] size-4 shrink-0" aria-hidden="true"></span>
							Email client compatibility
						</h3>
						<ul class="list-disc space-y-1 pl-5">
							{#each warnings as warning (warning.id)}
								<li>{warning.message}</li>
							{/each}
						</ul>
					</section>
				{/if}
				<div class="mt-3 w-full max-w-xl">
					<InstallGuide />
				</div>
			</div>
		</div>
	{:else}
		<div class="relative min-h-0 w-full flex-1">
			<button type="button" class="absolute top-2 right-2 secondary text-xs" onclick={copyCode}
				>{copied ? 'Copied' : 'Copy'}</button
			>
			<pre
				class="h-full w-full overflow-auto rounded-lg bg-gray-900 p-4 pr-20 text-xs leading-relaxed whitespace-pre-wrap break-all text-gray-100"><code
					>{code}</code
				></pre>
		</div>
		{#if viewMode === 'typst'}
			<p class="mt-3 text-center text-xs text-gray-200">Compile with Typst to render a high-resolution image.</p>
		{/if}
	{/if}
</div>

<style>
	.signature-preview :global(a) {
		text-decoration: none;
	}
	.signature-preview :global(img) {
		max-width: none;
	}

	/* Many clients invert light signatures in dark mode; images are inverted back so photos keep their colors. */
	.dark-sim {
		filter: invert(1) hue-rotate(180deg);
	}

	.dark-sim :global(img) {
		filter: invert(1) hue-rotate(180deg);
	}

	/* The global button rule in app.css is unlayered, so sizes are set here rather than with utilities. */
	.segment {
		padding: 0.25rem 0.625rem;
	}
</style>
