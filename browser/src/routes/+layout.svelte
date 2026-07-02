<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		font-family: 'JetBrains Mono', ui-monospace, 'Cascadia Code', 'Courier New', monospace;
		color: #e8e8ea;
		background-color: #16161a;
		background-image: radial-gradient(#2a2a33 1px, transparent 1px);
		background-size: 22px 22px;
	}
</style>