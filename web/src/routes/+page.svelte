<script lang="ts">
	import { onMount } from 'svelte';
	import { signatureStore } from '$lib/store';
	import { generateSignatureHtml } from '$lib/html-generator';
	import { generateTypstCode } from '$lib/typst-generator';
	import { getSocialIcon, getSocialColor } from '$lib/social-icons';
	import {
		defaultSignatureData,
		fontFamilies,
		socialPlatforms,
		type SignatureData,
		type SocialPlatform,
	} from '$lib/types';

	let data: SignatureData = $state(structuredClone(defaultSignatureData));
	let activeTab: string = $state('info');
	let viewMode: string = $state('preview');
	let copied = $state(false);
	let loaded = $state(false);

	let signatureHtml = $derived(generateSignatureHtml(data));
	let typstCode = $derived(generateTypstCode(data));

	// Persist state — only after initial load to avoid overwriting saved data
	$effect(() => {
		if (loaded) {
			signatureStore.set(data);
			signatureStore.saveToStorage(data);
		}
	});

	onMount(() => {
		data = signatureStore.loadFromStorage();
		loaded = true;
	});

	// Image upload handler
	function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			data.profileImage = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	// Title management
	function addTitle() {
		data.titles = [...data.titles, { title: '', organization: '', url: '' }];
	}
	function removeTitle(index: number) {
		data.titles = data.titles.filter((_, i) => i !== index);
	}

	// Social link management
	function addSocialLink() {
		data.socialLinks = [...data.socialLinks, { platform: 'linkedin' as SocialPlatform, url: '' }];
	}
	function removeSocialLink(index: number) {
		data.socialLinks = data.socialLinks.filter((_, i) => i !== index);
	}

	// Copy HTML to clipboard
	async function copyHtml() {
		try {
			await navigator.clipboard.writeText(signatureHtml);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Fallback
			const textarea = document.createElement('textarea');
			textarea.value = signatureHtml;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	// Copy rich HTML to clipboard (for pasting into email clients)
	async function copyRichSignature() {
		try {
			const blob = new Blob([signatureHtml], { type: 'text/html' });
			await navigator.clipboard.write([
				new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([signatureHtml], { type: 'text/plain' }) }),
			]);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			copyHtml();
		}
	}

	// Copy Typst code to clipboard
	async function copyTypst() {
		try {
			await navigator.clipboard.writeText(typstCode);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = typstCode;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	// Reset all data
	function resetData() {
		if (confirm('Reset all fields to defaults?')) {
			data = structuredClone(defaultSignatureData);
		}
	}

	const tabs = [
		{ id: 'info', label: 'Info' },
		{ id: 'photo', label: 'Photo' },
		{ id: 'contact', label: 'Contact' },
		{ id: 'social', label: 'Social' },
		{ id: 'style', label: 'Style' },
	];
</script>

<div class="min-h-screen bg-slate-100 flex flex-col">
	<!-- Header -->
	<header class="bg-white border-b border-slate-200 px-6 py-3">
		<div class="max-w-[1600px] mx-auto flex items-center justify-between">
			<h1 class="text-lg font-bold text-slate-800">EmailSmith</h1>
			<div class="flex items-center gap-3">
				<button
					onclick={resetData}
					class="text-sm text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
				>
					Reset
				</button>
			</div>
		</div>
	</header>

	<!-- Main content -->
	<div class="flex-1 max-w-[1600px] mx-auto p-4 lg:p-6 w-full">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Left: Form Panel -->
			<div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
				<!-- Tab bar -->
				<div class="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
					{#each tabs as tab}
						<button
							onclick={() => (activeTab = tab.id)}
							class="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer {activeTab === tab.id
								? 'text-blue-600 border-b-2 border-blue-600 bg-white'
								: 'text-slate-500 hover:text-slate-700'}"
						>
							{tab.label}
						</button>
					{/each}
				</div>

				<!-- Tab content -->
				<div class="p-5 overflow-auto max-h-[calc(100vh-14rem)]">
					<!-- INFO TAB -->
					{#if activeTab === 'info'}
						<div class="space-y-4">
							<div>
								<label for="name">Full Name</label>
								<input type="text" id="name" bind:value={data.name} placeholder="Jane Doe" />
							</div>

							<div>
								<label for="pronouns">Pronouns <span class="text-slate-400">(optional)</span></label>
								<input type="text" id="pronouns" bind:value={data.pronouns} placeholder="he/him" />
							</div>

							<fieldset>
								<legend class="!mb-1">Education / Company <span class="text-slate-400">(optional)</span></legend>
								<div class="flex gap-2">
									<div class="flex-1">
										<label for="subtitleText" class="sr-only">Education or role</label>
										<input id="subtitleText" type="text" bind:value={data.subtitleText} placeholder="Computer Science Student" />
									</div>
									<div class="flex-1">
										<label for="subtitleOrganization" class="sr-only">Company or organization</label>
										<input id="subtitleOrganization" type="text" bind:value={data.subtitleOrganization} placeholder="Kent State University" />
									</div>
									<div class="flex-1">
										<label for="subtitleUrl" class="sr-only">Organization URL</label>
										<input id="subtitleUrl" type="url" bind:value={data.subtitleUrl} placeholder="Organization URL (optional)" />
									</div>
								</div>
							</fieldset>

							<div>
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-slate-700">Titles / Roles</span>
									<button
										onclick={addTitle}
										class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors cursor-pointer"
									>
										+ Add Title
									</button>
								</div>
								{#each data.titles as title, i}
									<div class="flex gap-2 mb-2 flex-wrap">
										<div class="flex-1 min-w-[120px]">
										<input
											type="text"
											bind:value={title.title}
											aria-label="Title or role"
											placeholder="Title / Role"
											/>
										</div>
										<div class="flex-1 min-w-[120px]">
										<input
											type="text"
											bind:value={title.organization}
											aria-label="Title organization"
												placeholder="Organization"
											/>
										</div>
										<div class="flex-1 min-w-[120px]">
										<input
											type="url"
											bind:value={title.url}
											aria-label="Title organization URL"
												placeholder="Organization URL (optional)"
											/>
										</div>
										{#if data.titles.length > 1}
											<button
												onclick={() => removeTitle(i)}
												class="text-red-400 hover:text-red-600 px-1 cursor-pointer"
												title="Remove"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
												</svg>
											</button>
										{/if}
									</div>
								{/each}
							</div>
						</div>

					<!-- PHOTO TAB -->
					{:else if activeTab === 'photo'}
						<div class="space-y-4">
							<div>
								<label for="profileImage">Upload Photo</label>
								<input
									id="profileImage"
									type="file"
									accept="image/*"
									onchange={handleImageUpload}
									class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer"
								/>
							</div>

							{#if data.profileImage}
								<div class="flex items-center gap-3">
									<img
										src={data.profileImage}
										alt="Preview"
										class="object-cover border border-slate-200"
										style="width: {data.layout.imageSize}px; height: {data.layout.imageSize}px; border-radius: {data.layout.imageShape === 'circle' ? '50%' : data.layout.imageShape === 'rounded' ? '8px' : '0'};"
									/>
									<button
										onclick={() => (data.profileImage = '')}
										class="text-sm text-red-500 hover:text-red-700 cursor-pointer"
									>
										Remove
									</button>
								</div>
							{/if}

							<div>
								<label for="imageUrl">Image URL <span class="text-slate-400">(for email HTML — hosted image recommended)</span></label>
								<input type="url" id="imageUrl" bind:value={data.profileImageUrl} placeholder="https://example.com/photo.jpg" />
								<p class="text-xs text-slate-400 mt-1">If set, the email HTML will use this URL instead of the embedded image. Recommended for email compatibility.</p>
							</div>

							<div>
								<label for="imageSize">Image Size: {data.layout.imageSize}px</label>
								<input
									type="range"
									id="imageSize"
									bind:value={data.layout.imageSize}
									min="40"
									max="150"
									step="5"
									class="w-full"
								/>
							</div>

							<div>
								<label for="imageShape">Image Shape</label>
								<select id="imageShape" bind:value={data.layout.imageShape}>
									<option value="circle">Circle</option>
									<option value="rounded">Rounded</option>
									<option value="square">Square</option>
								</select>
							</div>
						</div>

					<!-- CONTACT TAB -->
					{:else if activeTab === 'contact'}
						<div class="space-y-4">
							<div>
								<label for="email">Email</label>
								<input type="email" id="email" bind:value={data.email} placeholder="email@example.com" />
							</div>
							<div>
								<label for="phone">Phone</label>
								<input type="tel" id="phone" bind:value={data.phone} placeholder="(555) 555-5555" />
							</div>
							<div>
								<label for="website">Website</label>
								<input type="url" id="website" bind:value={data.website} placeholder="example.com" />
							</div>
						</div>

					<!-- SOCIAL TAB -->
					{:else if activeTab === 'social'}
						<div class="space-y-4">
							<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-slate-700">Social Links</span>
								<button
									onclick={addSocialLink}
									class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors cursor-pointer"
								>
									+ Add Link
								</button>
							</div>
							{#if data.socialLinks.length === 0}
								<p class="text-sm text-slate-400 italic">No social links added yet.</p>
							{/if}
							{#each data.socialLinks as link, i}
								<div class="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
									<div class="flex-shrink-0 mt-1">
										{@html getSocialIcon(link.platform, 20)}
									</div>
									<div class="flex-1 space-y-2">
										<select bind:value={link.platform} aria-label="Social platform">
											{#each socialPlatforms as sp}
												<option value={sp.value}>{sp.label}</option>
											{/each}
										</select>
										<input
											type="url"
											bind:value={link.url}
											aria-label="Social profile URL"
											placeholder="https://..."
										/>
									</div>
									<button
										onclick={() => removeSocialLink(i)}
										class="text-red-400 hover:text-red-600 mt-1 cursor-pointer"
										title="Remove"
									>
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
										</svg>
									</button>
								</div>
							{/each}

							<!-- CTA / Action Link -->
							<fieldset class="border-t border-slate-200 pt-4 mt-4">
								<legend class="!mb-1">Action Link <span class="text-slate-400">(optional — e.g. "Book a Meeting")</span></legend>
								<div class="flex gap-2">
									<div class="flex-1">
										<label for="ctaText" class="sr-only">Action link text</label>
										<input id="ctaText" type="text" bind:value={data.ctaText} placeholder="Book a Meeting" />
									</div>
									<div class="flex-1">
										<label for="ctaUrl" class="sr-only">Action link URL</label>
										<input id="ctaUrl" type="url" bind:value={data.ctaUrl} placeholder="https://cal.com/you" />
									</div>
								</div>
							</fieldset>
						</div>

					<!-- STYLE TAB -->
					{:else if activeTab === 'style'}
						<div class="space-y-5">
							<!-- Layout -->
							<fieldset>
								<legend class="text-sm font-semibold text-slate-700 mb-2">Layout</legend>
								<div class="grid grid-cols-2 gap-2">
									<button
										onclick={() => (data.layout.layout = 'horizontal')}
										class="p-3 rounded-lg border text-sm text-center cursor-pointer transition-colors {data.layout.layout === 'horizontal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}"
									>
										<div class="flex items-center justify-center gap-2 mb-1">
											<div class="w-6 h-6 bg-slate-300 rounded-full flex-shrink-0"></div>
											<div class="text-left">
												<div class="w-12 h-1 bg-slate-300 rounded mb-1"></div>
												<div class="w-8 h-1 bg-slate-200 rounded"></div>
											</div>
										</div>
										Horizontal
									</button>
									<button
										onclick={() => (data.layout.layout = 'stacked')}
										class="p-3 rounded-lg border text-sm text-center cursor-pointer transition-colors {data.layout.layout === 'stacked' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}"
									>
										<div class="flex flex-col items-center mb-1">
											<div class="w-6 h-6 bg-slate-300 rounded-full mb-1"></div>
											<div class="w-12 h-1 bg-slate-300 rounded mb-1"></div>
											<div class="w-8 h-1 bg-slate-200 rounded"></div>
										</div>
										Stacked
									</button>
								</div>
							</fieldset>

							<!-- Divider -->
							<div>
								<label for="dividerStyle">Divider Style</label>
								<select id="dividerStyle" bind:value={data.layout.dividerStyle}>
									<option value="solid">Solid</option>
									<option value="dashed">Dashed</option>
									<option value="dotted">Dotted</option>
									<option value="none">None</option>
								</select>
							</div>

							<!-- Signoff -->
							<div>
								<label class="flex items-center gap-2 cursor-pointer">
									<input type="checkbox" bind:checked={data.layout.showSignoff} class="rounded" />
									<span class="text-sm text-slate-600">Show sign-off text</span>
								</label>
								{#if data.layout.showSignoff}
									<input
										type="text"
										bind:value={data.layout.signoffText}
										placeholder="Best regards,"
										class="mt-2"
									/>
								{/if}
							</div>

							<!-- Font -->
							<div>
								<label for="fontFamily">Font Family</label>
								<select id="fontFamily" bind:value={data.fonts.fontFamily}>
									{#each fontFamilies as ff}
										<option value={ff.value}>{ff.label}</option>
									{/each}
								</select>
							</div>

							<!-- Font Sizes -->
							<fieldset>
								<legend class="text-sm font-semibold text-slate-700 mb-2">Font Sizes</legend>
								<div class="grid grid-cols-2 gap-3">
									<div>
										<label for="nameSize">Name: {data.fonts.nameSize}px</label>
										<input type="range" id="nameSize" bind:value={data.fonts.nameSize} min="12" max="30" step="1" class="w-full" />
									</div>
									<div>
										<label for="subtitleSize">Subtitle: {data.fonts.subtitleSize}px</label>
										<input type="range" id="subtitleSize" bind:value={data.fonts.subtitleSize} min="10" max="24" step="1" class="w-full" />
									</div>
									<div>
										<label for="titleSize">Title: {data.fonts.titleSize}px</label>
										<input type="range" id="titleSize" bind:value={data.fonts.titleSize} min="9" max="20" step="1" class="w-full" />
									</div>
									<div>
										<label for="textSize">Text: {data.fonts.textSize}px</label>
										<input type="range" id="textSize" bind:value={data.fonts.textSize} min="8" max="18" step="1" class="w-full" />
									</div>
								</div>
							</fieldset>

							<!-- Colors -->
							<fieldset>
								<legend class="text-sm font-semibold text-slate-700 mb-2">Colors</legend>
								<div class="grid grid-cols-2 gap-3">
									{#each [
										{ key: 'nameColor', label: 'Name' },
										{ key: 'titleColor', label: 'Title' },
										{ key: 'textColor', label: 'Text' },
										{ key: 'accentColor', label: 'Accent' },
										{ key: 'linkColor', label: 'Links' },
										{ key: 'dividerColor', label: 'Divider' },
									] as colorOpt}
										<div class="flex items-center gap-2">
											<input
												type="color"
												bind:value={data.colors[colorOpt.key as keyof typeof data.colors]}
												class="w-8 h-8 rounded border border-slate-200 cursor-pointer"
											/>
											<span class="text-sm text-slate-600">{colorOpt.label}</span>
										</div>
									{/each}
								</div>
							</fieldset>
						</div>
					{/if}
				</div>
			</div>

			<!-- Right: Preview Panel -->
			<div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
				<!-- View mode tabs + actions -->
				<div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4">
					<div class="flex">
						{#each [
							{ id: 'preview', label: 'Preview' },
							{ id: 'html', label: 'HTML' },
							{ id: 'typst', label: 'Typst' },
						] as mode}
							<button
								onclick={() => (viewMode = mode.id)}
								class="px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer {viewMode === mode.id
									? 'text-blue-600 border-b-2 border-blue-600'
									: 'text-slate-500 hover:text-slate-700'}"
							>
								{mode.label}
							</button>
						{/each}
					</div>
					<div class="flex items-center gap-2">
						<button
							onclick={copyRichSignature}
							class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors cursor-pointer"
						>
							{copied ? '✓ Copied!' : 'Copy Signature'}
						</button>
						<button
							onclick={copyHtml}
							class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
						>
							Copy HTML
						</button>
						<button
							onclick={copyTypst}
							class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
						>
							Copy Typst
						</button>
					</div>
				</div>

				<!-- Preview content -->
				<div class="flex-1 overflow-auto max-h-[calc(100vh-14rem)] p-6">
					{#if viewMode === 'preview'}
						<div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
							<div class="signature-preview">
								{@html signatureHtml}
							</div>
						</div>
						<p class="text-xs text-slate-400 mt-3 text-center">This is a live preview of your email signature.</p>

					{:else if viewMode === 'html'}
						<div class="relative">
							<pre class="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-auto font-mono leading-relaxed whitespace-pre-wrap break-all"><code>{signatureHtml}</code></pre>
						</div>

					{:else if viewMode === 'typst'}
						<div class="relative">
							<pre class="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-auto font-mono leading-relaxed whitespace-pre-wrap break-all"><code>{typstCode}</code></pre>
							<p class="text-xs text-slate-400 mt-3">Typst source code for the signature. Can be compiled with Typst to generate a high-quality image.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="border-t border-slate-200 bg-white mt-6 px-6 py-4">
		<div class="max-w-[1600px] mx-auto text-center text-sm text-slate-400">
			Made by <a href="https://asternberg.xyz" class="text-blue-500 hover:text-blue-600 transition-colors">Austin Sternberg</a>
		</div>
	</footer>
</div>

<style>
	.signature-preview :global(a) {
		text-decoration: none;
	}
	.signature-preview :global(img) {
		max-width: none;
	}
</style>
