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

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.03;

		// shared by both the solid mesh and the wireframe overlay
		const geo = new THREE.IcosahedronGeometry(1.0, 2);
		const mat = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			flatShading: true
		});
		const mesh = new THREE.Mesh(geo, mat);
		scene.add(mesh);

		const wireMat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			wireframe: true
		});
		const wireMesh = new THREE.Mesh(geo, wireMat);
		wireMesh.scale.setScalar(1.001);
		mesh.add(wireMesh);

		const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
		scene.add(hemiLight);

		let frame;
		function animate(t = 0) {
			frame = requestAnimationFrame(animate);
			mesh.rotation.y = t * 0.0001;
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
			// window.removeEventListener('resize', onResize);
			// controls.dispose();
			// geo.dispose();
			// mat.dispose();
			// wireMat.dispose();
			// renderer.dispose();
			// renderer.domElement.remove();
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
