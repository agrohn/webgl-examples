/*******************************************************************************
*  Three.js (r69) hello world example.
*
*  Copyright (c) anssi.grohn@karelia.fi 2013-2015.
*
*******************************************************************************/

// Parameters
var width=800,		// "screen" width
    height=600,		// "screen" height
    viewAngle = 45,	// field of view angle for  camera
    aspect = width/height, 
    near = 0.1,		// distance of near plane from viewer
    far = 1000.0;	// distance of far plane from viewer

var renderer = null;	// renderer object
var scene = null;	// scene object
var camera = null;	// camera object

$(function(){

    // get div element 
    var ctx = $("#main");

    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // define renderer viewport size and clear color
    renderer.setSize(width,height);
    renderer.setClearColor(0x000000, 1.0);

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    
    // add camera to scene and set its position.
    scene.add(camera);
    camera.position.z = 2;    
    camera.position.y = 0.5;
    
    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // create material for triangle (color)
    var material =
	new THREE.MeshBasicMaterial(
	    {
		color: 0xFFFFFF
	    });
    // create new geometry object
    var geom = new THREE.Geometry();

    // store vertices into that object
    var vert = [ new THREE.Vector3(-1,0,0 ), 
		 new THREE.Vector3( 1,0,0 ),
		 new THREE.Vector3( 0,1,0 ) ];
    
    $.each(vert, function(i,v){
	geom.vertices.push(v);
    });
    // make face out of those vertices
    geom.faces.push( new THREE.Face3(0,1,2) );

    // make mesh from geometry and material
    var triangle = new THREE.Mesh( geom, material);

    // add the mesh to the scene
    scene.add(triangle);

    // request frame update and call update-function once it comes
    requestAnimationFrame(update);
    
});

function update(){

    // render everything 
    renderer.render(scene, camera); 
    // request another frame update
    requestAnimationFrame(update);
}
