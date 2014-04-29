attribute vec4 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float rArmRotateX;
uniform float lArmRotateX;
uniform float rLegRotateX;
uniform float lLegRotateX;

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

mat4 rotateXaround(float a, float x, float y, float z) {
    return translate(x,y,z) * rotateX(a) * translate(-x,-y,-z);
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
        partMatrix *= rotateXaround(part == 2 ? lArmRotateX : rArmRotateX, 0.0, -0.50, 0.0);

        // TODO: also rotate outwards
        partMatrix *= translate(0.0, -1.25, 0.0);
        partMatrix *= scale(0.5, 1.5, 0.5);
        partMatrix *= translate(part == 2 ? -1.5 : +1.5, 0.0, 0.0);
    } else if (part == 4 || part == 5) {
        // legs
        partMatrix *= rotateXaround(part == 4 ? rLegRotateX : lLegRotateX, 0.0, -2.00, 0.0);

        partMatrix *= translate(0.0, -2.75, 0.0);
        partMatrix *= scale(0.5, 1.5, 0.5);
        partMatrix *= translate(part == 4 ? -0.5 : 0.5, 0.0, 0.0);
    }

    gl_Position = projectionMatrix * modelViewMatrix * partMatrix * vec4(position.xyz, 1.0);

    vUv = uv;
}

