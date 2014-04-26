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

  // overall size of skin texture TODO: support new 64x64 (overlay + separated left/right)
  var total_w = 64
  var total_h = 32

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
  boxes.push({uv: [
    //u v  w  h, rot
    24, 8, 8, 8, 1, // back
     8, 8, 8, 8, 0, // front
     8, 0, 8, 8, 0, // top
    16, 0, 8, 8, 0, // bottom
     0, 8, 8, 8, 0, // left
    16, 8, 8, 8, 1  // right
  ]})

  // body
  boxes.push({uv: [
    32, 20,  8, 12, 1,
    20, 20,  8, 12, 0,
    20, 16,  8,  4, 0,
    28, 16,  8,  4, 0,
    16, 20,  4, 12, 0,
    28, 20,  4, 12, 0
  ]})


  // right arm
  boxes.push({uv: [
    52, 20,  4, 12, 1,
    44, 20,  4, 12, 0,
    44, 16,  4,  4, 0,
    48, 16,  4,  4, 0,
    40, 20,  4, 12, 0,
    48, 20,  4, 12, 1
  ]})

  // left arm
  boxes.push({uv: [
    56, 20, -4, 12, 1, // TODO: different UVs for 64x64
    48, 20, -4, 12, 0,
    48, 16, -4,  4, 0,
    52, 16, -4,  4, 0,
    52, 20, -4, 12, 0,
    44, 20, -4, 12, 0
  ]})

  // right leg
  boxes.push({uv: [
    12, 20,  4, 12, 1,
     4, 20,  4, 12, 0,
     8, 16, -4,  4, 0,
    12, 20, -4,  4, 0,
     0, 20,  4, 12, 0,
     8, 20,  4, 12, 1
  ]})

  // left leg
  boxes.push({uv: [
    16, 20, -4, 12, 1,
     8, 20, -4, 12, 0,
     4, 16,  4,  4, 0,
     8, 20, -4,  4, 0,
    12, 20, -4, 12, 0,
     4, 20, -4, 12, 0
  ]})


  return generateBoxesMesh(gl, boxes)
}

module.exports = generateMesh
