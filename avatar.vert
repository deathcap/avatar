attribute vec4 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec2 vUv;

mat4 scale(float x, float y, float z) {
    return mat4(  x, 0.0, 0.0, 0.0,
                0.0,   y, 0.0, 0.0,
                0.0, 0.0,   z, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

mat4 translate(float x, float y, float z) {
    return mat4(1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                  x,   y,   z, 1.0);
}

mat4 rotateX(float a) {
    return mat4(1.0, 0.0, 0.0, 0.0,
                0.0, cos(a), sin(a), 0.0,
                0.0, -sin(a), cos(a), 0.0,
                0.0, 0.0, 0.0, 1.0);
}

mat4 rotateY(float a) {
    return mat4(cos(a), 0.0, -sin(a), 0.0,
                0.0, 1.0, 0.0, 0.0,
                sin(a), 0.0, cos(a), 0.0,
                0.0, 0.0, 0.0, 1.0);
}

mat4 rotateZ(float a) {
    return mat4(cos(a), sin(a), 0.0, 0.0,
                -sin(a), cos(a), 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 0.1);
}

void main() {
    mat4 partMatrix = mat4(1.0);

    int part = int(position.w);
    if (part == 0) {
        // head
    } else if (part == 1) {
        // body
        partMatrix *= translate(0.0, -1.25, 0.0) * scale(1.0, 1.5, 0.5);
    } else if (part == 2 || part == 3) {
        // arms
        partMatrix *= rotateX(radians(10.0)); // TODO: add uniform, also rotate outwards
        partMatrix *= translate(0.0, -1.25, 0.0);
        partMatrix *= scale(0.5, 1.5, 0.5);
        partMatrix *= translate(part == 2 ? -1.5 : +1.5, 0.0, 0.0);
    }

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * partMatrix * vec4(position.xyz, 1.0);

    vUv = uv;
}

