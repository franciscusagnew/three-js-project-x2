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
	
	var axes = new THREE.AxisHelper( 20 );
	scene.add( axes );

	var planeGeometry = new THREE.PlaneGeometry( 60, 20, 1, 1 );
	var planeMaterial = new THREE.MeshBasicMaterial(
		{
			color: '#ccc'
		}
	);
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.name = "plane_1";
	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 15;
	plane.position.y = 0;
	plane.position.z = 0;
	scene.add( plane );
	
	document.body.appendChild( renderer.domElement );

	renderer.render(
		scene,
		camera
	);
}

init();