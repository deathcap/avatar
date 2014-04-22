
var createShell = require('gl-now');
var glslify = require('glslify');

shell = createShell();
var shader;

shell.on("gl-init", function() {
  var gl = shell.gl

  shader = glslify({vertex: './avatar.vert', fragment: './avatar.frag'})(gl);

  //Create buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, 0, 0,
    0, -1, 0,
    1, 1, 0
  ]), gl.STATIC_DRAW)

  //Set up attribute pointer
  var position_attribute = gl.getAttribLocation(shader.handle, "position")
  gl.enableVertexAttribArray(position_attribute)
  gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0)
})

shell.on("gl-render", function(t) {
  var gl = shell.gl

  shader.bind();
  shader.attributes.position.location = 0;
  gl.drawArrays(gl.TRIANGLES, 0, 3)
})

shell.on("gl-error", function(e) {
  throw new Error("WebGL not supported :(")
})
