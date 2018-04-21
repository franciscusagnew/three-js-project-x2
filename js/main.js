function init() {
	var scene = new THREE.Scene();

	// Three.js Perspective Camera
	var camera = new THREE.PerspectiveCamera(
		45, // field of view
		window.innerWidth / window.innerHeight, // aspect ratio
		0.1, // near clipping plane
		1000  // far clipping plane
	);

	camera.name = 'camera-1';
	camera.position.x = -30;
	camera.position.y = 40;
	camera.position.z = 30;
	camera.lookAt(scene.position);

	// WEbGL Rendering
	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor('#000', 1.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	document.body.appendChild( renderer.domElement );

	renderer.render(
		scene,
		camera
	);
}

init();