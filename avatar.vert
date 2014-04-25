attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec2 vUv;

mat4 scale(int x, int y, int z) {
    return mat4(  x, 0.0, 0.0, 0.0,
                0.0,   y, 0.0, 0.0,
                0.0, 0.0,   z, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

mat4 translate(int x, int y, int z) {
    return mat4(1.0, 0.0, 0.0,   x,
                0.0, 1.0, 0.0,   y,
                0.0, 0.0, 1.0,   z,
                0.0, 0.0, 0.0, 1.0);
}

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    vUv = uv;
}

