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
    earthMaterial.normalScale = new THREE.Vector2(0.5, 0.7);

    return earthMaterial;
}

function createOverlayMaterial() {
    var overlay = new THREE.MeshPhongMaterial();
    overlay.map = new THREE.Texture(addcanvas());
    overlay.map.needsUpdate = true;
    overlay.transparent = true;
    overlay.opacity = 0.6;

    return overlay;
}

function addCanvas() {
    canvas = document.createElement("canvas");
    canvas.width = 4096;
    canvas.height = 2048;
    var context = canvas.getContext('2d');
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var ports = CSVToArray(xmlhttp.responseText, ";");
            // console.log(ports[0]);
            // 4 and 5 combined are x together with 6 for sign
            ports.forEach(function(e) {
                if (e[25] === 'L') {
                    var posY = parseFloat(e[4] + "." + e[5]);
                    var sign = e[6];
                    if (sign === 'S') posY = posY * -1;
                    var posX = parseFloat(e[7] + "." + e[8]);
                    var sign = e[9];
                    if (sign === 'W') posX = posX * -1;
                    var x2 = ((4096 / 360.0) * (180 + posX));
                    var y2 = ((2048 / 180.0) * (90 - posY));
                    context.beginPath();
                    context.arc(x2, y2, 4, 0, 2 * Math.PI, false);
                    context.fillStyle = 'red';
                    context.fill();
                    context.fill();
                    context.lineWidth = 2;
                    context.strokeStyle = '#003300';
                    context.stroke();
                }
            });
            // 7 and 8 combined are y together with 9 for sign
        }
    }
    xmlhttp.open("GET", "data/wpi.csv", true);
    xmlhttp.send();
    //get the data, and set the offset, we need to do this since the x,y coordinates
    //from the data aren't in the correct format
    // var x = 4.29;
    // var y = 51.54;
    // document.body.appendChild(canvas);
    return canvas;
}


function createCloudMaterial() {
    // 4096 is the max width for maps
    var cloudTexture = new THREE.TextureLoader().load("img/textures/planets/fair_clouds_4k.png");
    var cloudMaterial = new THREE.MeshPhongMaterial();
    cloudMaterial.map = cloudTexture;
    cloudMaterial.transparent = true;

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

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
// via http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [
        []
    ];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
        ) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}