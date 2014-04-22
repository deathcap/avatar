'use strict';

var createShell = require('gl-now');
var createCamera = require('game-shell-orbit-camera');
var createVAO = require('gl-vao');
var createBuffer = require('gl-buffer');
var glslify = require('glslify');
var glm = require('gl-matrix');
var mat4 = glm.mat4;

var shell = createShell({clearColor: [0, 0, 0, 1]});
var camera;
var shader;
var mesh;

shell.on('gl-init', function() {
  var gl = shell.gl;

  camera = createCamera(shell);

  shader = glslify({
    vertex: './avatar.vert',
    fragment: './avatar.frag'
  })(gl);

  var data = new Uint8Array(3);
  var buffer = createBuffer(gl, data);

  mesh = createVAO(gl, [{
    buffer: buffer,
    type: gl.UNSIGNED_BYTE,
  }]);
});

var viewMatrix = mat4.create();
var projMatrix = mat4.create();

shell.on('gl-render', function() {
  var gl = shell.gl;

  camera.view(viewMatrix);

  mat4.perspective(projMatrix, Math.PI / 4, shell.width / shell.height, 0.001, 1000);
  mat4.mul(projMatrix, projMatrix, viewMatrix);

  shader.bind();
  shader.uniforms.matrix = projMatrix
  shader.attributes.position.location = 0;

  mesh.bind();
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  mesh.unbind();
});
