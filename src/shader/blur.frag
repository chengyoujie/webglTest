precision mediump float;
uniform sampler2D uBgSampler;
uniform vec2 uSize;

//根据当前的像素位置，转换成0-1的uv坐标
vec2 texCoord(){
    return vec2(gl_FragCoord.x,  gl_FragCoord.y)/uSize;
}
void main(){
    vec4 color = texture2D(uBgSampler, texCoord());
	gl_FragColor = vec4(color.rgb, 1.0);
}