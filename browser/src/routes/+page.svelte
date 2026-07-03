<script>
	import * as cube from "$lib/cube";
	import Cube3D from "$lib/components/cube3D.svelte";
	import Globe from "$lib/components/threejs/globe.svelte";
</script>

<h1>Hello World!</h1>
<button onclick={() => cube.print()}>print</button>
<Cube3D />

<style>

</style>
