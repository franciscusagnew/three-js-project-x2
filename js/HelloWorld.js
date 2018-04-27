function init() {
	var scene = new THREE.Scene();
	var stats = initStats();
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.fontSize = '1.5em';
	info.style.color = '#fff';
	info.innerHTML = 'Drag to change the view';
	container.appendChild( info );

	// Three.js Perspective Camera


	var camera = new THREE.PerspectiveCamera(
		45, // field of view
		width / height, // aspect ratio
		0.1, // near clipping plane
		1000  // far clipping plane
	);

	camera.name = 'camera-1';
	camera.position.x = 35;
	camera.position.y = 36;
	camera.position.z = 33;
	camera.lookAt(scene.position);

	// Camera Controls
	cameraControl = new THREE.OrbitControls( camera );

	// WEbGL Rendering
	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor('#000', 1.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;

	var sphereGeometry = new THREE.SphereGeometry( 15, 30, 30 );
	var sphereMaterial = new THREE.MeshNormalMaterial();
	
	var earthMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	earthMesh.name = "earth";
	scene.add( earthMesh );

	/**
	var spotLight = new THREE.SpotLight( '#fff' );
	spotLight.position.set( -40, 60, -10 );
	spotLight.castShadow = true;
	scene.add( spotLight );
  **/
	// WEBgl Renderer
	document.body.appendChild( renderer.domElement );

  var controls = new function() {
  	this.rotationSpeed = 0.02;
  	this.bouncingSpeed = 0.03;
  };

  /**
  var gui = new dat.GUI();
  gui.add(controls, 'rotationSpeed', 0, 0.5);
  gui.add(controls, 'bouncingSpeed', 0, 0.5);
	**/

  window.addEventListener( 'resize', onWindowResize, false );

	update();

	function createEarthMaterial() {
		// 4096 is the max width for maps
		var earthTexture = new THREE.ImageUtils.loadTexture("img/textures/planets/earthmap4k.jpg");

		var earthMaterial = new THREE.MeshBasicMaterial();
		earthMaterial.map = earthTexture;

		return earthMaterial;
	}

	function update() {
		stats.update();

		// rotate the cube around its axes
		earthMesh.rotation.x += controls.rotationSpeed;
		earthMesh.rotation.y += controls.rotationSpeed;
		earthMesh.rotation.z += controls.rotationSpeed;

		cameraControl.update();

		// render using requestAnimationFrame
		requestAnimationFrame( update );

		// WEBGL Renderer
		renderer.render(
			scene,
			camera
		);
	}

	function initStats() {
  	var stats = new Stats(); 
  	stats.setMode( 0 );
  	stats.domElement.style.position = 'absolute';
  	stats.domElement.style.left = '0px';
  	stats.domElement.style.top = '0px';

  	document.getElementById( "app" ).appendChild( stats.domElement );
  	
  	return stats;
  }

  function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

init();