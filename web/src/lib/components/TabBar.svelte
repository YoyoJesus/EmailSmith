<script lang="ts" module>
	export interface EditorTab {
		id: string;
		label: string;
		group: 'content' | 'appearance';
	}
</script>

<script lang="ts">
	let { tabs, activeTab = $bindable() }: { tabs: EditorTab[]; activeTab: string } = $props();

	let content = $derived(tabs.filter((tab) => tab.group === 'content'));
	let appearance = $derived(tabs.filter((tab) => tab.group === 'appearance'));
</script>

{#snippet tabButton(tab: EditorTab)}
	<button
		type="button"
		class="tab text-sm {activeTab === tab.id
			? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
			: 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}"
		aria-current={activeTab === tab.id ? 'true' : undefined}
		onclick={() => (activeTab = tab.id)}>{tab.label}</button
	>
{/snippet}

<nav class="mb-5 space-y-2 border-b pb-4" aria-label="Editor sections">
	<div class="track" role="group" aria-label="Content">
		{#each content as tab (tab.id)}
			{@render tabButton(tab)}
		{/each}
	</div>
	{#if appearance.length > 0}
		<div class="flex items-center gap-2" role="group" aria-labelledby="tabbar-appearance">
			<p id="tabbar-appearance" class="appearance-label">Appearance</p>
			<div class="track">
				{#each appearance as tab (tab.id)}
					{@render tabButton(tab)}
				{/each}
			</div>
		</div>
	{/if}
</nav>

<style>
	/* The global button rule in app.css is unlayered, so sizes are set here rather than with utilities. */
	.appearance-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		color: var(--color-gray-500);
	}

	.track {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem;
		border-radius: 0.5rem;
		background-color: var(--color-gray-100);
		padding: 0.125rem;
	}

	.tab {
		padding: 0.3125rem 0.625rem;
		white-space: nowrap;
	}

	.tab:focus-visible {
		outline: 2px solid var(--color-blue-500);
		outline-offset: 1px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.tab {
			transition:
				background-color 140ms ease-out,
				color 140ms ease-out,
				box-shadow 140ms ease-out,
				transform 100ms ease-out;
		}

		.tab:active {
			transform: translateY(1px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tab {
			transition: none;
		}
	}
</style>
