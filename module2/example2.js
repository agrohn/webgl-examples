/*******************************************************************************
*  WebGL hello world example, utilizing Three.js matrix type
* 
*  Copyright (c) anssi.grohn@karelia.fi 2013.
*
*******************************************************************************/

// Create our test app "class"

var WebGLApp = function(){

    var that = this;        // to access object itself
    this.canvas = null;     // canvas where gl context will be set
    this.gl = null;         // our WebGL context 
    this.vertices = null;   // vertex data buffer  (WebGL-specific)
    this.indices = null;    // index data buffer (WebGL-specific)

    this.projMat = new THREE.Matrix4();           // projection matrix, using Three.js matrix type
    this.modelViewMat = new THREE.Matrix4();      // modelview matrix, using Three.js matrix type

    this.shaderProgram = null;                    // shader program (WebGL-specific)
    this.mode = "TRIANGLES";
    this.setMode = function( mode ){
	that.mode = mode;
    }
    /* ---------- Initialization routine ---------- */
    this.Prepare = function(canvas) {

	// get DOM element from jQuery object
	that.canvas = canvas[0]

	that.InitGL();
	that.InitData();
	that.InitShaders();
	
	// define screen clear color.
	that.gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// enable depth test.
	that.gl.enable(that.gl.DEPTH_TEST);

	// Draw everything.
	that.Render();
	
	console.log('Drawing complete');
	
    }

    /* ---------- WebGL context init  ---------- */
    this.InitGL = function()
    {
	
	try {
	    // get webgl context
	    that.gl = that.canvas.getContext("experimental-webgl");
	    that.gl.viewportWidth = that.canvas.width;
	    that.gl.viewportHeight = that.canvas.height;
	    that.mode = that.gl.TRIANGLE_LIST;
	} catch(e) {
	    console.log(e);
	}

	if (!that.gl) {
	    console.log("Could not initialise WebGL, sorry :-(");
	} else {
	    console.log("WebGL initialized ok!");

	}
    }
    /* ---------- Vertex Data Init  ---------- */
    this.InitData = function()
    {
	// create buffer for vertices (WebGL-specific buffer)
	that.vertices = that.gl.createBuffer();
	// bind that buffer (activate)
	that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertices);

	// define vertex data
	var verts = [
            -1.0, -1.0, 0.0,   // bottom-left coordinate.
	    1.0, -1.0, 0.0,    // bottom-right coordinate.
	    0.0,  1.0, 0.0,    // top coordinate.

  	    1.0, -1.0, 0.0,    // bottom-left coordinate.
	    2.0, -1.0, 0.0,    // bottom-right coordinate.
	    1.5,  0.125, 0.0   // top coordinate.
	];

	// copy data from verts-array into buffer
	that.gl.bufferData( that.gl.ARRAY_BUFFER,    // array 
			    new Float32Array(verts), // floats
			    that.gl.STATIC_DRAW );   // STATIC_DRAW = hint that data does not change
	
	// add few helpful parameters
	that.vertices.itemSize = 3;  // how many floats does a single vertex element need
	that.vertices.numItems = 6;  // how many vertex elements exist in the buffer

	////////////////////////////////////////////////////////////
	// Create element array buffer where we can store indices.
	that.indices = that.gl.createBuffer();
	that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indices);
	
	var indices = [
	    0,1,2,3,4,5
	];

	// copy data into buffer
	that.gl.bufferData( that.gl.ELEMENT_ARRAY_BUFFER, 
			    new Uint8Array(indices),
			    that.gl.STATIC_DRAW);
	// define sizes
	that.indices.itemSize = that.gl.UNSIGNED_BYTE; // size of each index value - currently between 0-255,so they fit in BYTE
	that.indices.numItems = indices.length;        // number of elements in index array.
	
	console.log('Data initialized.');
    }

    /* ---------- Shader Data Init  ---------- */
    this.InitShaders = function() {

	// compile vertex and fragment shaders
	var vs = that.compileShader("shader-vs");
	var fs = that.compileShader("shader-fs");

	// Create actual shader program
	that.shaderProgram = that.gl.createProgram();

	// Attach shaders into shader program
	that.gl.attachShader(that.shaderProgram, vs);
	that.gl.attachShader(that.shaderProgram, fs);

	// link shader program
	that.gl.linkProgram(that.shaderProgram);

	// check if the shader program was successfully linked
	var ok = that.gl.getProgramParameter( that.shaderProgram, that.gl.LINK_STATUS);
	if ( !ok ){
	    console.log('Could not link shaders:' + 
			that.gl.getProgramInfoLog( that.shaderProgram));
	}

	// enable program
	that.gl.useProgram( that.shaderProgram );

	// access attribute location in program
	that.shaderProgram.vertexPositionAttribute = that.gl.getAttribLocation(that.shaderProgram, "aVertPos");


	
	// access uniform parameters (matrices)
	that.shaderProgram.projection = that.gl.getUniformLocation(that.shaderProgram, "uProjection");
	that.shaderProgram.modelView  = that.gl.getUniformLocation(that.shaderProgram, "uModelView");

    }

    /* ---------- Actual rendering  ---------- */
    this.Render = function()
    {
	// viewport to fill entire canvas area
	that.gl.viewport(0,0, that.gl.viewportWidth, that.gl.viewportHeight);

	// clear screen.
	that.gl.clear(that.gl.COLOR_BUFFER_BIT | that.gl.DEPTH_BUFFER_BIT);

	// set camera 
	var viewRatio = that.gl.viewportWidth / that.gl.viewportHeight;
	that.projMat.makeOrthographic( -7.0, 7.0, 7.0, -7.0, -0.1, 2.0);
	that.modelViewMat.identity();

	that.gl.useProgram( that.shaderProgram );
	// bind buffer for next operation
	that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertices);

	// bind buffer data to shader attribute
	that.gl.vertexAttribPointer( that.shaderProgram.vertexPositionAttribute,
				     that.vertices.itemSize, 
				     that.gl.FLOAT, false, 0, 0);

	// enable vertex attrib array so data gets transferred
	that.gl.enableVertexAttribArray(that.shaderProgram.vertexPositionAttribute);

	// update uniforms in shader program
	that.gl.uniformMatrix4fv( that.shaderProgram.projection, false, that.projMat.flattenToArray([]));
	that.gl.uniformMatrix4fv( that.shaderProgram.modelView,  false, that.modelViewMat.flattenToArray([]));

	// tell opengl that we use this index buffer now.
	that.gl.bindBuffer( that.gl.ELEMENT_ARRAY_BUFFER, that.indices);
	
	
	// draw stuff on screen from vertices, using triangles and specified index buffer
	that.gl.drawElements(that.gl[that.mode], that.indices.numItems, that.indices.itemSize, 0);
    }

    /* ---------- Utility function, allows to compile shaders   ---------- */
    this.compileShader = function( id )
    {
	// access script element according to id (using jQuery)
	var script = $("#"+id);
	// access text source 
	var src = script.text();
	var shader = null;
	
	// determine shader type and create appropriate shader 
	if (script[0].type == "x-shader/x-vertex" )
	{
	    shader = that.gl.createShader(that.gl.VERTEX_SHADER);
	} 
	else if ( script[0].type == "x-shader/x-fragment" ) 
	{
	    shader = that.gl.createShader(that.gl.FRAGMENT_SHADER);
	}
	else 
	{
	    console.log('Unknown shader type:', script[0].type);
	    return null;
	}
	// set shader source (text)
	that.gl.shaderSource( shader, src);

	// compile shader source
	that.gl.compileShader(shader);

	// check if the compilation went ok, otherwise
	var ok = that.gl.getShaderParameter(shader, that.gl.COMPILE_STATUS);
	
	if ( !ok ) {
	    console.log('shader failed to compile: ', that.gl.getShaderInfoLog(shader));
	    return null;
	}
	
	return shader;
    }

}
// Create test application instance
var app = new WebGLApp();
