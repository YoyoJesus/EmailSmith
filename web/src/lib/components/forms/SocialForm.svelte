<script lang="ts">
	import { socialPlatforms, type SignatureData, type SocialPlatform } from '$lib/types';
	import { getSocialIcon } from '$lib/social-icons';
	import { moveAt } from '$lib/reorder';
	import EntryCard from '../EntryCard.svelte';

	let { data = $bindable() }: { data: SignatureData } = $props();
	const uid = $props.id();

	function addSocialLink() {
		data.socialLinks = [...data.socialLinks, { platform: 'linkedin' as SocialPlatform, url: '' }];
	}

	function removeSocialLink(index: number) {
		data.socialLinks = data.socialLinks.filter((_, i) => i !== index);
	}
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Social Links</h2>
		<button type="button" class="primary editor-add" onclick={addSocialLink}>+ Add link</button>
	</div>
	{#each data.socialLinks as link, i}
		{@const platformLabel = socialPlatforms.find((sp) => sp.value === link.platform)?.label ?? 'link'}
		<EntryCard
			index={i}
			count={data.socialLinks.length}
			label={`${platformLabel} link`}
			onMove={(direction) => (data.socialLinks = moveAt(data.socialLinks, i, direction))}
			onRemove={() => removeSocialLink(i)}
		>
			<div class="flex items-end gap-3">
				<div class="mb-2 shrink-0" aria-hidden="true">
					{@html getSocialIcon(link.platform, 20)}
				</div>
				<div class="editor-grid min-w-0 flex-1">
					<div>
						<label for={`${uid}-${i}-platform`}>Platform</label>
						<select id={`${uid}-${i}-platform`} bind:value={link.platform}>
							{#each socialPlatforms as sp}
								<option value={sp.value}>{sp.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for={`${uid}-${i}-url`}>Profile URL</label>
						<input id={`${uid}-${i}-url`} type="url" bind:value={link.url} placeholder="https://..." />
					</div>
				</div>
			</div>
		</EntryCard>
	{:else}
		<p class="editor-empty">No social links yet.</p>
	{/each}

	<section class="editor-card" aria-labelledby={`${uid}-cta`}>
		<h3 id={`${uid}-cta`} class="editor-subheading">Action link</h3>
		<p class="editor-description">Optional bold link below your details, for example "Book a meeting".</p>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-cta-text`}>Link text</label>
				<input id={`${uid}-cta-text`} type="text" bind:value={data.ctaText} placeholder="Book a meeting" />
			</div>
			<div>
				<label for={`${uid}-cta-url`}>Link URL</label>
				<input id={`${uid}-cta-url`} type="url" bind:value={data.ctaUrl} placeholder="https://cal.example.com/you" />
			</div>
		</div>
	</section>
</div>
