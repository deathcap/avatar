# avatar

Skinnable avatar player model for voxel games

![screenshot](http://i.imgur.com/HVvs6rv.png "Screenshot")

This module is similar to @maxogden's [minecraft-skin](https://github.com/maxogden/minecraft-skin),
but instead of using [three.js](http://threejs.org/), it uses [gl-modules](http://modules.gl/).
Returns a [gl-vao](https://github.com/gl-modules/gl-vao) object
containing the vertices and UV coordinates for the player model,
for use with the provided vertex and fragment shaders.

For an example, run `npm start` or check out the [live demo](http://deathcap.github.io/avatar).
Try dragging your skin image file from your hard disk onto the demo to change the textures.

## Skin formats

Currently supported:

* Minecraft 1.7 and earlier (64x32) skin format. Included substack.png as an example:
![screenshot](substack.png "example skin")

(Minecraft is property of Mojang Specifications).

## Uniforms

* `mat4 projectionMatrix, modelViewMatrix`: the usual transformation matrices
* `sampler2D skin`: skin texture, should be in one of the above supported formats (for example from a [gl-texture2d](https://github.com/gl-modules/gl-texture2d))
* `float rArmRotateX`: right arm rotation X (radians)
* `float lArmRotateX`: left arm rotation X (radians)
* `float rLegRotateX`: right leg rotation X (radians)
* `float lLegRotateX`: left leg rotation X (radians)

Example of setting the rotation uniforms:

![screenshot](http://i.imgur.com/bDHGpqV.png "Screenshot rotation")

## License

MIT

