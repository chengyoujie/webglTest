attribute vec2 aPos;
attribute vec2 aUv;
attribute vec3 aColor;
varying vec3 vColor;
varying vec2 vUv;
uniform float uTest;
void main(){
    vUv = aUv;
    vColor = aColor*uTest;
    gl_Position = vec4(aPos.xy, 0.0, 1.0);
}