var createCamera = require('game-shell-orbit-camera')
var createBuffer = require('gl-buffer')
var glslify      = require('glslify')
var createShell  = require('gl-now')
var createVAO    = require('gl-vao')
var createTexture= require('gl-texture2d')
var getPixels    = require('get-pixels')

var glm          = require('gl-matrix')
var mat4         = glm.mat4
var vec3         = glm.vec3

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

  // create the camera and adjust its
  // position to roughly center on the bunny
  camera = createCamera(shell)
  camera.distance = 10

  mesh = generateMesh(gl)

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
/*
var bodyTransform = mat4.create()

mat4.scale(bodyTransform, bodyTransform, [1.0, 1.5, 0.5])
mat4.translate(bodyTransform, bodyTransform, [0, -1.0, 0]) // TODO: fix 1/8 offset Y
*/

var draw = function() {
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

shell.on('gl-init', init)
shell.on('gl-render', draw)
