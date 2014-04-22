attribute vec3 position;

uniform mat4 matrix;

varying vec2 texCoord;

void main() {
    gl_Position = matrix * vec4(position, 1.0);
    texCoord = position.xy;
}

