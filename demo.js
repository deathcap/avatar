var createCamera = require('game-shell-orbit-camera')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var createTexture= require('gl-texture2d')
var getPixels    = require('get-pixels')
var url4data     = require('url4data')
var asarray      = require('asarray')
var ndarray      = require('ndarray')
var glm          = require('gl-matrix')
var mat4         = glm.mat4
var fs           = require('fs')

var shader
var mesh
var gl
var skin
var uv
var shell = createShell({
  clearColor: [0, 0, 0, 1]
})

var generateSkinMesh = require('./avatar.js')

var init = function() {
  gl = shell.gl

  setSkinFromArrayBuffer(fs.readFileSync('./substack.png'), 'substack.png', 'image/png')

  camera = createCamera(shell)
  camera.distance = 10

  mesh = generateSkinMesh(gl)

  shader = glslify({
      vertex: './avatar.vert'     // includes matrix transforms
    , fragment: './avatar.frag'   // applies texture
  })(gl)

}

var view = new Float32Array(16)
var proj = new Float32Array(16)

var t = 0
var render = function(dt) {
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  camera.view(view)
  mat4.perspective(proj // note: shouldn't have to calculate this everytime (only if shell changes; add event), but this is only a demo
    , Math.PI / 4
    , shell.width / shell.height
    , 0.001
    , 1000
  )

  shader.bind()
  shader.attributes.position.location = 0
  shader.attributes.uv.location = 1
  shader.uniforms.projectionMatrix = proj
  shader.uniforms.modelViewMatrix = view
  t += dt
  t %= 100
  shader.uniforms.rArmRotateX = Math.sin(t / 100 * 2 * Math.PI)
  shader.uniforms.lArmRotateX = Math.sin(t / 100 * 2 * Math.PI)
  shader.uniforms.rLegRotateX = Math.sin(2 * t / 100 * 2 * Math.PI)
  shader.uniforms.lLegRotateX = Math.cos(2 * t / 100 * 2 * Math.PI)

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

// TODO: move into main module, this code is moving beyond demo territory
var setSkinFromArrayBuffer = function(arrayBuffer, name, type) {
  url4data(arrayBuffer, name, {type: type}, function(url) {
    getPixels(url, function(err, pixels) {
      if (err) {
        console.log('Error reading texture',name,': ',err)
        return
      }

      var newPixels
      var height = pixels.shape[0], width = pixels.shape[1], channels = pixels.shape[2]
      var ratio = width / height
      if (ratio === 2) {
        // 64x32 pre-1.8 format, need to convert to 64x64
        newPixels = ndarray(new pixels.data.constructor(2 * height * width * channels),
          [2 * height, width, channels])

        // copy top half TODO: a 'bitblt' ndarray module would be nice
        for (var i = 0; i < height; i += 1) {
          for (var j = 0; j < width; j += 1) {
            for (var k = 0; k < channels; k += 1) {
              newPixels.set(i,j,k,pixels.get(i,j,k))
            }
          }
        }
        // TODO: mirror bottom left legs, left arm - then update UVs
        // in avatar.js to use them for the left meshes. https://github.com/deathcap/avatar/issues/8

      } else if (ratio === 1) {
        // 64x64 format, can load as-is
        newPixels = pixels
      } else {
        // not a valid shape (nor high-res multiple like 128x64 for 64x32, or 128x128 for 64x64),
        // but try to load it anyways, what's the worst that could happen?
        newPixels = pixels
      }

      skin = createTexture(gl, newPixels)
    })
  })
}

var enableDrop = function() {
  document.body.addEventListener('dragover', function(ev) {
    ev.stopPropagation()
    ev.preventDefault()
  })

  document.body.addEventListener('drop', function(mouseEvent) {
    mouseEvent.stopPropagation()
    mouseEvent.preventDefault()

    console.log('drop',mouseEvent)

    files = mouseEvent.target.files || mouseEvent.dataTransfer.files

    console.log('Dropped',files)

    asarray(files).forEach(function(file) {
      console.log('Reading dropped',file)

      var reader = new FileReader()
      reader.addEventListener('load', function(readEvent) {
        if (readEvent.total !== readEvent.loaded) return // TODO: progress bar

        var result = readEvent.currentTarget.result
        console.log('result',result)
        setSkinFromArrayBuffer(result, file.name, file.type || 'image/png')
      })
      reader.readAsArrayBuffer(file)
    })
  })
}

shell.on('gl-init', init)
shell.on('gl-render', render)
enableDrop()
