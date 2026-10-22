<script lang="ts">
	import type { SignatureData } from '$lib/types';
	import { moveAt } from '$lib/reorder';
	import EntryCard from '../EntryCard.svelte';

	let { data }: { data: SignatureData } = $props();
	const uid = $props.id();

	function addTitle() {
		data.titles = [...data.titles, { title: '', organization: '', url: '' }];
	}

	function removeTitle(index: number) {
		data.titles = data.titles.filter((_, i) => i !== index);
	}
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Personal Information</h2>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-identity`}>
		<h3 id={`${uid}-identity`} class="editor-subheading">Identity</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-name`}>Full Name</label>
				<input id={`${uid}-name`} type="text" bind:value={data.name} placeholder="Jane Doe" />
			</div>
			<div>
				<label for={`${uid}-pronouns`}>Pronouns <span class="font-normal text-gray-400">(optional)</span></label>
				<input id={`${uid}-pronouns`} type="text" bind:value={data.pronouns} placeholder="she/her" />
			</div>
		</div>
	</section>
	<section class="editor-card" aria-labelledby={`${uid}-subtitle`}>
		<h3 id={`${uid}-subtitle`} class="editor-subheading">Education or company</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-subtitle-text`}>Role or program</label>
				<input
					id={`${uid}-subtitle-text`}
					type="text"
					bind:value={data.subtitleText}
					placeholder="Computer Science Student"
				/>
			</div>
			<div>
				<label for={`${uid}-subtitle-org`}>Organization</label>
				<input
					id={`${uid}-subtitle-org`}
					type="text"
					bind:value={data.subtitleOrganization}
					placeholder="Example University"
				/>
			</div>
			<div class="editor-span">
				<label for={`${uid}-subtitle-url`}
					>Organization URL <span class="font-normal text-gray-400">(optional)</span></label
				>
				<input id={`${uid}-subtitle-url`} type="url" bind:value={data.subtitleUrl} placeholder="https://example.edu" />
			</div>
		</div>
	</section>

	<div class="editor-heading">
		<h2>Titles and Roles</h2>
		<button type="button" class="primary editor-add" onclick={addTitle}>+ Add title</button>
	</div>
	{#each data.titles as title, i}
		<EntryCard
			index={i}
			count={data.titles.length}
			label={`title ${i + 1}`}
			onMove={(direction) => (data.titles = moveAt(data.titles, i, direction))}
			onRemove={() => removeTitle(i)}
		>
			<div class="editor-grid">
				<div>
					<label for={`${uid}-${i}-title`}>Title or role</label>
					<input id={`${uid}-${i}-title`} type="text" bind:value={title.title} placeholder="President" />
				</div>
				<div>
					<label for={`${uid}-${i}-org`}>Organization</label>
					<input id={`${uid}-${i}-org`} type="text" bind:value={title.organization} placeholder="Example Club" />
				</div>
				<div class="editor-span">
					<label for={`${uid}-${i}-url`}>Organization URL <span class="font-normal text-gray-400">(optional)</span></label
					>
					<input id={`${uid}-${i}-url`} type="url" bind:value={title.url} placeholder="https://example.org" />
				</div>
			</div>
		</EntryCard>
	{:else}
		<p class="editor-empty">No titles yet. Add one to show a role under your name.</p>
	{/each}
</div>
