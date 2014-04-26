var createCamera = require('game-shell-orbit-camera')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var createTexture= require('gl-texture2d')
var getPixels    = require('get-pixels')
var url4data     = require('url4data')
var glm          = require('gl-matrix')
var mat4         = glm.mat4

var shader
var mesh
var gl
var skin
var uv
var shell = createShell({
  clearColor: [0, 0, 0, 1]
})

var generateMesh = require('./avatar.js')

var init = function() {
  gl = shell.gl

  getPixels('./viking.png', function(err, pixels) {
    if (err) throw err

    skin = createTexture(gl, pixels)
  })

  camera = createCamera(shell)
  camera.distance = 10

  mesh = generateMesh(gl)

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
  shader.uniforms.armRotateX = Math.sin(t / 100)
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

var setSkinFromArrayBuffer = function(arrayBuffer, name, type) {
  //var byteArray = new Uint8Array(arrayBuffer)

  url4data(arrayBuffer, name, {type: type}, function(url) {
    getPixels(url, function(err, pixels) {
      if (err) throw err

      skin = createTexture(gl, pixels)
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

    for (var i = 0; i < files.length; i += 1) {
      var file = files[i]
      console.log('Reading dropped',file)

      var reader = new FileReader()
      reader.addEventListener('load', function(readEvent) {
        if (readEvent.total !== readEvent.loaded) return // TODO: progress bar

        var result = readEvent.currentTarget.result
        console.log('result',result)
        setSkinFromArrayBuffer(result, file.name, file.type || 'image/png')
      })
      reader.readAsArrayBuffer(file)
    }
  })
}

shell.on('gl-init', init)
shell.on('gl-render', render)
enableDrop()
