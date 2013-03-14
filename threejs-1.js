// Parameters
var width = 400,
    height = 300
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

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
    camera.position.z = 300;

    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // create cube  material
    var material =
	new THREE.MeshBasicMaterial(
	    {
		color: 0x00FF00
	    });

    
    // create a new mesh with cube geometry 
    var sphere = new THREE.Mesh(
	new THREE.CubeGeometry( 120,120,120),	
	material
    );
    
    // add the sphere to the scene
    scene.add(sphere);

    // request frame update and call update-function once it comes
    requestAnimationFrame(update);
    
});

function update(){
    // render everything 
    renderer.render(scene, camera); 
    // request another frame update
    requestAnimationFrame(update);
}