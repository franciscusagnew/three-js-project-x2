function init() {
	var scene = new THREE.Scene();
	var stats = initStats();

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
	renderer.shadowMap.enabled = true;

	var axes = new THREE.AxesHelper( 20 );
	scene.add( axes );

	var planeGeometry = new THREE.PlaneGeometry( 60, 20, 1, 1 );
	var planeMaterial = new THREE.MeshLambertMaterial(
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
	plane.receiveShadow = true;
	scene.add( plane );

	var cubeGeometry = new THREE.CubeGeometry( 4, 4, 4 );
	var cubeMaterial = new THREE.MeshLambertMaterial(
		{
			color: '#f00',
			wireframe: false
		}
	);
	var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
	cube.name = "cube_1";
	cube.position.x = -4;
	cube.position.y = 3;
	cube.position.z = 0;
	cube.castShadow = true;
	scene.add( cube );

	var sphereGeometry = new THREE.SphereGeometry( 4, 20, 20 );
	var sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: '#7777ff',
			wireframe: false
		}
	);

	var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.name = "sphere_1";
	sphere.position.x = 20;
	sphere.position.y = 4;
	sphere.position.z = 2;
	sphere.castShadow = true;
	scene.add( sphere );

	var spotLight = new THREE.SpotLight( '#fff' );
	spotLight.position.set( -40, 60, -10 );
	spotLight.castShadow = true;
	scene.add( spotLight );

	document.body.appendChild( renderer.domElement );

	renderer.render(
		scene,
		camera
	);

	function initStats() {
  	var stats = new Stats(); 
  	stats.setMode( 0 );
  	stats.domElement.style.position = 'absolute';
  	stats.domElement.style.left = '0px';
  	stats.domElement.style.top = '0px';

  	document.getElementById( "stats" ).appendChild( stats.domElement );
  	
  	return stats
  }
}

init();