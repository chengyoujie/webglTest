precision mediump float;
varying vec3 vColor;
varying vec2 vUv;
uniform vec3 uColor;
uniform sampler2D uSampler;
void main(){
    gl_FragColor = texture2D(uSampler, vUv)+vec4(uColor, 1.0);
}