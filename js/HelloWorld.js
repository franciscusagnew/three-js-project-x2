// global variables
var renderer;
var scene;
var camera;
var control;
var stats;
var cameraControl;
var container;

// background elements
var cameraBG;
var sceneBG;
var composer;
var clock;


function init() {
    var width = window.innerWidth || 2;
    var height = window.innerHeight || 2;

    container = document.createElement('div');
    document.body.appendChild(container);
    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.fontSize = '1.5em';
    info.style.color = '#fff';
    info.innerHTML = 'Drag to change the view';
    container.appendChild(info);

    // create a scene, that will hold all 
    // our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    clock = new THREE.Clock();

    // Three.js Perspective Camera
    camera = new THREE.PerspectiveCamera(
        45, // field of view
        width / height, // aspect ratio
        0.1, // near clipping plane
        1000 // far clipping plane
    );

    // Name and position the camera to the center of the scene
    camera.name = 'camera-1';
    camera.position.x = 25;
    camera.position.y = 26;
    camera.position.z = 23;
    camera.lookAt(scene.position);

    // Camera Controls
    cameraControl = new THREE.OrbitControls(camera);

    // WEbGL Rendering - sets the background color and the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor('#000', 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Create a sphere for the earth
    var sphereGeometry = new THREE.SphereGeometry(15, 60, 60);
    var sphereMaterial = createEarthMaterial();
    var earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMesh.name = 'earth';
    scene.add(earthMesh);

    // Create a sphere for the clouds
    var cloudGeometry = new THREE.SphereGeometry(15.25, 60, 60);
    var cloudMaterial = createCloudMaterial();
    var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.name = 'clouds';
    scene.add(cloudMesh);

    // Add an ambient light source
    var ambientLight = new THREE.AmbientLight('#111111');
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    // Add a directional light source
    var directLight = new THREE.DirectionalLight('#fff', 1);
    directLight.position = new THREE.Vector3(100, 10, -50);
    directLight.name = 'direct';
    scene.add(directLight);

    // setup the control object for the control gui
    control = new function() {
        this.rotationSpeed = 0.001;
        this.ambientLightColor = ambientLight.color.getHex();
        this.directLightColor = directLight.color.getHex();
    };

    addControlGui(control);
    addStats();

    // Add background using a camera
    cameraBG = new THREE.OrthographicCamera(-window.innerWidth, window.innerWidth,
        window.innerHeight, -window.innerHeight, -10000, 10000);
    cameraBG.position.z = 50;
    sceneBG = new THREE.Scene();

    var loader = new THREE.TextureLoader();
    var materialColor = new THREE.MeshBasicMaterial({
        map: loader.load("img/textures/planets/starry_bkg.jpg"),
        depthTest: false
    });
    var bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materialColor);
    bgPlane.position.z = -100;
    bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
    sceneBG.add(bgPlane);

    // Setup the composer
    // First render the background
    var bgPass = new THREE.RenderPass(sceneBG, cameraBG);
    // Next render the scene (Rotating Earth)
    var renderPass = new THREE.RenderPass(scene, camera);
    renderPass.clear = false;
    // Finally add the result to the screen
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;

    // Add the passes to the composer
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(bgPass);
    composer.addPass(renderPass);
    composer.addPass(effectCopy);

    // add the output of the WEBgl renderer to the HTML element
    document.body.appendChild(renderer.domElement);

    render();
}

function createEarthMaterial() {
    // 4096 is the max width for maps
    var earthTexture = new THREE.TextureLoader().load("img/textures/planets/earthmap4k.jpg");
    var bumpMap = new THREE.TextureLoader().load("img/textures/planets/earthbump4k.jpg");
    var specularMap = new THREE.TextureLoader().load("img/textures/planets/earthspec4k.jpg");
    var normalMap = new THREE.TextureLoader().load("img/textures/planets/earth_normalmap_flat4k.jpg");
    var earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = earthTexture;

    // Add the specular reflection to the surface
    earthMaterial.specularMap = specularMap;
    earthMaterial.specular = new THREE.Color('#262626');

    // Add the normal properties
    earthMaterial.normalMap = normalMap;
    earthMaterial.normalScale = new THREE.Vector2(-0.5, -0.7);

    return earthMaterial;
}

function createCloudMaterial() {
    // 4096 is the max width for maps
    var cloudTexture = new THREE.TextureLoader().load("img/textures/planets/fair_clouds_4k.png");
    var cloudMaterial = new THREE.MeshPhongMaterial();
    cloudMaterial.map = cloudTexture;
    cloudMaterial.transparent = true;
    cloudMaterial.opacity = 0.5;
    cloudMaterial.blending = THREE.AdditiveBlending;

    return cloudMaterial;
}

function addControlGui(controlObject) {
    var gui = new dat.GUI();
    gui.add(controlObject, 'rotationSpeed', -0.01, 0.01);
    gui.addColor(controlObject, 'ambientLightColor');
    gui.addColor(controlObject, 'directLightColor');
}

function addStats() {
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById("app").appendChild(stats.domElement);
}

function render() {
    // Update stats
    stats.update();

    // Update the camera
    cameraControl.update();

    // rotate the globe around its y axis
    scene.getObjectByName('earth').rotation.y += control.rotationSpeed;
    scene.getObjectByName('clouds').rotation.y += control.rotationSpeed * 1.1;

    // Update light colors
    scene.getObjectByName('ambient').color = new THREE.Color(control.ambientLightColor);
    scene.getObjectByName('direct').color = new THREE.Color(control.directLightColor);

    renderer.autoClear = false;
    composer.render();

    // render using requestAnimationFrame
    requestAnimationFrame(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();

window.addEventListener('resize', onWindowResize, false);