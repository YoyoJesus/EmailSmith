<script>
	import '../app.css';
	import MobileWarning from '$lib/components/MobileWarning.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<title>EmailSmith | Email Signature Maker</title>
	<meta name="application-name" content="EmailSmith" />
</svelte:head>

<MobileWarning />

{@render children()}
