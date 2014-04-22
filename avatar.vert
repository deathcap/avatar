attribute vec3 position;
attribute vec3 uv;

uniform mat4 matrix;

varying vec2 texCoord;

void main() {
    gl_Position = matrix * vec4(position, 1.0);

    // TODO: set from UV
    texCoord = position.xy;
}

