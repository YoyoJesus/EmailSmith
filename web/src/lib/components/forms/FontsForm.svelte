<script lang="ts">
	import { defaultSignatureData, fontFamilies, type FontSettings, type SignatureData } from '$lib/types';

	let { data = $bindable() }: { data: SignatureData } = $props();
	const uid = $props.id();

	const SIZES: { key: Exclude<keyof FontSettings, 'fontFamily'>; label: string; min: number; max: number }[] = [
		{ key: 'nameSize', label: 'Name', min: 12, max: 30 },
		{ key: 'subtitleSize', label: 'Subtitle', min: 10, max: 24 },
		{ key: 'titleSize', label: 'Title', min: 9, max: 20 },
		{ key: 'textSize', label: 'Text', min: 8, max: 18 },
	];

	function resetFonts() {
		data.fonts = { ...defaultSignatureData.fonts };
	}
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Font Settings</h2>
		<button type="button" class="editor-action" onclick={resetFonts}>Reset to Default</button>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-family`}>
		<h3 id={`${uid}-family`} class="editor-subheading">Family</h3>
		<div>
			<label for={`${uid}-font`}>Font family</label>
			<select id={`${uid}-font`} bind:value={data.fonts.fontFamily}>
				{#each fontFamilies as ff}
					<option value={ff.value}>{ff.label}</option>
				{/each}
			</select>
			<p class="mt-1 text-xs text-gray-500">Web-safe fonts render the same in most email clients.</p>
		</div>
	</section>
	<section class="editor-card" aria-labelledby={`${uid}-sizes`}>
		<h3 id={`${uid}-sizes`} class="editor-subheading">Sizes</h3>
		<div class="editor-grid">
			{#each SIZES as size (size.key)}
				<div>
					<label for={`${uid}-${size.key}`}>{size.label}: {data.fonts[size.key]}px</label>
					<input
						id={`${uid}-${size.key}`}
						type="range"
						bind:value={data.fonts[size.key]}
						min={size.min}
						max={size.max}
						step="1"
						class="w-full accent-blue-600"
					/>
				</div>
			{/each}
		</div>
	</section>
</div>
