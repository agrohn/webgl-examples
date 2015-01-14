/*******************************************************************************
*  Rudimentary skybox simulation, utilizing Three.js (r69)
* 
*  Copyright (c) anssi.grohn@karelia.fi 2013-2015.
*
*******************************************************************************/

// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;
var cube  = null;

var mouse = {
    down: false,
    prevY: 0
}

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();

    // add camera to scene and set its position.
    scene.add(camera);
    camera.position.z = 0;

    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // create cube  material
    var materials = [];
    materials.push( new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("negx.jpg"), side: THREE.BackSide}));
    materials.push( new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("posx.jpg"), side: THREE.BackSide}));
    materials.push( new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("posy.jpg"), side: THREE.BackSide}));
    materials.push( new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("negy.jpg"), side: THREE.BackSide}));
    materials.push( new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("negz.jpg"), side: THREE.BackSide}));
    materials.push( new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("posz.jpg"), side: THREE.BackSide}));

    // create a new mesh with cube geometry 
    cube = new THREE.Mesh(
	new THREE.BoxGeometry( 120,120,120, 1,1,1),	
	new THREE.MeshFaceMaterial(materials)
    );
    
    // add the sphere to the scene
    scene.add(cube);

    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    // simple input handling
    document.onmousedown = function(ev){
	mouse.down = true;
	mouse.prevY = ev.pageY;
    }

    document.onmouseup = function(ev){
	mouse.down = false;
    }

    document.onmousemove = function(ev){
	if ( mouse.down ){
	    var rot = (ev.pageY - mouse.prevY) * 0.01;
	    camera.rotation.x -= rot;
	    mouse.prevY = ev.pageY;
	}
    }
});

function update(){

    // render everything 
    renderer.render(scene, camera);

    // rotate cube 
    cube.rotation.y += 0.01;
    // request another frame update
    requestAnimationFrame(update);
}
