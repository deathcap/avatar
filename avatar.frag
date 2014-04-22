precision mediump float;

uniform sampler2D skin;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(skin, vUv);
}

