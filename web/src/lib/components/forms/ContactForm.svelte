<script lang="ts">
	import type { SignatureData } from '$lib/types';

	let { data }: { data: SignatureData } = $props();
	const uid = $props.id();
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Contact Details</h2>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-contact`}>
		<h3 id={`${uid}-contact`} class="editor-subheading">Contact</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-email`}>Email</label>
				<input id={`${uid}-email`} type="email" bind:value={data.email} placeholder="jane@example.com" />
			</div>
			<div>
				<label for={`${uid}-phone`}>Phone</label>
				<input id={`${uid}-phone`} type="tel" bind:value={data.phone} placeholder="(555) 555-0100" />
			</div>
			<div class="editor-span">
				<label for={`${uid}-website`}>Website</label>
				<input id={`${uid}-website`} type="url" bind:value={data.website} placeholder="example.com" />
			</div>
		</div>
	</section>
</div>
