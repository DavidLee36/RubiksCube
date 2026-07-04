<script>
	import * as cube from "$lib/cube";
	import Cube3D from "$lib/components/cube3D.svelte";
	import Globe from "$lib/components/threejs/globe.svelte";

	function moveClick() {
		cube.fullMoveCycle();
	}
</script>

<h1>Hello World!</h1>
<button onclick={() => cube.print()}>print</button>
<button onclick={moveClick}>move</button>
<Cube3D />

<style>

</style>
