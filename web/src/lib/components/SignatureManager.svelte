<!--
	Switch between saved signatures and move them in or out as JSON files. Everything stays in this browser;
	export downloads a file and import reads one locally.
-->
<script lang="ts">
	import { MAX_SIGNATURE_NAME_LENGTH } from '$lib/store';

	let {
		signatures,
		activeId,
		activeName = $bindable(),
		canAdd,
		onSelect,
		onAdd,
		onDuplicate,
		onDelete,
		onImport,
		onExport,
	}: {
		signatures: { id: string; name: string }[];
		activeId: string;
		activeName: string;
		canAdd: boolean;
		onSelect: (id: string) => void;
		onAdd: () => void;
		onDuplicate: () => void;
		onDelete: () => void;
		onImport: (file: File) => void;
		onExport: () => void;
	} = $props();

	const uid = $props.id();
	let fileInput = $state<HTMLInputElement>();

	function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file) onImport(file);
	}
</script>

<section class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3" aria-labelledby={`${uid}-heading`}>
	<h2 id={`${uid}-heading`} class="sr-only">Saved signatures</h2>
	<div class="grid gap-3 sm:grid-cols-2">
		<div>
			<label for={`${uid}-select`}>Signature</label>
			<select id={`${uid}-select`} value={activeId} onchange={(event) => onSelect(event.currentTarget.value)}>
				{#each signatures as signature (signature.id)}
					<option value={signature.id}>{signature.name}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for={`${uid}-name`}>Name</label>
			<input
				id={`${uid}-name`}
				type="text"
				bind:value={activeName}
				maxlength={MAX_SIGNATURE_NAME_LENGTH}
				placeholder="Work"
			/>
		</div>
	</div>
	<div class="mt-3 flex flex-wrap gap-2">
		<button type="button" class="secondary action" onclick={onAdd} disabled={!canAdd}>New</button>
		<button type="button" class="secondary action" onclick={onDuplicate} disabled={!canAdd}>Duplicate</button>
		<button
			type="button"
			class="secondary action"
			onclick={onDelete}
			disabled={signatures.length <= 1}
			aria-label={`Delete ${activeName || 'signature'}`}>Delete</button
		>
		<span class="flex-1"></span>
		<button type="button" class="secondary action" onclick={() => fileInput?.click()} disabled={!canAdd}
			>Import</button
		>
		<button type="button" class="secondary action" onclick={onExport}>Export</button>
		<input
			bind:this={fileInput}
			type="file"
			accept="application/json,.json"
			class="hidden"
			tabindex="-1"
			aria-hidden="true"
			onchange={importFile}
		/>
	</div>
</section>

<style>
	/* The global button rule in app.css is unlayered, so sizes are set here rather than with utilities. */
	.action {
		padding: 0.3125rem 0.75rem;
		font-size: 0.875rem;
	}

	.action:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
