<script>
	import * as cube from "$lib/cube";
	import Cube3D from "$lib/components/cube3D.svelte";
	import Globe from "$lib/components/threejs/globe.svelte";

	function cycleClick() {
		cube.fullMoveCycle();
	}

	function scrambleClick() {
		cube.scramble();
		cube.print();
	}

	function resetClick() {
		cube.reset();
	}
</script>

<h1>Hello World!</h1>
<button onclick={() => cube.print()}>print</button>
<button onclick={cycleClick}>cycle</button>
<button onclick={scrambleClick}>scramble</button>
<button onclick={resetClick}>reset</button>
<Cube3D />

<style>

</style>
