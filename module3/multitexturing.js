/*******************************************************************************
*  Multitexturing demo, utilizing Three.js (r69)
* 
*  Copyright (c) anssi.grohn@karelia.fi 2013-2015.
*
*******************************************************************************/

// Create our test app "class"
var WebGLApp = function(){

    var that = this;        // to access object itself
    this.canvas = null;     // canvas where gl context will be set


    this.vertices = null;   // vertex data buffer  (WebGL-specific)
    this.texcoords = null;  // texture coordinate buffer.
    this.indices = null;    // index data buffer (WebGL-specific)
    this.modeS = "REPEAT";
    this.modeT = "REPEAT";
    this.projMat = new THREE.Matrix4();           // projection matrix, using Three.js matrix type
    this.modelViewMat = new THREE.Matrix4();      // modelview matrix, using Three.js matrix type

    this.shaderProgram = null;                    // shader program (WebGL-specific)
    this.stoneTexture = null;
    /* ---------- Initialization routine ---------- */
    this.Prepare = function(canvas) {

	// get DOM element from jQuery object
	that.canvas = canvas[0]

	Util.InitGL(that.canvas);
	that.modeT = that.modeS = "REPEAT";

	that.InitData();
	that.InitTextures();
	that.InitShaders();
	
	// define screen clear color.
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// enable depth test.
	gl.enable(gl.DEPTH_TEST);

	// Draw everything.
	Render();
	
	console.log('Drawing complete');
	
    }

    this.InitTextures = function()
    {
	that.stoneTexture  = gl.createTexture();
	that.stoneTexture.image = new Image();
	that.stoneTexture.image.onload = function(){ 
	    that.stoneTexture.image.loaded = true;
	    Util.handleTexture(that.stoneTexture);
	    app.Render();
	}
	that.stoneTexture.image.src = "stone.png";

	that.faceTexture = gl.createTexture();
	that.faceTexture.image = new Image();
	that.faceTexture.image.onload = function(){
	    that.faceTexture.image.loaded = true;
	    Util.handleTexture(that.faceTexture);
	    app.Render();
	}
	that.faceTexture.image.src = "mask.png";
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
	// first set of texture coordinates
	var texCoords = [
	    0.0, 0.0,
	    1.0, 0.0,
	    1.0, 1.0,
	    0.0, 1.0
	]
	// another set of texture coordinates
	var texCoords2 = [
	    0.0, 0.0,
	    3.0, 0.0,
	    3.0, 2.0,
	    0.0, 2.0
	]
	var indices = [ 
	    0,3,1,2 
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

	that.texcoords2 = gl.createBuffer();
	that.texcoords2.numItems = 4;
	that.texcoords2.itemSize = 2;
	gl.bindBuffer( gl.ARRAY_BUFFER, that.texcoords2);
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords2), gl.STATIC_DRAW);

	console.log('Data initialized.');
    }

    
    /* ---------- Shader Data Init  ---------- */
    this.InitShaders = function() {

	var shader = Util.createShaderProgramFrom("shader-vs", "shader-fs");
	gl.useProgram(shader);
	// Create shader program for triangles and lines
	shader.attrib.pos         = gl.getAttribLocation(shader, "aPosition");
	shader.attrib.texcoord    = gl.getAttribLocation(shader, "aTexCoord");
	shader.attrib.texcoord2   = gl.getAttribLocation(shader, "aTexCoord2");
	shader.uniform.map        = gl.getUniformLocation(shader, "map");
	shader.uniform.lightmap   = gl.getUniformLocation(shader, "lightMap");
	shader.uniform.projection = gl.getUniformLocation(shader, "uProjection");
	shader.uniform.modelView  = gl.getUniformLocation(shader, "uModelView");
	that.shader = shader;
	gl.useProgram(null);

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

	var prog = that.shader;

	gl.useProgram( prog );
	// bind buffer for next operation
	gl.bindBuffer(gl.ARRAY_BUFFER, that.vertices);

	// bind buffer data to shader attribute
	gl.vertexAttribPointer( prog.attrib.pos,
				that.vertices.itemSize, 
				gl.FLOAT, false, 0, 0);

	// enable vertex attrib array so data gets transferred
	gl.enableVertexAttribArray(prog.attrib.pos);

	// bind buffer for next operation
	gl.bindBuffer(gl.ARRAY_BUFFER, that.texcoords);
	gl.vertexAttribPointer( prog.attrib.texcoord,
				that.texcoords.itemSize, 
				gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.attrib.texcoord);
	
	// bind buffer for next operation
	gl.bindBuffer(gl.ARRAY_BUFFER, that.texcoords2);
	gl.vertexAttribPointer( prog.attrib.texcoord2,
				that.texcoords2.itemSize, 
				gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.attrib.texcoord2);

	// update uniforms in shader program
	gl.uniformMatrix4fv( prog.uniform.projection, false, that.projMat.flattenToArrayOffset([],0));
	gl.uniformMatrix4fv( prog.uniform.modelView,  false, that.modelViewMat.flattenToArrayOffset([],0));

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, that.stoneTexture);
	gl.uniform1i( prog.uniform.map,  0);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, that.faceTexture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[that.modeS]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[that.modeT]);
	gl.uniform1i( prog.uniform.lightmap,  1);

	// bind buffer
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, that.indices);
	// draw stuff on screen from vertices, using triangles and specified index buffer
	gl.drawElements(gl.TRIANGLE_STRIP, that.indices.numItems, that.indices.itemSize, 0);
    }



}
// Create test application instance
var app = new WebGLApp();

app.setModeS = function(mode){
    app.modeS = mode;
}

app.setModeT = function(mode){
    app.modeT = mode;
}

function Render(){
    requestAnimationFrame(Render);
    if ( app.stoneTexture.image.loaded && app.faceTexture.image.loaded  )
	app.Render();
}
