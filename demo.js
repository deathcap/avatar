'use strict';

var createShell = require('gl-now');
var createCamera = require('game-shell-orbit-camera');
var glslify = require('glslify');
var glm = require('gl-matrix');
var mat4 = glm.mat4;

var shell = createShell();
var shader;
var camera;

shell.on("gl-init", function() {
  var gl = shell.gl

  camera = createCamera(shell);

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

var view = mat4.create();
var proj = mat4.create();

shell.on("gl-render", function(t) {
  var gl = shell.gl

  camera.view(view);
  mat4.perspective(proj, Math.PI / 4, shell.width / shell.height, 0.001, 1000);
  mat4.mul(proj, proj, view);

  shader.bind();
  shader.uniforms.matrix = view;
  shader.attributes.position.location = 0;
  gl.drawArrays(gl.TRIANGLES, 0, 3)
})


