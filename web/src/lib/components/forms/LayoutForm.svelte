<script lang="ts">
	import { defaultSignatureData, type SignatureData } from '$lib/types';

	let { data }: { data: SignatureData } = $props();
	const uid = $props.id();

	const layouts = [
		{ id: 'horizontal', label: 'Horizontal' },
		{ id: 'stacked', label: 'Stacked' },
	] as const;

	function resetLayout() {
		data.layout = {
			...defaultSignatureData.layout,
			imageSize: data.layout.imageSize,
			imageShape: data.layout.imageShape,
		};
	}
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Layout Settings</h2>
		<button type="button" class="editor-action" onclick={resetLayout}>Reset to Default</button>
	</div>
	<fieldset class="editor-card">
		<legend class="sr-only">Arrangement</legend>
		<p class="editor-subheading" aria-hidden="true">Arrangement</p>
		<div class="editor-grid">
			{#each layouts as option (option.id)}
				<button
					type="button"
					class="layout-option flex flex-col items-center gap-2 border bg-white text-sm {data.layout.layout ===
					option.id
						? 'border-blue-500 text-blue-700 ring-1 ring-blue-500'
						: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
					aria-pressed={data.layout.layout === option.id}
					onclick={() => (data.layout.layout = option.id)}
				>
					{#if option.id === 'horizontal'}
						<span class="flex items-center gap-2" aria-hidden="true">
							<span class="h-6 w-6 shrink-0 rounded-full bg-gray-300"></span>
							<span class="flex flex-col gap-1">
								<span class="h-1 w-12 rounded bg-gray-300"></span>
								<span class="h-1 w-8 rounded bg-gray-200"></span>
							</span>
						</span>
					{:else}
						<span class="flex flex-col items-center gap-1" aria-hidden="true">
							<span class="h-6 w-6 rounded-full bg-gray-300"></span>
							<span class="h-1 w-12 rounded bg-gray-300"></span>
							<span class="h-1 w-8 rounded bg-gray-200"></span>
						</span>
					{/if}
					{option.label}
				</button>
			{/each}
		</div>
	</fieldset>
	<section class="editor-card" aria-labelledby={`${uid}-details`}>
		<h3 id={`${uid}-details`} class="editor-subheading">Details</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-divider`}>Divider style</label>
				<select id={`${uid}-divider`} bind:value={data.layout.dividerStyle}>
					<option value="solid">Solid</option>
					<option value="dashed">Dashed</option>
					<option value="dotted">Dotted</option>
					<option value="none">None</option>
				</select>
			</div>
			<div class="editor-span">
				<label class="flex cursor-pointer items-center gap-2 font-normal">
					<input type="checkbox" bind:checked={data.layout.showSignoff} class="h-4 w-4 rounded accent-blue-600" />
					Show sign-off text
				</label>
				{#if data.layout.showSignoff}
					<label for={`${uid}-signoff`} class="sr-only">Sign-off text</label>
					<input
						id={`${uid}-signoff`}
						type="text"
						bind:value={data.layout.signoffText}
						placeholder="Best regards,"
						class="mt-1"
					/>
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	/* The global button rule in app.css is unlayered, so sizes are set here rather than with utilities. */
	.layout-option {
		padding: 0.75rem;
		border-radius: 0.5rem;
	}

	.layout-option:focus-visible {
		outline: 2px solid var(--color-blue-500);
		outline-offset: 1px;
	}
</style>
