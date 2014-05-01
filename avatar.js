'use strict'

var generateBoxesMesh = require('box-geometry')

var ndarray      = require('ndarray')
var createTexture= require('gl-texture2d')
var url4data     = require('url4data')
var getPixels    = require('get-pixels')

var createSkinMesh = function(gl) {
  var boxes = []

  // MC1.8 64x64 skin format UV coords http://i.imgur.com/SnDKuc1.png
  // see http://www.reddit.com/r/Minecraft/comments/1vd7ue/new_skin_layout_explanation_in_comments/
  // and https://github.com/deathcap/avatar/issues/8

  // head
  boxes.push({uv: [
    //x  y   w   h rot
    24,  8,  8,  8, 1, // back
     8,  8,  8,  8, 0, // front
     8,  0,  8,  8, 0, // top
    16,  0,  8,  8, 0, // bottom
     0,  8,  8,  8, 0, // left
    16,  8,  8,  8, 1  // right
  ]})

  // body
  boxes.push({uv: [
    32, 20,  8, 12, 1,
    28, 20, -8, 12, 0,
    20, 16,  8,  4, 0,
    28, 16,  8,  4, 0,
    16, 20,  4, 12, 0,
    28, 20,  4, 12, 1
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

  // left arm 64x64       // 64x32
   boxes.push({uv: [      // boxes.push({uv: [
    44, 52,  4, 12, 1,    //  56, 20, -4, 12, 1,
    36, 52,  4, 12, 0,    //  48, 20, -4, 12, 0,
    36, 48,  4,  4, 0,    //  48, 16, -4,  4, 0,
    40, 48,  4,  4, 0,    //  52, 16, -4,  4, 0,
    32, 52,  4, 12, 0,    //  52, 20, -4, 12, 0,
    40, 52,  4, 12, 1     //  44, 20, -4, 12, 1
  ]})                     // ]})

  // right leg
  boxes.push({uv: [
    12, 20,  4, 12, 1,
     4, 20,  4, 12, 0,
     8, 16, -4,  4, 0,
    12, 20, -4,  4, 0,
     0, 20,  4, 12, 0,
     8, 20,  4, 12, 1
  ]})

  // left leg 64x64       // 64x32
  boxes.push({uv: [       // boxes.push({uv: [
    28, 52,  4, 12, 1,    //  16, 20, -4, 12, 1,
    20, 52,  4, 12, 0,    //   8, 20, -4, 12, 0,
    24, 48, -4,  4, 0,    //   4, 16,  4,  4, 0,
    28, 52, -4,  4, 0,    //   8, 20, -4,  4, 0,
    16, 52,  4, 12, 0,    //  12, 20, -4, 12, 0,
    24, 52,  4, 12, 1     //   4, 20, -4, 12, 1
  ]})                     // ]})


  return generateBoxesMesh(gl, boxes, {uDiv:64, vDiv:64, setWindex:true})
}

// copy (sx,sy) wxh to (dx,dy)
// TODO: ndarray bitblt module?
var copyPixels = function(dst, src, sx, sy, w, h, dx, dy) {
  var channels = dst.shape[2]
  if (channels != src.shape[2]) throw new Error('copyPixels mismatched channels, '+dst.shape[2]+' != '+src.shape[2])

  for (var i = 0; i < h; i += 1) {
    for (var j = 0; j < w; j += 1) {
      for (var k = 0; k < channels; k += 1) {
        dst.set(i+dy,j+dx,k,src.get(i+sy,j+sx,k))
      }
    }
  }
}

var copyPixelsFlipX = function(dst, src, sx, sy, w, h, dx, dy) {
  var channels = dst.shape[2]
  if (channels != src.shape[2]) throw new Error('copyPixelsFlipped mismatched channels, '+dst.shape[2]+' != '+src.shape[2])
  for (var i = 0; i < h; i += 1) {
    for (var j = 0; j < w; j += 1) {
      for (var k = 0; k < channels; k += 1) {
        dst.set(i+dy,j+dx,k,src.get(i+sy,w-j-1+sx,k))
      }
    }
  }
}

// get a gl-texture2d for the skin from an ArrayBuffer
var createSkinTexture = function(gl, arrayBuffer, name, type, cb) {
  url4data(arrayBuffer, name, {type: type}, function(url) {
    getPixels(url, function(err, pixels) {
      if (err) {
        console.log('Error reading texture',name,': ',err)
        return cb(err)
      }

      var newPixels
      var height = pixels.shape[0], width = pixels.shape[1], channels = pixels.shape[2]
      var ratio = width / height
      if (ratio === 2) {
        // 64x32 pre-1.8 format, need to convert to 64x64
        newPixels = ndarray(new pixels.data.constructor(2 * height * width * channels),
          [2 * height, width, channels])

        // copy top half
        copyPixels(newPixels, pixels, 0,0, width,height, 0,0)

        var s = width / 64 // scale to support high-res skins, multiple of 64x32
        // copy right leg -> left leg
        copyPixels(newPixels, pixels,  0*s,16*s, 16*s,16*s, 16*s,48*s)
        // copy right arm -> left arm, but mirror the individual cube faces
        copyPixelsFlipX(newPixels, pixels, 44*s,16*s, 4*s, 4*s, 36*s,48*s)  // top
        copyPixelsFlipX(newPixels, pixels, 48*s,16*s, 4*s, 4*s, 40*s,48*s)  // bottom
        copyPixelsFlipX(newPixels, pixels, 40*s,20*s, 4*s,12*s, 40*s,52*s)  // left -> right
        copyPixelsFlipX(newPixels, pixels, 44*s,20*s, 4*s,12*s, 36*s,52*s)  // front
        copyPixelsFlipX(newPixels, pixels, 48*s,20*s, 4*s,12*s, 32*s,52*s)  // right -> left
        copyPixelsFlipX(newPixels, pixels, 52*s,20*s, 4*s,12*s, 44*s,52*s)  // back

        //window.open(require('save-pixels')(newPixels, 'canvas').toDataURL()) // debug
        //document.write('<img border=1 width=512 height=512 src='+(require('save-pixels')(newPixels, 'canvas').toDataURL())+'>')
      } else if (ratio === 1) {
        // 64x64 format, can load as-is
        newPixels = pixels
      } else {
        // not a valid shape (nor high-res multiple like 128x64 for 64x32, or 128x128 for 64x64),
        // but try to load it anyways, what's the worst that could happen?
        newPixels = pixels
      }

      var skin = createTexture(gl, newPixels)
      cb(null, skin)
    })
  })
}

module.exports = {
  createSkinMesh: createSkinMesh,
  createSkinTexture: createSkinTexture
};
