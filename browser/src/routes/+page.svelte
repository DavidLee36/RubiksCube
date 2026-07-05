<script>
	import * as cubeEngine from "$lib/cubeEngine";
	import Cube3D from "$lib/components/cube3D.svelte";

	let cube3d;
	let busy = $state(false); // true while the 3D is animating; disables buttons
	let duration = $state(250); // rotation animation speed in ms
	let scrambleMin = $state(15); // fewest scramble turns
	let scrambleMax = $state(30); // most scramble turns

	// Per-face turn buttons. Colors are just a nice palette, not the cube's.
	const moveFaces = ["U", "D", "L", "R", "F", "B"];
	const faceColors = {
		U: "#f2c94c", // yellow
		D: "#e8eaed", // white
		L: "#f2994a", // orange
		R: "#eb5757", // red
		F: "#5b8def", // blue
		B: "#27ae60", // green
	};

	function moveClick(face, dir) {
		cubeEngine.clearMoveList();
		cubeEngine.move(face, dir);
		cube3d.animateCube(duration);
	}

	function cycleClick() {
		cubeEngine.clearMoveList();
		cubeEngine.fullMoveCycle();
		cube3d.animateCube(duration);
	}

	function scrambleClick() {
		cubeEngine.clearMoveList();
		cubeEngine.scramble(scrambleMin, scrambleMax);
		cubeEngine.print();
		cube3d.animateCube(duration);
	}

	function solveClick() {
		cubeEngine.clearMoveList();
		cubeEngine.solve();
		cube3d.animateCube(duration);
	}

	function resetClick() {
		cubeEngine.reset();
		cube3d.resetCube();
	}
</script>

<Cube3D bind:this={cube3d} bind:busy />

<main class="panel">
	<header class="titles">
		<h1>Rubik's Cube</h1>
		<p class="subtitle">Layer-by-layer solver</p>
	</header>

	<section>
		<h2>Settings</h2>
		<div class="settings-body">
			<label class="setting">
				<span class="setting-label">Turn duration (ms)</span>
				<input
					class="setting-input"
					type="number"
					min="50"
					step="10"
					bind:value={duration}
				/>
			</label>

			<div class="setting-row">
				<label class="setting">
					<span class="setting-label">Scramble min</span>
					<input
						class="setting-input"
						type="number"
						min="1"
						step="1"
						bind:value={scrambleMin}
					/>
				</label>
				<label class="setting">
					<span class="setting-label">Scramble max</span>
					<input
						class="setting-input"
						type="number"
						min="1"
						step="1"
						bind:value={scrambleMax}
					/>
				</label>
			</div>
		</div>
	</section>

	<section>
		<h2>Moves</h2>
		<div class="moves">
			{#each moveFaces as face}
				<div class="move-row" style="--c: {faceColors[face]};">
					<button class="face cw" disabled={busy} onclick={() => moveClick(face, true)}>
						{face}
					</button>
					<button class="face ccw" disabled={busy} onclick={() => moveClick(face, false)}>
						{face}′
					</button>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2>Actions</h2>
		<div class="actions">
			<button class="action scramble" disabled={busy} onclick={scrambleClick}>Scramble</button>
			<button class="action solve" disabled={busy} onclick={solveClick}>Solve</button>
			<button class="action cycle" disabled={busy} onclick={cycleClick}>Cycle</button>
			<button class="action reset" disabled={busy} onclick={resetClick}>Reset</button>
			<button class="action ghost" disabled={busy} onclick={() => cubeEngine.print()}>Print</button>
		</div>
	</section>
</main>

<style>
	.panel {
		position: fixed;
		top: 1.5rem;
		left: 1.5rem;
		width: 15rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		border-radius: 1rem;
		background: rgba(18, 20, 26, 0.72);
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(12px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		color: #e6e8ee;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.titles h1 {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.subtitle {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		color: #9aa0ad;
	}

	h2 {
		margin: 0 0 0.6rem;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #8b91a0;
	}

	button {
		cursor: pointer;
		border: none;
		border-radius: 0.55rem;
		font-weight: 600;
		transition: transform 0.06s ease, filter 0.15s ease, background 0.15s ease;
	}

	button:hover {
		filter: brightness(1.1);
	}

	button:active {
		transform: translateY(1px);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
		filter: none;
		transform: none;
	}

	.settings-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.setting-row {
		display: flex;
		gap: 0.5rem;
	}

	.setting {
		flex: 1;
		min-width: 0; /* let inputs shrink instead of overflowing the panel */
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.setting-label {
		font-size: 0.8rem;
		color: #c7ccd6;
	}

	.setting-input {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		padding: 0.5rem 0.6rem;
		border-radius: 0.55rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e6e8ee;
		font: inherit;
		font-size: 0.85rem;
		color-scheme: dark; /* native number spinner matches dark theme */
		transition: border-color 0.15s ease;
	}

	.setting-input:focus {
		outline: none;
		border-color: #5b8def;
	}

	/* Moves: solid = clockwise, outlined = counter-clockwise */
	.moves {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.move-row {
		display: flex;
		gap: 0.5rem;
	}

	.face {
		flex: 1;
		padding: 0.5rem 0;
		font-size: 1rem;
	}

	.face.cw {
		background: var(--c);
		color: #16181d;
	}

	.face.ccw {
		background: transparent;
		border: 1.5px solid var(--c);
		color: var(--c);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.action {
		padding: 0.6rem 0.75rem;
		font-size: 0.85rem;
		color: #fff;
	}

	.action.scramble { background: #e08a2b; }
	.action.solve    { background: #24a148; }
	.action.cycle    { background: #3a6df0; }
	.action.reset    { background: #d83a4a; }

	.action.ghost {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #c7ccd6;
	}
</style>
