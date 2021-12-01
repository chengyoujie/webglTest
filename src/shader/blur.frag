precision mediump float;
uniform sampler2D uSampler;
varying vec2 vUv;
uniform vec2 uSize;

void main(){
    vec4 color = vec4(0.0);
	const float seg = 5.0;
	float f = 0.0;
	float dv = 2.0/512.0;
	float tot = 0.0;
	for(float i=-seg; i <= seg; ++i)
	{
		for(float j = -seg; j <= seg; ++j)
		{
			f = (1.1 - sqrt(i*i + j*j)/8.0);
			f *= f;
			tot += f;
			color += texture2D( uSampler, vec2(vUv.x + j * dv, vUv.y + i * dv) ).rgba * f;
		}
	}
	color /= tot;
	gl_FragColor = color;
}