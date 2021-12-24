precision mediump float;
uniform sampler2D uBgSampler;
uniform sampler2D uBlurArea;
uniform vec2 uSize;

//根据当前的像素位置，转换成0-1的uv坐标
vec2 texCoord(){
    // return vec2(gl_FragCoord.x,  uSize.y - gl_FragCoord.y)/uSize;
    return vec2(gl_FragCoord.x,  gl_FragCoord.y)/uSize;
}

vec4 blend(vec4 blurArea, vec4 origin, vec4 blur){
    float g = blurArea.g;
    return origin*(1.0-g)+blur*g;;
}

void main(){
    vec2 uv = texCoord();
    vec4 blurArea = texture2D(uBlurArea, uv);
    vec4 origin = texture2D(uBgSampler, uv);
    vec2 offset = 1.0/uSize;
    vec4 color = vec4(0.0);
    float f = 0.0;
    float total = 0.0;
    const int gap = 5;
    const float totaldis = sqrt(float(gap*gap+gap*gap));
    for(int i=-gap; i<=gap; i++){
        for(int j=-gap; j<=gap; j++){
            f = totaldis - sqrt(float(i*i+j*j));
            color += texture2D(uBgSampler, vec2(uv.x+offset.x*float(i), uv.y+offset.y*float(j)) )*f;
            total += f;
        }
    }
    color = color/total;
    gl_FragColor = blend(blurArea, origin, color);
}