var createCamera = require('game-shell-orbit-camera')
var createBuffer = require('gl-buffer')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var createVAO    = require('gl-vao')
var createTexture= require('gl-texture2d')
var lena         = require('lena')

var mat4 = require('gl-matrix').mat4

var shader
var mesh
var gl
var skin
var shell = createShell({
  clearColor: [0, 0, 0, 1]
})

shell.on('gl-init', init)
shell.on('gl-render', draw)

function init() {
  gl = shell.gl

  skin = createTexture(gl, lena)

  // create the camera and adjust its
  // position to roughly center on the bunny
  camera = createCamera(shell)
  camera.distance = 4

  // Create the position buffer.
  var pos = createBuffer(gl
    , new Float32Array([
      0,0,0,
      0,0,1,
      0,1,0,
      0,1,1,
      1,0,0,
      1,0,1,
      1,1,0,
      1,1,1])
  )

  var cubeIndices = new Uint16Array([
      0,2,6, 0,6,4,
      0,1,5, 0,3,5,
      0,2,3, 0,3,1,
      4,6,7, 4,7,5,
      1,3,7, 1,5,7,
      3,2,6, 3,7,6,
      ])

  // Create the index buffer. This is instead packed into
  // a UInt16Array: note that this is important, otherwise
  // your model won't render correctly. Also important is
  // that you label this buffer as an ELEMENT_ARRAY_BUFFER,
  // or WebGL will hassle you and refuse to draw the VAO.
  var index = createBuffer(gl
    , cubeIndices
    , gl.ELEMENT_ARRAY_BUFFER
  )

  // Create a VAO from the position buffer, indexed by the
  // index buffer.
  mesh = createVAO(gl, [{
    buffer: pos
    , size: 3
  }], index)
  mesh.length = cubeIndices.length

  // This super-basic shader is loaded in using glslify, see
  // shader.frag and shader.vert.
  shader = glslify({
      vertex: './avatar.vert'
    , fragment: './avatar.frag'
  })(gl)
}

var view = new Float32Array(16)
var proj = new Float32Array(16)

function draw() {
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  camera.view(view)
  mat4.perspective(proj
    , Math.PI / 4
    , shell.width / shell.height
    , 0.001
    , 1000
  )

  mat4.mul(proj, proj, view)

  shader.bind()
  shader.uniforms.matrix = proj
  shader.uniforms.skin = skin.bind()
  shader.attributes.position.pointer()

  // Bind the VAO, and draw all of the elements
  // to the screen as triangles. The gl-vao module
  // will handle when to use gl.drawArrays/gl.drawElements
  // for you.
  mesh.bind()
  mesh.draw(gl.TRIANGLES, mesh.length)
  mesh.unbind()
}
