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
	import { downloadBlob, fileStem, htmlDocument, renderPng, type DownloadKind } from '$lib/download';
	import { compatibilityWarnings } from '$lib/email-compat';
	import { copyMessage, copyPlainText, copyRichHtml, type CopyAction, type CopyOutcome } from '$lib/clipboard';
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
	let copied: { action: CopyAction; outcome: CopyOutcome } | null = $state(null);
	let statusTimer: ReturnType<typeof setTimeout> | undefined;
	let skipNextPersistence = false;

	let signatureHtml = $derived(generateSignatureHtml(data));
	let typstCode = $derived(generateTypstCode(data));
	let warnings = $derived(compatibilityWarnings(data));

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
		downloadBlob(
			new Blob([exportSignature(signature)], { type: 'application/json' }),
			`${fileStem(signature.name)}.emailsmith.json`,
		);
		announce(`Exported ${signature.name}.`);
	}

	async function download(kind: DownloadKind) {
		const stem = fileStem(active.name);
		if (kind === 'html') {
			downloadBlob(new Blob([htmlDocument(signatureHtml)], { type: 'text/html' }), `${stem}.html`);
			announce('Downloaded the signature as an HTML file.');
		} else if (kind === 'typst') {
			downloadBlob(new Blob([typstCode], { type: 'text/plain' }), `${stem}.typ`);
			announce(
				data.profileImage || data.profileImageUrl
					? 'Downloaded the Typst file. Save your photo as photo.jpg next to it before compiling.'
					: 'Downloaded the Typst file.',
			);
		} else {
			// The image renderer cannot fetch remote files, so prefer the embedded upload when there is one.
			const pngData = data.profileImage ? { ...$state.snapshot(data), profileImageUrl: '' } : $state.snapshot(data);
			try {
				downloadBlob(await renderPng(generateSignatureHtml(pngData)), `${stem}.png`);
				announce(
					!data.profileImage && data.profileImageUrl
						? 'Downloaded the PNG. Hosted photos cannot be drawn into the image, so upload the photo to include it.'
						: 'Downloaded the signature as a PNG image.',
				);
			} catch {
				announce('This browser could not render the PNG. Try the HTML file or another browser.');
			}
		}
	}

	// One timer covers every status message, so overlapping clicks cannot clear a newer message early.
	function announce(message: string) {
		copyStatus = message;
		clearTimeout(statusTimer);
		statusTimer = setTimeout(() => {
			copyStatus = '';
			copied = null;
		}, 4000);
	}

	// The signature copies as rich HTML so it pastes formatted; HTML and Typst copy their source as plain text.
	async function copy(action: CopyAction): Promise<boolean> {
		const outcome: CopyOutcome =
			action === 'signature'
				? await copyRichHtml(signatureHtml)
				: (await copyPlainText(action === 'html' ? signatureHtml : typstCode))
					? 'copied'
					: 'failed';
		copied = { action, outcome };
		announce(copyMessage(action, outcome));
		return outcome !== 'failed';
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
		{copied}
		onCopySignature={() => copy('signature')}
		onCopyHtml={() => copy('html')}
		onCopyTypst={() => copy('typst')}
		onDownload={download}
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
				<TabBar {tabs} bind:activeTab idPrefix="editor" />

				<div id="editor-panel" role="tabpanel" aria-labelledby={`editor-tab-${activeTab}`}>
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
			</div>

			<PreviewPanel {viewMode} {signatureHtml} {typstCode} {warnings} onCopy={copy} />
		</div>
	</main>

	<AppFooter />
	<ClearDataModal bind:open={clearDataOpen} onConfirm={clearBrowserData} />
</div>
