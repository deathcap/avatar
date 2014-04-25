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

  getPixels('./viking.png', function(err, pixels) {
    if (err) throw err

    skin = createTexture(gl, pixels)
  })

  // create the camera and adjust its
  // position to roughly center on the bunny
  camera = createCamera(shell)
  camera.distance = 10

  // Cube coordinates, see https://developer.mozilla.org/en-US/docs/Web/WebGL/Creating_3D_objects_using_WebGL
  var cube = new Float32Array([
    // Back face
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // Front face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,

    // Top face
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,

    // Bottom face
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,

    // Left face
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,

    // Right face
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
  ])

  var cubeCount = 2

  // add vetices for each cube
  var verticesArray = new Float32Array(cube.length * cubeCount)
  for (var i = 0; i < cubeCount; ++i)
    verticesArray.set(cube, cube.length * i)

  // test moving over the 2nd cube as an example, to prove it exists
  // TODO: real transformations, for each body part
  for (var i = cube.length; i < cube.length * 2; ++i)
    verticesArray[i] += 2.0

  // Create the position buffer.
  var vertices = createBuffer(gl, verticesArray)

  var cubeVertexIndices = new Uint16Array([
    0,  1,  2,      0,  2,  3,    // back
    4,  5,  6,      4,  6,  7,    // front
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // left
    20, 21, 22,     20, 22, 23    // right
  ])

  // repeat vertex indices for each cube, offset by cube vertex count
  var indexArray = new Uint16Array(cubeVertexIndices.length * cubeCount)
  for (var i = 0; i < cubeCount; ++i) {
    for (var j = 0; j < cubeVertexIndices.length; ++j) {
      indexArray[i * cubeVertexIndices.length + j] = cubeVertexIndices[j] + (cube.length / 3) * i
    }
  }

  // Create the index buffer. This is instead packed into
  // a UInt16Array: note that this is important, otherwise
  // your model won't render correctly. Also important is
  // that you label this buffer as an ELEMENT_ARRAY_BUFFER,
  // or WebGL will hassle you and refuse to draw the VAO.
  var index = createBuffer(gl
    , indexArray
    , gl.ELEMENT_ARRAY_BUFFER
  )


  var uvArray = new Float32Array(2 * 4 * 6 * cubeCount)

  var tw = 64, th = 32
  var setCubeFaceUV = function(face,x,y,w,h) {
    w = w || 8
    h = h || 8

    var i = face * 8

    uvArray[i    ] =  x      / tw
    uvArray[i + 1] = (y + h) / th

    uvArray[i + 2] =  x      / tw
    uvArray[i + 3] =  y      / th

    uvArray[i + 4] = (x + w) / tw
    uvArray[i + 5] =  y      / th

    uvArray[i + 6] = (x + w) / tw
    uvArray[i + 7] = (y + h) / th
  }

  // head
  setCubeFaceUV(0, 24, 8, 8, 8) // back
  setCubeFaceUV(1,  8, 8, 8, 8) // front
  setCubeFaceUV(2,  8, 0, 8, 8) // top
  setCubeFaceUV(3, 16, 0, 8, 8) // bottom
  setCubeFaceUV(4,  0, 8, 8, 8) // left // TODO: this has to be rotated?
  setCubeFaceUV(5, 16, 8, 8, 8) // right

  // TODO: body
  setCubeFaceUV(6, 24, 8, 8, 8) // back
  setCubeFaceUV(7,  8, 8, 8, 8) // front
  setCubeFaceUV(8,  8, 0, 8, 8) // top
  setCubeFaceUV(9, 16, 0, 8, 8) // bottom
  setCubeFaceUV(10, 0, 8, 8, 8) // left
  setCubeFaceUV(11,16, 8, 8, 8) // right


  uv = createBuffer(gl, uvArray)

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
  mesh.length = indexArray.length

  // This super-basic shader is loaded in using glslify, see
  // shader.frag and shader.vert.
  shader = glslify({
      vertex: './avatar.vert'
    , fragment: './avatar.frag'
  })(gl)
}

var view = new Float32Array(16)
var proj = new Float32Array(16)
var model = mat4.create()

var headTransform = mat4.create()
var bodyTransform = mat4.create()

// TODO: move
mat4.scale(bodyTransform, bodyTransform, [1.0, 1.5, 0.5])
mat4.translate(bodyTransform, bodyTransform, [0, -1.0, 0]) // TODO: fix 1/8 offset Y

function draw() {
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  camera.view(view)
  mat4.perspective(proj // TODO: shouldn't have to calculate this everytime (only if shell changes); add event
    , Math.PI / 4
    , shell.width / shell.height
    , 0.001
    , 1000
  )

  shader.bind()
  shader.attributes.position.location = 0
  shader.attributes.uv.location = 1
  shader.uniforms.projectionMatrix = proj
  shader.uniforms.viewMatrix = view
  shader.uniforms.modelMatrix = headTransform
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
