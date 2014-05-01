'use strict'

var createVAO    = require('gl-vao')
var createBuffer = require('gl-buffer')
var toarray      = require('toarray')
var glm          = require('gl-matrix')
var mat4         = glm.mat4
var vec3         = glm.vec3

var applyTransformToVertices = function(vertices, matrix, w) {
  for (var i = 0; i < vertices.length / 4; i += 1) {
    var vertex = vertices.subarray(i * 4, (i + 1) * 4)

    if (w !== undefined)
      vertex[3] = w // pass body part index in w coordinate for avatar.vert

    vec3.transformMat4(vertex, vertex, matrix)
  }
}

var identity = mat4.create()

// TODO: split out into an independent non-avatar module, as this is
// mostly generic except for 1) use of w coord for index, 2) uv divisors

var generateBoxesMesh = function(gl, info, opts) {
  info = toarray(info)
  opts = opts || {}
  opts.uDiv = opts.uDiv || 1
  opts.vDiv = opts.vDiv || 1
  opts.setWindex = opts.setWindex !== undefined ? opts.setWindex : false

  // Cube coordinates, see https://developer.mozilla.org/en-US/docs/Web/WebGL/Creating_3D_objects_using_WebGL
  var cube = new Float32Array([
    // Back face
    -0.5, -0.5,  0.5, 1.0,
     0.5, -0.5,  0.5, 1.0,
     0.5,  0.5,  0.5, 1.0,
    -0.5,  0.5,  0.5, 1.0,

    // Front face
    -0.5, -0.5, -0.5, 1.0,
    -0.5,  0.5, -0.5, 1.0,
     0.5,  0.5, -0.5, 1.0,
     0.5, -0.5, -0.5, 1.0,

    // Top face
    -0.5,  0.5, -0.5, 1.0,
    -0.5,  0.5,  0.5, 1.0,
     0.5,  0.5,  0.5, 1.0,
     0.5,  0.5, -0.5, 1.0,

    // Bottom face
    -0.5, -0.5, -0.5, 1.0,
     0.5, -0.5, -0.5, 1.0,
     0.5, -0.5,  0.5, 1.0,
    -0.5, -0.5,  0.5, 1.0,

    // Left face
     0.5, -0.5, -0.5, 1.0,
     0.5,  0.5, -0.5, 1.0,
     0.5,  0.5,  0.5, 1.0,
     0.5, -0.5,  0.5, 1.0,

    // Right face
    -0.5, -0.5, -0.5, 1.0,
    -0.5, -0.5,  0.5, 1.0,
    -0.5,  0.5,  0.5, 1.0,
    -0.5,  0.5, -0.5, 1.0
  ])

  var cubeCount = info.length

  // add vetices for each cube
  var verticesArray = new Float32Array(cube.length * cubeCount)
  for (var i = 0; i < cubeCount; i += 1) {
    var thisCube = new Float32Array(cube.length)
    thisCube.set(cube)

    applyTransformToVertices(thisCube, info[i].matrix || identity, opts.setWindex ? i : undefined)

    verticesArray.set(thisCube, cube.length * i)
  }

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
      indexArray[i * cubeVertexIndices.length + j] = cubeVertexIndices[j] + (cube.length / 4) * i
    }
  }

  var index = createBuffer(gl
    , indexArray
    , gl.ELEMENT_ARRAY_BUFFER
  )


  // set UV coordinates for textures
  var uvArray = new Float32Array(2 * 4 * 6 * cubeCount)

  var setCubeFaceUV = function(face,x,y,w,h,r) {
    w = w || 8
    h = h || 8

    r = r || 0

    var i = face * 8

    uvArray[i + (0 + r) % 4 * 2 + 0] =  x      / opts.uDiv
    uvArray[i + (0 + r) % 4 * 2 + 1] = (y + h) / opts.vDiv

    uvArray[i + (1 + r) % 4 * 2 + 0] =  x      / opts.uDiv
    uvArray[i + (1 + r) % 4 * 2 + 1] =  y      / opts.vDiv

    uvArray[i + (2 + r) % 4 * 2 + 0] = (x + w) / opts.uDiv
    uvArray[i + (2 + r) % 4 * 2 + 1] =  y      / opts.vDiv

    uvArray[i + (3 + r) % 4 * 2 + 0] = (x + w) / opts.uDiv
    uvArray[i + (3 + r) % 4 * 2 + 1] = (y + h) / opts.vDiv
  }

  for (var i = 0; i < cubeCount; i += 1) {
    var uvs = info[i].uv
    for (var face = 0; face < 6; face += 1) {
      var x = uvs[5*face + 0]
      var y = uvs[5*face + 1]
      var w = uvs[5*face + 2]
      var h = uvs[5*face + 3]
      var r = uvs[5*face + 4]

      setCubeFaceUV(6*i + face, x, y, w, h, r)
    }
  }

  var uv = createBuffer(gl, uvArray)

  // Create a VAO from the vertices and uv buffers, indexed by the
  // index buffer.
  var mesh = createVAO(gl, [
      {
        buffer: vertices
        , size: 4
      },
      {
        buffer: uv
        , size: 2
      }
  ], index)
  mesh.length = indexArray.length

  return mesh
}

module.exports = generateBoxesMesh
