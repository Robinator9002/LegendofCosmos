import Phaser from 'phaser';

// This GLSL (OpenGL Shading Language) code defines the bloom effect.
const fragShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define highp highp
#else
#define highp mediump
#endif

precision highp float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uStrength;

const int SAMPLES = 5;

float gaussian(float x, float s) {
    return exp(-(x * x) / (2.0 * s * s)) / (s * sqrt(2.0 * 3.14159));
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec3 color = texture2D(uMainSampler, uv).rgb;
    vec3 bloom = vec3(0.0);
    float totalWeight = 0.0;
    
    // Horizontal blur
    for (int i = -SAMPLES; i <= SAMPLES; i++) {
        float offset = float(i);
        float weight = gaussian(offset, float(SAMPLES) / 2.0);
        bloom += texture2D(uMainSampler, uv + vec2(offset / uResolution.x, 0.0)).rgb * weight;
        totalWeight += weight;
    }
    
    // Vertical blur
    for (int i = -SAMPLES; i <= SAMPLES; i++) {
        float offset = float(i);
        float weight = gaussian(offset, float(SAMPLES) / 2.0);
        bloom += texture2D(uMainSampler, uv + vec2(0.0, offset / uResolution.y)).rgb * weight;
        totalWeight += weight;
    }
    
    bloom /= totalWeight * 2.0;
    
    // Threshold to only make bright parts bloom
    bloom = max(bloom - uStrength, 0.0);
    
    // Additive blending
    gl_FragColor = vec4(color + bloom * uIntensity, 1.0);
}
`;

// This class wraps the GLSL shader in a Phaser Post FX Pipeline.
export class BloomPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    private _intensity: number;
    private _strength: number;

    constructor(game: Phaser.Game) {
        super({
            game: game,
            renderTarget: true,
            fragShader: fragShader,
        });

        // --- Corrected Values ---
        // These are much more subtle and will produce a visible glow instead of a white screen.
        this._intensity = 0.6; // How bright the glow is
        this._strength = 0.4; // How much of the original brightness is required to trigger the glow
    }

    onPreRender() {
        this.set2f('uResolution', this.renderer.width, this.renderer.height);
        this.set1f('uIntensity', this._intensity);
        this.set1f('uStrength', this._strength);
    }

    get intensity(): number {
        return this._intensity;
    }

    set intensity(value: number) {
        this._intensity = value;
    }

    get strength(): number {
        return this._strength;
    }

    set strength(value: number) {
        this._strength = value;
    }
}
