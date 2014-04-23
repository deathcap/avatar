var createCamera = require('game-shell-orbit-camera')
var createBuffer = require('gl-buffer')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var createVAO    = require('gl-vao')
var createTexture= require('gl-texture2d')
var getPixels    = require('get-pixels')

var mat4 = require('gl-matrix').mat4

var shader
var mesh
var gl
var skin
var uv
var shell = createShell({
  clearColor: [0, 0, 0, 1]
})

shell.on('gl-init', init)
shell.on('gl-render', draw)

function init() {
  gl = shell.gl

  getPixels('./player.png', function(err, pixels) {
    if (err) throw err

    skin = createTexture(gl, pixels)
  })

  // create the camera and adjust its
  // position to roughly center on the bunny
  camera = createCamera(shell)
  camera.distance = 10

  // Create the position buffer.
  // see https://developer.mozilla.org/en-US/docs/Web/WebGL/Creating_3D_objects_using_WebGL
  var vertices = createBuffer(gl
    , new Float32Array([
    // Back face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Front face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Left face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Right face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
    ])
  )

  var cubeVertexIndices = new Uint16Array([
    0,  1,  2,      0,  2,  3,    // back
    4,  5,  6,      4,  6,  7,    // front
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // left
    20, 21, 22,     20, 22, 23    // right
  ])

  // Create the index buffer. This is instead packed into
  // a UInt16Array: note that this is important, otherwise
  // your model won't render correctly. Also important is
  // that you label this buffer as an ELEMENT_ARRAY_BUFFER,
  // or WebGL will hassle you and refuse to draw the VAO.
  var index = createBuffer(gl
    , cubeVertexIndices
    , gl.ELEMENT_ARRAY_BUFFER
  )

  // TODO: set better UV coordinates
  uv = createBuffer(gl,
      new Float32Array([
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0
      ]))

  // Create a VAO from the position buffer, indexed by the
  // index buffer.
  mesh = createVAO(gl, [
      {
        buffer: vertices
        , size: 3
      },
      {
        buffer: uv
        , size: 2
      }
  ], index)
  mesh.length = cubeVertexIndices.length

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
  shader.attributes.position.location = 0
  shader.attributes.uv.location = 1
  shader.uniforms.matrix = proj
  if (skin) shader.uniforms.skin = skin.bind()
  shader.attributes.position.pointer()
  shader.attributes.uv.pointer()

  // Bind the VAO, and draw all of the elements
  // to the screen as triangles. The gl-vao module
  // will handle when to use gl.drawArrays/gl.drawElements
  // for you.
  mesh.bind()
  mesh.draw(gl.TRIANGLES, mesh.length)
  mesh.unbind()
}
