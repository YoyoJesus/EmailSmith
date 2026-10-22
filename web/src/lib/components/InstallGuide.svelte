<!--
	Where to paste the copied signature in common clients. Menu paths change between client versions, so each entry
	stays short and names the setting rather than every click.
-->
<script lang="ts">
	const CLIENTS: { name: string; steps: string[]; limits: string[] }[] = [
		{
			name: 'Gmail',
			steps: [
				'Click Copy signature.',
				'In Gmail, open Settings > See all settings > General > Signature and click Create new.',
				'Paste into the signature box, then click Save Changes at the bottom of the page.',
			],
			limits: [
				'Embedded (uploaded) photos and social icons are removed. Use a hosted image URL for the photo.',
				'Signatures are limited to 10,000 characters.',
			],
		},
		{
			name: 'Outlook on the web and new Outlook',
			steps: [
				'Click Copy signature.',
				'Open Settings > Account > Signatures and create a new signature.',
				'Paste into the editor, choose it as the default for new messages if you like, and click Save.',
			],
			limits: ['Embedded photos and SVG social icons may not be shown to recipients.'],
		},
		{
			name: 'Outlook for Windows (classic)',
			steps: [
				'Click Copy signature.',
				'Open File > Options > Mail > Signatures and click New.',
				'Paste into the Edit signature box and click OK.',
			],
			limits: [
				'border-radius is ignored, so circle and rounded photos appear square.',
				'Embedded photos and SVG social icons are often dropped. Use a hosted image URL.',
			],
		},
		{
			name: 'Apple Mail',
			steps: [
				'Click Copy signature.',
				'Open Mail > Settings > Signatures, select the account, and click +.',
				'Uncheck "Always match my default message font", then paste into the signature area.',
			],
			limits: ['Formatting is lost if "Always match my default message font" stays checked.'],
		},
		{
			name: 'Thunderbird',
			steps: [
				'Choose More > Download > HTML file.',
				'Open Account Settings for your account.',
				'Check "Attach the signature from a file instead" and choose the downloaded file. Alternatively, check "Use HTML" and paste the code from More > Copy HTML.',
			],
			limits: ['Remote images may be blocked until the recipient allows them.'],
		},
	];
</script>

<section class="w-full max-w-xl rounded-lg bg-white/95 p-4 text-sm text-gray-800 shadow" aria-labelledby="install-guide">
	<h3 id="install-guide" class="mb-2 font-semibold text-gray-900">Add the signature to your email client</h3>
	<div class="divide-y divide-gray-200">
		{#each CLIENTS as client (client.name)}
			<details class="group py-2">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-2 rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					{client.name}
					<span
						class="icon-[lucide--chevron-down] size-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
						aria-hidden="true"
					></span>
				</summary>
				<ol class="mt-2 list-decimal space-y-1 pl-5">
					{#each client.steps as step}
						<li>{step}</li>
					{/each}
				</ol>
				<p class="mt-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Known limits</p>
				<ul class="mt-1 list-disc space-y-1 pl-5 text-gray-600">
					{#each client.limits as limit}
						<li>{limit}</li>
					{/each}
				</ul>
			</details>
		{/each}
	</div>
</section>
