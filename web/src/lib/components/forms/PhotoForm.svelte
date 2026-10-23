<script lang="ts">
	import type { SignatureData } from '$lib/types';
	import { IMAGE_SIZE_LIMITS } from '$lib/signature-schema';
	import { MAX_UPLOAD_BYTES, resizeProfileImage } from '$lib/profile-image';

	let { data = $bindable() }: { data: SignatureData } = $props();
	const uid = $props.id();
	let uploadError = $state('');
	let processing = $state(false);

	// Uploads are cropped and downscaled so the saved data URL stays small enough for localStorage.
	async function handleImageUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		uploadError = '';
		if (!file.type.startsWith('image/') || file.size > MAX_UPLOAD_BYTES) {
			uploadError = 'Choose an image file under 20 MB.';
			return;
		}
		processing = true;
		try {
			data.profileImage = await resizeProfileImage(file);
		} catch {
			uploadError = 'This image could not be read. Try a JPEG or PNG file.';
		} finally {
			processing = false;
		}
	}

	let radius = $derived(
		data.layout.imageShape === 'circle' ? '50%' : data.layout.imageShape === 'rounded' ? '8px' : '0',
	);
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Profile Photo</h2>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-image`}>
		<h3 id={`${uid}-image`} class="editor-subheading">Image</h3>
		<div class="flex flex-wrap items-center gap-4">
			{#if data.profileImage}
				<img
					src={data.profileImage}
					alt="Uploaded profile"
					class="shrink-0 border border-gray-200 bg-white object-cover"
					style="width: {data.layout.imageSize}px; height: {data.layout.imageSize}px; border-radius: {radius};"
				/>
			{/if}
			<div class="min-w-0 flex-1">
				<label for={`${uid}-upload`}>Upload photo</label>
				<input
					id={`${uid}-upload`}
					type="file"
					accept="image/*"
					onchange={handleImageUpload}
					disabled={processing}
					aria-describedby={`${uid}-upload-hint`}
					class="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
				/>
				<p id={`${uid}-upload-hint`} class="mt-1 text-xs text-gray-500">
					Cropped to a square and resized to {IMAGE_SIZE_LIMITS.max * 2}px. Stored in this browser's localStorage only.
				</p>
				{#if uploadError}<p role="alert" class="mt-1 text-xs text-red-700">{uploadError}</p>{/if}
			</div>
			{#if data.profileImage}
				<button type="button" class="editor-action-danger" onclick={() => (data.profileImage = '')}
					>Remove photo</button
				>
			{/if}
		</div>
		<div>
			<label for={`${uid}-image-url`}>Hosted image URL <span class="font-normal text-gray-400">(recommended)</span></label>
			<input
				id={`${uid}-image-url`}
				type="url"
				bind:value={data.profileImageUrl}
				placeholder="https://example.com/photo.jpg"
				aria-describedby={`${uid}-image-url-hint`}
			/>
			<p id={`${uid}-image-url-hint`} class="mt-1 text-xs text-gray-500">
				When set, the email HTML uses this URL instead of the embedded image. Many email clients block embedded images.
			</p>
			{#if data.profileImage && !data.profileImageUrl.trim()}
				<p class="mt-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
					The copied signature embeds the uploaded photo as a data URL. Gmail and Outlook usually block these, so
					recipients may not see the photo. Host the image and paste its URL above.
				</p>
			{/if}
		</div>
	</section>
	<section class="editor-card" aria-labelledby={`${uid}-shape`}>
		<h3 id={`${uid}-shape`} class="editor-subheading">Size and shape</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-size`}>Size: {data.layout.imageSize}px</label>
				<input
					id={`${uid}-size`}
					type="range"
					bind:value={data.layout.imageSize}
					min={IMAGE_SIZE_LIMITS.min}
					max={IMAGE_SIZE_LIMITS.max}
					step="5"
					class="w-full accent-blue-600"
				/>
			</div>
			<div>
				<label for={`${uid}-shape-select`}>Shape</label>
				<select id={`${uid}-shape-select`} bind:value={data.layout.imageShape}>
					<option value="circle">Circle</option>
					<option value="rounded">Rounded</option>
					<option value="square">Square</option>
				</select>
			</div>
		</div>
	</section>
</div>
