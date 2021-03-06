export const water = `
    // Adapted from: https://www.shadertoy.com/view/llcXW7

    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;
    uniform vec4 uTextureClamp;
    uniform vec4 uColor;
    uniform vec2 resolution;
    uniform float time;
    uniform vec2 adjustment;

    #define MAX_ITER 5
    #define TAU 6.28318530718

    #define TILING_FACTOR 5.0

    float waterHighlight(vec2 p, float my_time, float foaminess)
    {
        vec2 i = vec2(p);
        float c = 0.0;
        float foaminess_factor = mix(1.0, 6.0, foaminess);
        float inten = .005 * foaminess_factor;

        for (int n = 0; n < MAX_ITER; n++) 
        {
            float t = my_time * (1.0 - (3.5 / float(n+1)));
            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
            c += 1.0/length(vec2(p.x / (sin(i.x+t)),p.y / (cos(i.y+t))));
        }
        c = 0.2 + c / (inten * float(MAX_ITER));
        c = 1.17-pow(c, 1.4);
        c = pow(abs(c), 8.0);
        return c / sqrt(foaminess_factor);
    }

    void main(void) 
    {   
        float my_time = time * 0.0001 + 23.0; // looks worse early on

        vec2 uv = vec2(vTextureCoord.x, vTextureCoord.y - (-max(0.0, -adjustment.y) / resolution.y));
        
        vec2 uv_square = vec2(uv.x * resolution.x / resolution.y, uv.y);
        float dist_center = pow(2.0*length(uv - 0.5), 2.0);
        
        float foaminess = smoothstep(0.4, 1.8, dist_center);
        float clearness = 0.1 + 0.9*smoothstep(0.1, 0.5, dist_center);
        
        vec2 p = mod(uv_square*TAU*TILING_FACTOR, TAU)-250.0;
        
        float c = waterHighlight(p, my_time, foaminess);
        
        vec3 water_color = vec3(0.0, 0.35, 0.5);
        vec3 color = vec3(c);
        color = clamp(color + water_color, 0.0, 1.0);
        
        color = mix(water_color, color, clearness);

        gl_FragColor.r = color.r;
        gl_FragColor.g = color.g;
        gl_FragColor.b = color.b;
        gl_FragColor.a = 0.5;
    }
`;

export const waves = `
    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;
    uniform vec4 uTextureClamp;
    uniform vec4 uColor;
    uniform vec2 resolution;
    uniform float time;

    float distFromCenter() {
        return length(vec2(.5,.5) - vTextureCoord);
    }

    void main(void)
    {
        float dis = distFromCenter();
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        if(gl_FragColor.a > 0.0) {
            gl_FragColor.r = gl_FragColor.r * 0.5 + abs(cos(time/1000.0 + 20.0*dis)) * 0.5;
        }
    }
`;
