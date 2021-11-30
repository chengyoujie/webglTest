precision mediump float;
varying vec3 vColor;
uniform vec2 uColor;
varying vec2 vUv;
uniform sampler2D uSampler;
void main(){
    gl_FragColor = texture2D(uSampler, vUv);
}