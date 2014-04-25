'use strict'

var glm          = require('gl-matrix')
var mat4         = glm.mat4
var vec3         = glm.vec3
var generateBoxesMesh = require('./box-geometry.js')

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

module.exports = generateMesh
