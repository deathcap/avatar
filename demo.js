var createCamera = require('game-shell-orbit-camera')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var asarray      = require('asarray')
var glm          = require('gl-matrix')
var mat4         = glm.mat4
var fs           = require('fs')

var shader
var mesh
var gl
var skin
var uv
var shell = createShell({
  clearColor: [0.75, 0.8, 0.9, 1.0]
})

var avatarModule = require('./avatar.js')
var createSkinMesh = avatarModule.createSkinMesh
var createSkinTexture = avatarModule.createSkinTexture

var init = function() {
  gl = shell.gl

  createSkinTexture(gl, fs.readFileSync('./substack.png'), 'substack.png', 'image/png', function(err, texture) {
    skin = texture
  })

  camera = createCamera(shell)
  camera.distance = 10

  mesh = createSkinMesh(gl)

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
        createSkinTexture(gl, result, file.name, file.type || 'image/png', function(err, texture) {
          skin = texture
        })
      })
      reader.readAsArrayBuffer(file)
    })
  })
}

shell.on('gl-init', init)
shell.on('gl-render', render)
enableDrop()
