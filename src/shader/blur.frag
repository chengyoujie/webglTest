precision mediump float;
uniform sampler2D uBgSampler;
uniform vec2 uSize;

//根据当前的像素位置，转换成0-1的uv坐标
vec2 texCoord(){
    // return vec2(gl_FragCoord.x,  uSize.y - gl_FragCoord.y)/uSize;
    return vec2(gl_FragCoord.x,  gl_FragCoord.y)/uSize;
}

void main()
{
    vec2 uv = texCoord();
	vec4 color = vec4(0.0);
	const int seg = 5;
	float f = 0.0;
	float dv = 2.0/800.0;
	float tot = 0.0;
	for(int i=-seg; i <= seg; i++)
	{
		for(int j = -seg; j <= seg; j++)
		{
			f = float(1.1 - sqrt(float(i*i + j*j))/8.0);
			f *= f;
			tot += f;
			color += texture2D(uBgSampler, vec2(uv.x + float(j) * dv, uv.y + float(i) * dv) ).rgba * f;
		}
	}
	color /= tot;
	gl_FragColor = color;
}
