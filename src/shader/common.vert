attribute vec2 aPos;
attribute vec3 aColor;
varying vec3 vColor;
void main(){
    vColor = aColor;
    gl_Position = vec4(aPos.xy, 0.0, 1.0);
}