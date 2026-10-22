<script lang="ts">
	import type { ViewMode } from './AppHeader.svelte';

	let {
		viewMode,
		signatureHtml,
		typstCode,
		onCopy,
	}: {
		viewMode: ViewMode;
		signatureHtml: string;
		typstCode: string;
		onCopy: (text: string, label: string) => Promise<boolean>;
	} = $props();

	let copied = $state(false);
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;
	let code = $derived(viewMode === 'html' ? signatureHtml : typstCode);
	let codeLabel = $derived(viewMode === 'html' ? 'HTML' : 'Typst');

	async function copyCode() {
		if (!(await onCopy(code, codeLabel))) return;
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
		<div class="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-auto">
			<div class="max-w-full overflow-auto rounded-lg bg-white p-6 shadow-lg">
				<div class="signature-preview">
					{@html signatureHtml}
				</div>
			</div>
			<p class="mt-3 text-center text-xs text-gray-200">Live preview. Email clients may render small differences.</p>
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
</style>
