<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

	let container;

	onMount(() => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(width, height);
		container.appendChild(renderer.domElement);

		const fov = 75;
		const aspectRatio = width / height;
		const near = 0.1;
		const far = 10;
		const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
		camera.position.z = 2;

		const scene = new THREE.Scene();

		const loader = new THREE.TextureLoader();

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.03;

		const earthGroup = new THREE.Group();
		earthGroup.rotation.z = -23.4 * Math.PI / 180;
		scene.add(earthGroup);

		const geo = new THREE.IcosahedronGeometry(1, 12);
		const mat = new THREE.MeshStandardMaterial({
			map: loader.load("/textures/earth-daymap-4k.jpg"),
		});
		const earthMesh = new THREE.Mesh(geo, mat);
		earthGroup.add(earthMesh);

		const lightsMat = new THREE.MeshStandardMaterial({
			map: loader.load("/textures/earth-nightmap-4k.jpg"),
			blending: THREE.AdditiveBlending
		})
		const lightsMesh = new THREE.Mesh(geo, lightsMat);
		earthGroup.add(lightsMesh)

		const sunLight = new THREE.DirectionalLight(0xffffff);
		sunLight.position.set(2, 0.5, 1.5);
		scene.add(sunLight);

		let frame;
		function animate(t = 0) {
			frame = requestAnimationFrame(animate);
			earthGroup.rotation.y = t * 0.0001;
			controls.update();
			renderer.render(scene, camera);
		}
		animate();

		function onResize() {
			const w = window.innerWidth;
			const h = window.innerHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		}
		window.addEventListener('resize', onResize);

		return () => {
			cancelAnimationFrame(frame);
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
