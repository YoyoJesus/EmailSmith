<script lang="ts">
	import { onMount } from 'svelte';
	import { signatureStore } from '$lib/store';
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
	import InfoForm from '$lib/components/forms/InfoForm.svelte';
	import PhotoForm from '$lib/components/forms/PhotoForm.svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import SocialForm from '$lib/components/forms/SocialForm.svelte';
	import LayoutForm from '$lib/components/forms/LayoutForm.svelte';
	import FontsForm from '$lib/components/forms/FontsForm.svelte';
	import ColorsForm from '$lib/components/forms/ColorsForm.svelte';

	let data: SignatureData = $state(structuredClone(defaultSignatureData));
	let activeTab: string = $state('info');
	let viewMode: ViewMode = $state('preview');
	let copyStatus = $state('');
	let clearDataOpen = $state(false);
	let loaded = $state(false);
	let signatureCopied = $derived(copyStatus.startsWith('Signature'));
	let skipNextPersistence = false;

	let signatureHtml = $derived(generateSignatureHtml(data));
	let typstCode = $derived(generateTypstCode(data));

	// Persist state only after the initial load so saved data is not overwritten.
	$effect(() => {
		const snapshot = $state.snapshot(data);
		if (!loaded) return;
		if (skipNextPersistence) {
			skipNextPersistence = false;
			return;
		}
		signatureStore.set(snapshot);
		signatureStore.saveToStorage(snapshot);
	});

	onMount(() => {
		data = signatureStore.loadFromStorage();
		footerStore.loadFromStorage();
		loaded = true;
	});

	function announce(message: string) {
		copyStatus = message;
		setTimeout(() => {
			if (copyStatus === message) copyStatus = '';
		}, 2000);
	}

	async function copyText(text: string, label: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}
		announce(`${label} copied to clipboard.`);
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
		data = structuredClone(defaultSignatureData);
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
