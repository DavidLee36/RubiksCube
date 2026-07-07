<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";
	import * as cubeEngine from "$lib/cubeEngine";
	import solvedCube from "../solvedCube.json";
	import * as helpers from "../helpers.js";

	let { busy = $bindable(false) } = $props();

	const colors = {
		W: new THREE.Color(0xffffff),
		B: new THREE.Color(0x2b74ff),
		O: new THREE.Color(0xff9a1f),
		G: new THREE.Color(0x1fff22),
		R: new THREE.Color(0xff1f22),
		Y: new THREE.Color(0xffff1f),
	};

	//This mapping is 3D specific, this mapping does not match cubeEngine
	const faceToIndex = { R: 0, L: 1, U: 2, D: 3, F: 4, B: 5 };

	const meshBySlot = {};

	// --- Layer-turn animation config -------------------------------------
	// Which world axis each face turns around.
	const moveAxis = { U: "y", D: "y", R: "x", L: "x", F: "z", B: "z" };
	// Which slice of that axis the face occupies (+1 or -1).
	const layerCoord = { U: 1, D: -1, R: 1, L: -1, F: 1, B: -1 };
	// Sign of a *clockwise* turn about the positive axis (right-hand rule).
	const cwSign = { U: -1, D: 1, R: -1, L: 1, F: -1, B: 1 };

	let displayCube;

	// THREE JS variables
	let container;
	let scene;
	let renderer;
	let camera;
	let controls;
	let cubeGroup;

	/**
	 * Updates the color of all pieces
	 */
	export function updateColors() {
		for (const slot in displayCube) {
			const mesh = meshBySlot[slot];
			if (!mesh) continue; // skips the core, etc.

			for (const mat of mesh.material) {
				// reset every face to black
				mat.color.set(0x000000);
			}

			const pieceColors = displayCube[slot].colors; // e.g. { U:"Y", R:"R", F:"B" }
			for (const face in pieceColors) {
				const idx = faceToIndex[face];
				mesh.material[idx].color.copy(colors[pieceColors[face]]);
			}
		}
	}

	/**
	 * Visually rotates one face's layer by 90°, then snaps the pieces back to
	 * their home slots. Resolves when the spin finishes.
	 */
	function animateMove(face, clockwise, duration) {
		return new Promise((resolve) => {
			const axis = moveAxis[face];
			// The 9 meshes currently sitting in this face's slice.
			const layer = cubeGroup.children.filter(
				(m) => Math.round(m.position[axis]) === layerCoord[face],
			);
			const targetAngle =
				cwSign[face] * (clockwise ? 1 : -1) * (Math.PI / 2);

			// A temporary pivot at the cube's center. Adding it inside cubeGroup
			// lets the turning layer inherit the cube's overall orientation.
			const pivot = new THREE.Group();
			cubeGroup.add(pivot);
			for (const m of layer) pivot.attach(m); // .attach keeps world position

			const start = performance.now();
			function step(now) {
				const t = Math.min((now - start) / duration, 1); // progress 0 → 1
				// ease-in-out so it accelerates then settles
				const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
				pivot.rotation[axis] = targetAngle * eased;

				if (t < 1) {
					requestAnimationFrame(step);
				} else {
					// Snap every piece home, then throw the pivot away.
					for (const m of layer) {
						cubeGroup.add(m); // reparent out of the pivot
						m.position.copy(m.userData.home);
						m.rotation.set(0, 0, 0);
					}
					cubeGroup.remove(pivot);
					resolve();
				}
			}
			requestAnimationFrame(step);
		});
	}

	export async function animateCube(duration) {
		if (busy) return; // ignore new triggers while a sequence is playing
		busy = true;
		try {
			const moveList = cubeEngine.getMoveList();
			for (const move of moveList) {
				const f = Object.keys(cubeEngine.faces).find(
					(k) => cubeEngine.faces[k] == move.charAt(0),
				);
				const d = move.charAt(1) == "1";

				await animateMove(f, d, duration); // spin the layer (pre-move colors shown)
				cubeEngine.applyMove(displayCube, f, d); // advance the display cube
				updateColors(); // repaint into the post-move colors
			}
		} finally {
			busy = false;
		}
	}

	function initScene() {
		const width = window.innerWidth;
		const height = window.innerHeight;

		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		renderer.setSize(width, height);
		container.appendChild(renderer.domElement);

		const fov = 75;
		const aspectRatio = width / height;
		const near = 0.1;
		const far = 100;
		camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
		camera.position.set(5, 5, 5);

		scene = new THREE.Scene();

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.03;
		controls.update();

		initCube();

		// Uniform ambient fill so every face gets the same base light (no gradient)
		const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
		scene.add(ambientLight);

		// Key light for a bright, dimensional highlight
		const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
		keyLight.position.set(6, 9, 7);
		scene.add(keyLight);

		// Soft fill from the opposite side to lift the shadows
		const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
		fillLight.position.set(-6, -3, -5);
		scene.add(fillLight);
	}

	function initCube() {
		displayCube = structuredClone(solvedCube);
		cubeGroup = new THREE.Group();

		const palette = Object.values(colors);

		const cubeletGeometry = new THREE.BoxGeometry(0.99, 0.99, 0.99);
		const edgesGeometry = new THREE.EdgesGeometry(cubeletGeometry);
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					const materials = [];
					for (let i = 0; i < 6; i++) {
						materials.push(
							new THREE.MeshStandardMaterial({ color: 0x000000 }),
						);
					}
					const cubeletMesh = new THREE.Mesh(
						cubeletGeometry,
						materials,
					);
					const wireMesh = new THREE.LineSegments(
						edgesGeometry,
						lineMaterial,
					);
					cubeletMesh.add(wireMesh);
					cubeGroup.add(cubeletMesh);
					cubeletMesh.position.set(x, y, z);

					let ud = "",
						rl = "",
						fb = "";
					if (y == 1) ud = "U";
					if (y == -1) ud = "D";
					if (x == 1) rl = "R";
					if (x == -1) rl = "L";
					if (z == 1) fb = "F";
					if (z == -1) fb = "B";
					const slotStr = ud + rl + fb;
					meshBySlot[slotStr] = cubeletMesh;
					cubeletMesh.userData.slot = slotStr;
					cubeletMesh.userData.home = new THREE.Vector3(x, y, z);
				}
			}
		}
		scene.add(cubeGroup);
		updateColors();
	}

	function onResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}

	export function resetCube() {
		displayCube = structuredClone(solvedCube);
		updateColors();
	}

	onMount(() => {
		initScene();

		let frame;
		function animate(t = 0) {
			frame = requestAnimationFrame(animate);
			//cubeGroup.rotation.y = t * 0.0001; // rotate
			controls.update();
			renderer.render(scene, camera);
		}
		animate();

		window.addEventListener("resize", onResize);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", onResize);
			renderer.dispose();
		};
	});
</script>

<div class="cube-bg" bind:this={container}></div>

<style>
	.cube-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	.cube-bg :global(canvas) {
		pointer-events: auto;
	}
</style>
