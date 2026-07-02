<script>
	import { Cube } from "$lib/cube";
	import Cube3D from "$lib/components/cube3D.svelte";
	import Globe from "$lib/components/threejs/globe.svelte";

	let cube = new Cube();
	console.log(cube.toString())
</script>

<h1>Hello World!</h1>
<Cube3D />

<style>

</style>
