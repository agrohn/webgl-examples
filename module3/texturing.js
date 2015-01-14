/*******************************************************************************
*  WebGL hello world example, utilizing Three.js (r69) matrix type
* 
*  Copyright (c) anssi.grohn@karelia.fi 2013-2015.
*
*******************************************************************************/

// our global WebGL context 
var gl = null;
// Helper object
var Util = {}
Util.handleTexture = function(tex){

    // make sure we are handling proper texture object
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // flip image aound
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/* ---------- Utility function, allows to compile shaders   ---------- */
Util.compileShader = function( id )
{
    // access script element according to id (using jQuery)
    var script = $("#"+id);
    // access text source 
    var src = script.text();
    var shader = null;
    
    // determine shader type and create appropriate shader 
    if (script[0].type == "x-shader/x-vertex" )
    {
	shader = gl.createShader(gl.VERTEX_SHADER);
    } 
    else if ( script[0].type == "x-shader/x-fragment" ) 
    {
	shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else 
    {
	console.log('Unknown shader type:', script[0].type);
	return null;
    }
    // set shader source (text)
    gl.shaderSource( shader, src);
    
    // compile shader source
    gl.compileShader(shader);
    
    // check if the compilation went ok, otherwise
    var ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	
    if ( !ok ) {
	console.log('shader failed to compile: ', gl.getShaderInfoLog(shader));
	    return null;
    }
    
    return shader;
}
/* ---------- WebGL context init  ---------- */
Util.InitGL = function(canvas)
{
    
    try {
	// get webgl context
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	
    } catch(e) {
	console.log(e);
    }
    
    if (!gl) {
	console.log("Could not initialise WebGL, sorry :-(");
    } else {
	console.log("WebGL initialized ok!");
    }
}
/* ---  Creates shader program from two given element IDs --- */
Util.createShaderProgramFrom = function( vs_id, fs_id ) {
    
    // compile vertex and fragment shaders
    var vs = Util.compileShader(vs_id);
    var fs = Util.compileShader(fs_id);

    // Create actual shader program
    var program  = gl.createProgram();
    
    // Attach shaders into shader program
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    
    // link shader program
    gl.linkProgram(program);
    
    // check if the shader program was successfully linked
    var ok = gl.getProgramParameter( program, gl.LINK_STATUS);
    if ( !ok ){
	console.log('Could not link shaders:' + 
		    gl.getProgramInfoLog( program));
    }
    program.attrib = {}
    program.uniform = {}

    return program;
}

// Create our test app "class"
var WebGLApp = function(){

    var that = this;        // to access object itself
    this.canvas = null;     // canvas where gl context will be set


    this.vertices = null;   // vertex data buffer  (WebGL-specific)
    this.texcoords = null;  // texture coordinate buffer.
    this.indices = null;    // index data buffer (WebGL-specific)
    this.mode = "polygon";
    this.projMat = new THREE.Matrix4();           // projection matrix, using Three.js matrix type
    this.modelViewMat = new THREE.Matrix4();      // modelview matrix, using Three.js matrix type

    this.shaderProgram = null;                    // shader program (WebGL-specific)
    this.stoneTexture = null;
    /* ---------- Initialization routine ---------- */
    this.Prepare = function(canvas) {

	// get DOM element from jQuery object
	that.canvas = canvas[0]

	Util.InitGL(that.canvas);

	that.InitData();
	that.InitTextures();
	that.InitShaders();
	
	// define screen clear color.
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// enable depth test.
	gl.enable(gl.DEPTH_TEST);

	// Draw everything.
	that.Render();
	
	console.log('Drawing complete');
	
    }
    this.setMode = function( mode )
    {
	that.mode = mode;
    }
    this.InitTextures = function()
    {
	that.stoneTexture  = gl.createTexture();
	that.stoneTexture.image = new Image();
	that.stoneTexture.image.onload = function(){ 
	    Util.handleTexture(that.stoneTexture);
	    // Invoke rendering
	    app.Render();
	}
	that.stoneTexture.image.src = "stone.png";
    }
   
    /* ---------- Vertex Data Init  ---------- */
    this.InitData = function()
    {
	// create buffer for vertices (WebGL-specific buffer)
	that.vertices = gl.createBuffer();
	// bind that buffer (activate)
	gl.bindBuffer(gl.ARRAY_BUFFER, that.vertices);

	// define vertex data
	var vertices = [
	    0.0, 0.0, 0.0,
	    1.0, 0.0, 0.0,
	    1.0, 1.0, 0.0,
	    0.0, 1.0, 0.0
	]
	
	var texCoords = [
	    0.0, 0.0,
	    1.0, 0.0,
	    1.0, 1.0,
	    0.0, 1.0
	]

	var indices = [ 
	    0,1,2,3 
	]

	// copy data from verts-array into buffer
	gl.bufferData( gl.ARRAY_BUFFER,    // array 
		       new Float32Array(vertices), // floats
		       gl.STATIC_DRAW );   // STATIC_DRAW = hint that data does not change
	
	// add few helpful parameters
	that.vertices.itemSize = 3;  // how many floats does a single vertex element need
	that.vertices.numItems = 4;  // how many vertex elements exist in the buffer
	
	that.indices = gl.createBuffer();
	that.indices.numItems = 4;
	that.indices.itemSize = gl.UNSIGNED_BYTE;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, that.indices);
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

	that.texcoords = gl.createBuffer();
	that.texcoords.numItems = 4;
	that.texcoords.itemSize = 2;
	gl.bindBuffer( gl.ARRAY_BUFFER, that.texcoords);
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

	console.log('Data initialized.');
    }

    
    /* ---------- Shader Data Init  ---------- */
    this.InitShaders = function() {

	var shader = Util.createShaderProgramFrom("shader-vs", "shader-fs");
	gl.useProgram(shader);
	// Create shader program for triangles and lines
	shader.attrib.pos         = gl.getAttribLocation(shader, "aPosition");
	shader.attrib.texcoord    = gl.getAttribLocation(shader, "aTexCoord");
	shader.uniform.map        = gl.getUniformLocation(shader, "map");
	shader.uniform.projection = gl.getUniformLocation(shader, "uProjection");
	shader.uniform.modelView  = gl.getUniformLocation(shader, "uModelView");
	that.shader = shader;
	shader = [];
	// Create shader program for point sprites
	shader = Util.createShaderProgramFrom("shader-vs-pointsprite", "shader-fs-pointsprite");
	gl.useProgram(shader);
	// this shader won't use texcoords
	shader.attrib.pos         = gl.getAttribLocation(shader, "aPosition");
	shader.uniform.map        = gl.getUniformLocation(shader, "map");
	shader.uniform.projection = gl.getUniformLocation(shader, "uProjection");
	shader.uniform.modelView  = gl.getUniformLocation(shader, "uModelView");
	shader.uniform.pointsize  = gl.getUniformLocation(shader, "pointsize");
	that.shaderPointSprites = shader;
    }

    /* ---------- Actual rendering  ---------- */
    this.Render = function()
    {
	// viewport to fill entire canvas area
	gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);

	// clear screen.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// set camera 
	var viewRatio = gl.viewportWidth / gl.viewportHeight;
	that.projMat.makeOrthographic( -0.4*viewRatio, 1.4*viewRatio, 1.4, -0.4, -0.1, 2.0);
	that.modelViewMat.identity();

	var prog;
	if ( that.mode == "point_sprite" )  prog = that.shaderPointSprites;
	else				    prog = that.shader;

	gl.useProgram( prog );
	// bind buffer for next operation
	gl.bindBuffer(gl.ARRAY_BUFFER, that.vertices);

	// bind buffer data to shader attribute
	gl.vertexAttribPointer( prog.attrib.pos,
				that.vertices.itemSize, 
				gl.FLOAT, false, 0, 0);

	// enable vertex attrib array so data gets transferred
	gl.enableVertexAttribArray(prog.attrib.pos);


	
	if ( that.mode != "point_sprite" ) 
	{
	    // bind buffer for next operation
	    gl.bindBuffer(gl.ARRAY_BUFFER, that.texcoords);
	    gl.vertexAttribPointer( prog.attrib.texcoord,
				    that.texcoords.itemSize, 
				    gl.FLOAT, false, 0, 0);
	    gl.enableVertexAttribArray(prog.attrib.texcoord);
	} 
	else 
	{
	    gl.uniform1f( prog.uniform.pointsize,  150.0);
	}

	if ( that.mode == "line_loop" )
	{
	    gl.lineWidth(10.0);
	}




	// update uniforms in shader program
	gl.uniformMatrix4fv( prog.uniform.projection, false, that.projMat.flattenToArrayOffset([],0));
	gl.uniformMatrix4fv( prog.uniform.modelView,  false, that.modelViewMat.flattenToArrayOffset([],0));

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, that.stoneTexture);
	gl.uniform1i( prog.uniform.tex,  0);
	
	var m;
	switch(that.mode){
	case "polygon":
	    m = gl.TRIANGLE_FAN;
	    break;
	case "line_loop":
	    m = gl.LINE_LOOP;
	    break;
	case "point_sprite":
	    m = gl.POINTS;
	    break;
	}
	// bind buffer
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, that.indices);
	// draw stuff on screen from vertices, using triangles and specified index buffer
	gl.drawElements(m, that.indices.numItems, that.indices.itemSize, 0);
    }



}
// Create test application instance
var app = new WebGLApp();
