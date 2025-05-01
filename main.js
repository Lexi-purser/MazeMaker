import { initShaderProgram } from "./shader.js";
import { Maze } from "./mazeMaker.js";

main();
async function main() {
	console.log('Running correctly');
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert('Sorry! Looks like your browser does not support WebGL');
	}
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	// Create shaders
	const vertexShaderText = await(await fetch("basic.vs")).text();
	const fragmentShaderText = await(await fetch("basic.fs")).text();
	const shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);

	// make our maze object
	let WIDTH = 3;
	let HEIGHT = 2;
	let m = new Maze(WIDTH, HEIGHT);

	// load our projection matrix onto the shader
	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	const projectionMatrix = mat4.create();
	const margin = 0.5;
	let xlow = -margin;
	let xhigh = WIDTH+margin;
	let ylow = -margin;
	let yhigh = HEIGHT+margin;

	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

	// load our modelview matrix onto the shader
	const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	const modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

	// make our event listener 
	window.addEventListener("keydown", keyDown);
	function keyDown(event){
		if (event.code == 'KeyB'){
			WIDTH = WIDTH+1;
			HEIGHT+=1;
			m = new Maze(WIDTH, HEIGHT);
			xlow = -margin;
			xhigh = WIDTH+margin;
			ylow = -margin;
			yhigh = HEIGHT+margin;
			mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
			gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
		}		
	}

	addEventListener("click", click);
	function click(event) {
		console.log("click");
		const xWorld = xlow + event.offsetX / gl.canvas.clientWidth * (xhigh - xlow);
		const yWorld = ylow + (gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight * (yhigh - ylow);
		// Do whatever you want here, in World Coordinates.
	}

	// Main graphics render loop
	let previousTime = 0;
	function redraw(currentTime){
		currentTime *= .001; // goes from milliseconds to seconds
		let DT = currentTime - previousTime;
		if(DT > .1)
			DT = .1;
		previousTime = currentTime;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		m.draw(gl, shaderProgram);
		requestAnimationFrame(redraw);
	}
	requestAnimationFrame(redraw);
};

