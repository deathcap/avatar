attribute vec3 position;
attribute vec2 uv;

uniform mat4 matrix;

varying vec2 vUv;

void main() {
    gl_Position = matrix * vec4(position, 1.0);

    vUv = uv;
}

