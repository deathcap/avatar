var createCamera = require('game-shell-orbit-camera')
var createBuffer = require('gl-buffer')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var createVAO    = require('gl-vao')

var mat4 = require('gl-matrix').mat4

var shader
var mesh
var gl
var shell = createShell({
  clearColor: [0, 0, 0, 1]
})

shell.on('gl-init', init)
shell.on('gl-render', draw)

function init() {
  gl = shell.gl

  // create the camera and adjust its
  // position to roughly center on the bunny
  camera = createCamera(shell)
  camera.distance = 20
  camera.pan([0, 0.2])

  // Create the position buffer.
  var pos = createBuffer(gl
    , new Float32Array([
      -1, 0, 0,
      0, -1, 0,
      1, 1, 0])
  )

  // Create the index buffer. This is instead packed into
  // a UInt16Array: note that this is important, otherwise
  // your model won't render correctly. Also important is
  // that you label this buffer as an ELEMENT_ARRAY_BUFFER,
  // or WebGL will hassle you and refuse to draw the VAO.
  var index = createBuffer(gl
    , new Uint16Array([
      0, 1, 2,
      ])
    , gl.ELEMENT_ARRAY_BUFFER
  )

  // Create a VAO from the position buffer, indexed by the
  // index buffer.
  mesh = createVAO(gl, [{
    buffer: pos
    , size: 3
  }], index)

  // The total amount of elements to render.
  mesh.length = 3

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
  shader.attributes.position.location = 0

  // Bind the VAO, and draw all of the elements
  // to the screen as triangles. The gl-vao module
  // will handle when to use gl.drawArrays/gl.drawElements
  // for you.
  mesh.bind()
  mesh.draw(gl.TRIANGLES, mesh.length)
  mesh.unbind()
}
