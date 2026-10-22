<!--
	The footer stays short so the viewport-locked layout in +page.svelte keeps its height. It can be hidden completely to
	give the panels more room; the header's More menu brings it back, so hiding moves focus to that menu button.
-->
<script lang="ts">
	import { footerStore } from '$lib/footer-store';

	function hide() {
		footerStore.toggle();
		footerStore.saveToStorage();
		document.querySelector<HTMLElement>('[aria-controls="header-more-menu"]')?.focus();
	}

	const linkClass =
		'rounded-sm text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
</script>

{#snippet external(href: string, label: string)}
	<a {href} target="_blank" rel="noopener noreferrer" class="footer-link {linkClass}">{label}</a>
{/snippet}

{#if !$footerStore}
	<footer class="bg-white border-t border-gray-200 mt-auto">
		<div
			class="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 lg:py-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 text-[11px] leading-snug text-gray-500"
		>
			<p class="flex flex-wrap items-center gap-x-2 gap-y-1">
				<span class="font-medium text-gray-700">&copy; {new Date().getFullYear()} ToolSmith</span>
				<span aria-hidden="true" class="text-gray-300">&middot;</span>
				<span>EmailSmith by {@render external('https://asternberg.xyz', 'Austin Sternberg')}</span>
			</p>
			<div class="flex flex-wrap items-center gap-2 sm:justify-end">
				<a
					href="https://github.com/YoyoJesus/EmailSmith"
					target="_blank"
					rel="noopener noreferrer"
					class="footer-link inline-flex items-center gap-1.5 rounded-full border border-blue-200 px-2.5 py-1 font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					<span aria-hidden="true" class="icon-[simple-icons--github] size-3.5 shrink-0"></span>
					Contribute on GitHub
				</a>
				<button
					type="button"
					class="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
					onclick={hide}
				>
					<span aria-hidden="true" class="icon-[lucide--chevron-down] size-3 shrink-0"></span>
					Hide footer
				</button>
			</div>
		</div>
	</footer>
{/if}

<style>
	@media (prefers-reduced-motion: no-preference) {
		.footer-link {
			transition:
				color 140ms ease-out,
				text-decoration-color 140ms ease-out;
		}
	}
</style>
