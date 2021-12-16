precision mediump float;
uniform sampler2D uBgSampler;
uniform sampler2D uMainSampler;
varying vec2 vUv;
uniform vec2 uSize;
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

vec2 texCoord(){
    return vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y)/uSize;
}


void main(){
    vec2 uv = texCoord();
    vec4 bg = texture2D(uBgSampler, uv);//0-1
    vec4 color = texture2D(uMainSampler, uv);
    
    vec2 ref = (vec2(color.r, color.b) - 0.5)*2.0;
    vec2 refPos = uv + (1.0/uSize * ref *(256.0 + (color.b * 256.0)));

    vec4 tex = texture2D(uBgSampler, refPos);

    vec4 fg = vec4(tex.rgb * 1.04, clamp(color.a*6.0-3.0, 0.0, 1.0));

    gl_FragColor = blend(bg, fg);
}