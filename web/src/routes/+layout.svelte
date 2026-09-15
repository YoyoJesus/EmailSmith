<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>EmailSmith | Email Signature Maker</title>
	<meta name="application-name" content="EmailSmith" />
</svelte:head>

{@render children()}
