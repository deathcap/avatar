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
    //u v  w  h
    24, 8, 8, 8,  // back
     8, 8, 8, 8,  // front
     8, 0, 8, 8,  // top
    16, 0, 8, 8,  // bottom
     0, 8, 8, 8,  // left // TODO: this has to be rotated?
    16, 8, 8, 8   // right
  ]})

  // body
  boxes.push({uv: [
    32, 20,  8, 12,
    20, 20,  8, 12,
    20, 16,  8,  4,
    28, 16,  8,  4,
    16, 20,  4, 12,
    28, 20,  4, 12
  ]})


  // right arm
  boxes.push({uv: [
    56, 20,  4, 12,
    48, 20,  4, 12,
    48, 16,  4,  4,
    52, 16,  4,  4,
    52, 20,  4, 12,
    44, 20,  4, 12
  ]})

  // left arm
  boxes.push({uv: [
    56, 20, -4, 12, // TODO: different UVs for 64x64
    48, 20, -4, 12,
    48, 16, -4,  4,
    52, 16, -4,  4,
    52, 20, -4, 12,
    44, 20, -4, 12
  ]})

  // right leg
  boxes.push({uv: [
    12, 20,  4, 12,
     4, 20,  4, 12,
     8, 16, -4, 4,
    12, 20, -4, 4,
     0, 20,  4, 12,
     8, 20,  4, 12
  ]})

  // left leg
  boxes.push({uv: [
    16, 20, -4, 12,
     8, 20, -4, 12,
     4, 16,  4,  4,
     8, 20, -4,  4,
    12, 20, -4, 12,
     4, 20, -4, 12
  ]})


  return generateBoxesMesh(gl, boxes)
}

module.exports = generateMesh
