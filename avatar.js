'use strict'

var createVAO    = require('gl-vao')
var createBuffer = require('gl-buffer')

var glm          = require('gl-matrix')
var mat4         = glm.mat4
var vec3         = glm.vec3

// 64x64 skin format http://i.imgur.com/SnDKuc1.png
// based on http://www.reddit.com/r/Minecraft/comments/1vd7ue/new_skin_layout_explanation_in_comments/
var coords = {
  // name to start x,y - size width,height

  // in both 32x32 and 64x64 skins
  head:       [ 0,  0, 32, 16],
  head2:      [32,  0, 32, 16],

  right_leg:  [ 0, 16, 16, 16],
  body:       [16, 16, 24, 16],
  right_arm:  [40, 16, 16, 16],

  // only in 64x64 extended skins
  right_leg2: [ 0, 32, 16, 16],
  body2:      [16, 32, 24, 16],
  right_arm2: [40, 32, 16, 16],

  left_leg2:  [ 0, 48, 16, 16],
  left_leg:   [16, 48, 16, 16],
  left_arm:   [32, 48, 16, 16],
  left_arm2:  [48, 48, 16, 16]
}

var showUVs = function() {
  var uvs = {}

  // overall size of skin texture TODO: support old 64x32 (clone left/right)
  var total_w = 64
  var total_h = 64

  for (var name in coords) {
    var x = coords[name][0], y = coords[name][1], w = coords[name][2], h = coords[name][3]

    var uv = [
      // top-left
      x / total_w,
      y / total_h,
      (x + w) / total_w,
      (y + h) / total_h
      ]

    uvs[name] = uv
  }

  console.log(uvs)
}

var applyTransformToVertices = function(vertices, matrix) {
  for (var i = 0; i < vertices.length / 3; i += 1) {
    var vertex = vertices.subarray(i * 3, (i + 1) * 3)

    vec3.transformMat4(vertex, vertex, matrix)
  }
}

var generateMesh = function(gl) {
  var boxes = []

  // head
  var headMatrix = mat4.create()
  boxes.push({matrix: headMatrix, uv: [
    //u v  w  h
    24, 8, 8, 8,  // back
     8, 8, 8, 8,  // front
     8, 0, 8, 8,  // top
    16, 0, 8, 8,  // bottom
     0, 8, 8, 8,  // left // TODO: this has to be rotated?
    16, 8, 8, 8   // right
  ]})

  // body
  var bodyMatrix = mat4.create()
  mat4.scale(bodyMatrix, bodyMatrix, [1.0, 1.5, 0.5])
  mat4.translate(bodyMatrix, bodyMatrix, [0, -1.0, 0]) // TODO: fix 1/8 offset Y

  boxes.push({matrix: bodyMatrix, uv: [
    32, 20,  8, 12,
    20, 20,  8, 12,
    20, 16,  8,  4,
    28, 16,  8,  4,
    16, 20,  4, 12,
    28, 20,  4, 12
  ]})


  return generateBoxesMesh(gl, boxes)
}

var generateBoxesMesh = function(gl, info) {
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

  var cubeCount = info.length

  // add vetices for each cube
  var verticesArray = new Float32Array(cube.length * cubeCount)
  for (var i = 0; i < cubeCount; i += 1) {
    var thisCube = new Float32Array(cube.length)
    thisCube.set(cube)

    applyTransformToVertices(thisCube, info[i].matrix)

    verticesArray.set(thisCube, cube.length * i)
  }

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
  for (var i = 0; i < cubeCount; i += 1) {
    for (var j = 0; j < cubeVertexIndices.length; j += 1) {
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

  for (var i = 0; i < cubeCount; i += 1) {
    var uvs = info[i].uv
    for (var face = 0; face < 6; face += 1) {
      var x = uvs[4*face + 0]
      var y = uvs[4*face + 1]
      var w = uvs[4*face + 2]
      var h = uvs[4*face + 3]

      setCubeFaceUV(6*i + face, x, y, w, h)
    }
  }

  var uv = createBuffer(gl, uvArray)

  // Create a VAO from the position buffer, indexed by the
  // index buffer.
  var mesh = createVAO(gl, [
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

  return mesh
}

module.exports = generateMesh
