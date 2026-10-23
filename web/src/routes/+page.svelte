<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		activeSignature,
		addSignature,
		canAddSignature,
		createLibrary,
		exportSignature,
		importSignature,
		loadLibrary,
		removeSignature,
		saveLibrary,
		type SignatureLibrary,
	} from '$lib/store';
	import { footerStore } from '$lib/footer-store';
	import { OWNED_LOCAL_STORAGE_KEYS, removeOwnedStorageKeys } from '$lib/clear-browser-data';
	import { generateSignatureHtml } from '$lib/html-generator';
	import { generateTypstCode } from '$lib/typst-generator';
	import { defaultSignatureData, type SignatureData } from '$lib/types';
	import AppHeader, { type ViewMode } from '$lib/components/AppHeader.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import ClearDataModal from '$lib/components/ClearDataModal.svelte';
	import PreviewPanel from '$lib/components/PreviewPanel.svelte';
	import TabBar, { type EditorTab } from '$lib/components/TabBar.svelte';
	import SignatureManager from '$lib/components/SignatureManager.svelte';
	import InfoForm from '$lib/components/forms/InfoForm.svelte';
	import PhotoForm from '$lib/components/forms/PhotoForm.svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import SocialForm from '$lib/components/forms/SocialForm.svelte';
	import LayoutForm from '$lib/components/forms/LayoutForm.svelte';
	import FontsForm from '$lib/components/forms/FontsForm.svelte';
	import ColorsForm from '$lib/components/forms/ColorsForm.svelte';

	let library: SignatureLibrary = $state(createLibrary());
	let data: SignatureData = $state(structuredClone(defaultSignatureData));
	let storageWarning = $state('');
	let loadFailed = $state(false);
	let activeTab: string = $state('info');
	let viewMode: ViewMode = $state('preview');
	let copyStatus = $state('');
	let clearDataOpen = $state(false);
	let loaded = $state(false);
	let signatureCopied = $derived(copyStatus.startsWith('Signature'));
	let skipNextPersistence = false;

	let signatureHtml = $derived(generateSignatureHtml(data));
	let typstCode = $derived(generateTypstCode(data));

	let active = $derived(activeSignature(library));

	function persist() {
		let result: ReturnType<typeof saveLibrary>;
		try {
			result = saveLibrary(window.localStorage, $state.snapshot(library));
		} catch {
			result = { ok: false, reason: 'blocked' };
		}
		if (result.ok) {
			storageWarning = '';
			loadFailed = false;
		} else {
			storageWarning =
				result.reason === 'quota'
					? 'Changes are not being saved: browser storage is full. Remove the uploaded photo or delete other signatures, then edit again.'
					: 'Changes are not being saved: this browser blocked storage. Your work will be lost when the page closes.';
		}
	}

	// Persist state only after the initial load so saved data is not overwritten.
	$effect(() => {
		const snapshot = $state.snapshot(data);
		const name = active.name;
		if (!loaded) return;
		if (skipNextPersistence) {
			skipNextPersistence = false;
			return;
		}
		untrack(() => {
			const current = activeSignature(library);
			current.data = snapshot;
			current.name = name;
			persist();
		});
	});

	onMount(() => {
		let result: ReturnType<typeof loadLibrary>;
		try {
			result = loadLibrary(window.localStorage);
		} catch {
			result = { library: createLibrary(), status: 'unreadable' };
		}
		library = result.library;
		data = structuredClone(activeSignature(result.library).data);
		// Leave unreadable data in place until the person edits or deletes it.
		loadFailed = result.status === 'unreadable';
		skipNextPersistence = loadFailed;
		footerStore.loadFromStorage();
		loaded = true;
	});

	function selectSignature(id: string) {
		if (!library.signatures.some((s) => s.id === id)) return;
		skipNextPersistence = true;
		library.activeId = id;
		data = structuredClone($state.snapshot(activeSignature(library).data));
		persist();
	}

	function addAndSelect(next: SignatureLibrary) {
		skipNextPersistence = true;
		library = next;
		data = structuredClone($state.snapshot(activeSignature(library).data));
		persist();
	}

	function newSignature() {
		addAndSelect(addSignature(library, '', structuredClone(defaultSignatureData)));
		announce(`Created ${active.name}.`);
	}

	function duplicateSignature() {
		addAndSelect(addSignature(library, `${active.name} copy`, $state.snapshot(data)));
		announce(`Created ${active.name}.`);
	}

	function deleteSignature() {
		const name = active.name;
		if (!confirm(`Delete "${name}" from this browser? This cannot be undone.`)) return;
		addAndSelect(removeSignature(library, active.id));
		announce(`Deleted ${name}.`);
	}

	async function importFile(file: File) {
		const result = file.size <= 5 * 1024 * 1024 ? importSignature(await file.text()) : ({ ok: false } as const);
		if (!result.ok) {
			announce('That file is not an EmailSmith signature export.');
			return;
		}
		addAndSelect(addSignature(library, result.name, result.data));
		announce(`Imported ${active.name}.`);
	}

	function exportFile() {
		const signature = { ...$state.snapshot(active), data: $state.snapshot(data) };
		const url = URL.createObjectURL(new Blob([exportSignature(signature)], { type: 'application/json' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = `${signature.name.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'signature'}.emailsmith.json`;
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 0);
		announce(`Exported ${signature.name}.`);
	}

	function announce(message: string) {
		copyStatus = message;
		setTimeout(() => {
			if (copyStatus === message) copyStatus = '';
		}, 2000);
	}

	async function copyText(text: string, label: string): Promise<boolean> {
		let copied = true;
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// The fallback selects a temporary textarea, so focus is restored to where the person was.
			const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			const textarea = document.createElement('textarea');
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			try {
				copied = document.execCommand('copy');
			} catch {
				copied = false;
			}
			document.body.removeChild(textarea);
			previousFocus?.focus();
		}
		announce(copied ? `${label} copied to clipboard.` : `Could not copy ${label}. Select the code and copy it manually.`);
		return copied;
	}

	// Rich HTML pastes as a formatted signature in email clients.
	async function copyRichSignature() {
		try {
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/html': new Blob([signatureHtml], { type: 'text/html' }),
					'text/plain': new Blob([signatureHtml], { type: 'text/plain' }),
				}),
			]);
			announce('Signature copied to clipboard.');
		} catch {
			await copyText(signatureHtml, 'Signature HTML');
		}
	}

	function clearBrowserData(): string | null {
		let failed: string[] = [...OWNED_LOCAL_STORAGE_KEYS];
		try {
			failed = removeOwnedStorageKeys(window.localStorage, OWNED_LOCAL_STORAGE_KEYS).failed;
		} catch {
			/* Storage access can be blocked by the browser. */
		}
		skipNextPersistence = true;
		library = createLibrary();
		data = structuredClone(defaultSignatureData);
		storageWarning = '';
		loadFailed = false;
		footerStore.reset();
		activeTab = 'info';
		viewMode = 'preview';
		if (failed.length) {
			return 'The page was reset, but browser storage could not confirm removal of all saved data. Check your browser storage settings and try again.';
		}
		return null;
	}

	const tabs: EditorTab[] = [
		{ id: 'info', label: 'Info', group: 'content' },
		{ id: 'photo', label: 'Photo', group: 'content' },
		{ id: 'contact', label: 'Contact', group: 'content' },
		{ id: 'social', label: 'Social', group: 'content' },
		{ id: 'layout', label: 'Layout', group: 'appearance' },
		{ id: 'fonts', label: 'Fonts', group: 'appearance' },
		{ id: 'colors', label: 'Colors', group: 'appearance' },
	];
</script>

<div class="min-h-screen bg-gray-100 flex flex-col lg:h-screen lg:overflow-hidden">
	<AppHeader
		bind:viewMode
		{copyStatus}
		{signatureCopied}
		onCopySignature={copyRichSignature}
		onCopyHtml={() => copyText(signatureHtml, 'HTML')}
		onCopyTypst={() => copyText(typstCode, 'Typst')}
		onClearData={() => (clearDataOpen = true)}
	/>

	<!-- Main content -->
	<main class="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:flex-1 lg:min-h-0">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-full lg:min-h-0">
			<div class="bg-white rounded-lg shadow p-6 overflow-auto max-h-[calc(100vh-10rem)] lg:max-h-none lg:h-full">
				{#if loadFailed}
					<div role="alert" class="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
						<p>
							Saved data in this browser could not be read, so EmailSmith started with default values. Editing will
							replace the unreadable data.
						</p>
						<button type="button" class="secondary mt-2 text-sm" onclick={() => (clearDataOpen = true)}
							>Delete saved data</button
						>
					</div>
				{/if}
				{#if storageWarning}
					<p role="alert" class="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
						{storageWarning}
					</p>
				{/if}
				<SignatureManager
					signatures={library.signatures}
					activeId={library.activeId}
					bind:activeName={active.name}
					canAdd={canAddSignature(library)}
					onSelect={selectSignature}
					onAdd={newSignature}
					onDuplicate={duplicateSignature}
					onDelete={deleteSignature}
					onImport={importFile}
					onExport={exportFile}
				/>
				<TabBar {tabs} bind:activeTab />

				{#if activeTab === 'info'}
					<InfoForm bind:data />
				{:else if activeTab === 'photo'}
					<PhotoForm bind:data />
				{:else if activeTab === 'contact'}
					<ContactForm bind:data />
				{:else if activeTab === 'social'}
					<SocialForm bind:data />
				{:else if activeTab === 'layout'}
					<LayoutForm bind:data />
				{:else if activeTab === 'fonts'}
					<FontsForm bind:data />
				{:else if activeTab === 'colors'}
					<ColorsForm bind:data />
				{/if}
			</div>

			<PreviewPanel {viewMode} {signatureHtml} {typstCode} onCopy={copyText} />
		</div>
	</main>

	<AppFooter />
	<ClearDataModal bind:open={clearDataOpen} onConfirm={clearBrowserData} />
</div>
