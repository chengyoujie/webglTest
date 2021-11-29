precision mediump float;
varying vec3 vColor;
uniform vec2 uColor;
void main(){
    gl_FragColor = vec4(vColor, 1.0)+vec4(uColor, 0.0, 1.0);
}