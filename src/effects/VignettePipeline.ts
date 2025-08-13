import Phaser from 'phaser';

// This is the corrected GLSL shader for the vignette effect.
const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define highp highp
#else
#define highp mediump
#endif

precision highp float;

// Uniforms passed from our TypeScript code.
uniform sampler2D uMainSampler; // The final rendered scene texture.
uniform vec2 uResolution;      // The width and height of the game screen.
uniform float uInnerRadius;    // The radius of the fully bright inner circle.
uniform float uOuterRadius;    // The radius where the darkness is total.

void main() {
    // Get the coordinate of the current pixel, normalized from 0.0 to 1.0.
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // Sample the original color from the scene texture.
    vec4 originalColor = texture2D(uMainSampler, uv);

    // --- CORRECTED Vignette Calculation ---
    // Calculate the distance of the current pixel from the center of the screen (0.5, 0.5).
    float dist = distance(uv, vec2(0.5, 0.5));

    // Calculate the vignette factor.
    // smoothstep returns 0.0 if dist < uInnerRadius, 1.0 if dist > uOuterRadius,
    // and a smooth blend in between.
    // By subtracting this from 1.0, we get a multiplier that is 1.0 in the center
    // and falls off to 0.0 at the edges. This is the correct logic.
    float vignette = 1.0 - smoothstep(uInnerRadius, uOuterRadius, dist);

    // Multiply the original color by the vignette factor.
    vec3 finalColor = originalColor.rgb * vignette;

    // Set the final pixel color, keeping the original alpha.
    gl_FragColor = vec4(finalColor, originalColor.a);
}
`;

/**
 * @class VignettePipeline
 * @description A custom Post FX Pipeline that applies a soft, dark border to the screen,
 * helping to focus the player's attention on the center of the action.
 */
export class VignettePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    // We now have two properties to control the vignette's size and softness.
    private _innerRadius: number;
    private _outerRadius: number;

    constructor(game: Phaser.Game) {
        super({
            game: game,
            fragShader: fragmentShader,
        });

        // Set good default values for a noticeable but not overpowering effect.
        this._innerRadius = 0.55; // The bright center circle is 55% of the screen's diagonal.
        this._outerRadius = 0.8; // The effect fully fades to black at 80% of the diagonal.
    }

    /**
     * @method onPreRender
     * @description Passes updated data to the shader's uniforms before rendering.
     */
    onPreRender() {
        this.set1f('uInnerRadius', this._innerRadius);
        this.set1f('uOuterRadius', this._outerRadius);
        this.set2f('uResolution', this.renderer.width, this.renderer.height);
    }

    // Getters and setters for dynamic control.
    get innerRadius(): number {
        return this._innerRadius;
    }
    set innerRadius(value: number) {
        this._innerRadius = value;
    }

    get outerRadius(): number {
        return this._outerRadius;
    }
    set outerRadius(value: number) {
        this._outerRadius = value;
    }
}
