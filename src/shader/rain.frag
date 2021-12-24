precision mediump float;
uniform sampler2D uBgSampler;
uniform sampler2D uRainSampler;
uniform vec2 uSize;

/**将两种颜色进行混合 */
vec4 blend(vec4 bg,vec4 fg){
  vec3 bgm=bg.rgb*bg.a;
  vec3 fgm=fg.rgb*fg.a;
  float ia=1.0-fg.a;
  float a=(fg.a + bg.a * ia);
  vec3 rgb;
  if(a!=0.0){
    rgb=(fgm + bgm * ia) / a;
  }else{
    rgb=vec3(0.0,0.0,0.0);
  }
  return vec4(rgb,a);
}
//根据当前的像素位置，转换成0-1的uv坐标
vec2 texCoord(){
    return vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y)/uSize;
}


void main(){
    vec2 uv = texCoord();//当前屏幕像素的位置
    vec4 bg = texture2D(uBgSampler, uv);//0-1
    // vec4 bg = vec4(1.0, 0.0, 0.0, 1.0);//0-1
    vec4 rain = texture2D(uRainSampler, uv);
    
    vec2 refraction = (vec2(rain.g, rain.r) - 0.5)*2.0;//转换成 剪裁坐标 -1~1
    vec2 refractionPos = uv + (1.0/uSize * refraction *(256.0));//当前uv+ (折射像素的范围)/宽高 * rain中g,r的位置(-1,1)

    vec4 tex = texture2D(uBgSampler, refractionPos);

    vec4 fg = vec4(tex.rgb * 1.04, clamp(rain.a*6.0-3.0, 0.0, 1.0));//rgb*1.04 对水珠提亮，  clamp(a*6-3) 对alpha进行过滤 0-0.5（3/6)部分滤掉， 0.5-0.6[3/6-(3+1)/6]部分显示透明度，0.6之后显示1

    gl_FragColor = blend(bg, fg);
}