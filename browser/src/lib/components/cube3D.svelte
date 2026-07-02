<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";

	const colors = {
		white: new THREE.Color(0xffffff),
		blue: new THREE.Color(0x351fff),
		orange: new THREE.Color(0xff9a1f),
		green: new THREE.Color(0x1fff22),
		red: new THREE.Color(0xff1f22),
		yellow: new THREE.Color(0xffff1f),
	};

	// THREE JS variables
	let container;
	let scene;
	let renderer;
	let camera;
	let controls;
	let cubeGroup;

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
		const far = 10;
		camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
		camera.position.z = 7;

		scene = new THREE.Scene();

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.03;

		initCube();
	}

	function initCube() {
		cubeGroup = new THREE.Group();

		const palette = Object.values(colors);

		const cubeletGeometry = new THREE.BoxGeometry(0.99, 0.99, 0.99);
		const edgesGeometry = new THREE.EdgesGeometry(cubeletGeometry)
  		const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

		for (let s = -1; s <= 1; s++) {
			for (let r = -1; r <= 1; r++) {
				for (let c = -1; c <= 1; c++) {
					const randomColor =
						palette[Math.floor(Math.random() * palette.length)];
					const cubeletMaterial = new THREE.MeshStandardMaterial({
						color: randomColor,
					});
					const cubeletMesh = new THREE.Mesh(
						cubeletGeometry,
						cubeletMaterial,
					);
					const wireMesh = new THREE.LineSegments(
						edgesGeometry,
						lineMaterial,
					)
					cubeletMesh.add(wireMesh);
					cubeGroup.add(cubeletMesh);
					cubeletMesh.position.set(s, r, c);
				}
			}
		}
		scene.add(cubeGroup);
	}

	function onResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}

	onMount(() => {
		initScene();

		const hemiLight = new THREE.HemisphereLight(0xffffff);
		scene.add(hemiLight);

		let frame;
		function animate(t = 0) {
			frame = requestAnimationFrame(animate);
			//cubeGroup.rotation.y = t * 0.0001;
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
