import Phaser from 'phaser';

// This is the GLSL (OpenGL Shading Language) code for our asteroid effect.
// Shaders are small programs that run on the GPU for every pixel of a sprite.
const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define highp highp
#else
#define highp mediump
#endif

precision highp float;

// --- Uniforms ---
// These are variables passed from our TypeScript code into the shader.
uniform sampler2D uMainSampler; // The original texture of the asteroid sprite.
uniform vec2 uResolution;      // The width and height of the game screen.
uniform float uTime;           // A constantly increasing value for animation.
uniform vec3 uLightColor;      // The color of our simulated light source.
uniform vec2 uLightPosition;   // The position of the light source in screen coordinates.

// --- Noise Function ---
// A simple pseudo-random number generator. Given a 2D coordinate, it returns a
// seemingly random float value between 0.0 and 1.0. This is the basis for
// creating our rocky, bumpy surface.
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// --- Main Shader Program ---
void main() {
    // Get the coordinate of the current pixel.
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // Sample the original color and alpha from the asteroid texture.
    vec4 originalColor = texture2D(uMainSampler, uv);

    // If the original pixel is transparent, we do nothing and discard it.
    // This ensures the shader only affects the asteroid itself, not the empty space around it.
    if (originalColor.a < 0.1) {
        gl_FragColor = originalColor;
        return;
    }

    // --- Procedural Bump Mapping ---
    // We create a "height map" using our random function. The 'uv * 30.0' part
    // scales the noise to create smaller, more detailed bumps.
    float height = random(uv * 30.0 + uTime * 0.1); // Adding time makes the surface shimmer.

    // To create 3D-looking lighting, we need a "normal" vector (a vector that
    // points "out" from the surface). We can approximate this by checking the
    // height of the pixels next to the current one.
    float heightX = random((uv + vec2(1.0 / uResolution.x, 0.0)) * 30.0 + uTime * 0.1);
    float heightY = random((uv + vec2(0.0, 1.0 / uResolution.y)) * 30.0 + uTime * 0.1);
    vec3 normal = normalize(vec3(height - heightX, height - heightY, 0.1));

    // --- Dynamic Lighting ---
    // Calculate the direction from the pixel to the light source.
    vec3 lightDirection = normalize(vec3(uLightPosition, 50.0) - vec3(gl_FragCoord.xy, 0.0));

    // Calculate the diffuse lighting using the dot product. This simulates how
    // light reflects off a rough surface. A larger value means the surface is
    // facing the light more directly.
    float diffuse = max(0.0, dot(normal, lightDirection));

    // --- Final Color Calculation ---
    // We combine the original color with our calculated lighting.
    // The '0.3' is ambient light, ensuring the dark side of the asteroid is still visible.
    // The 'diffuse * 0.7' is the light from our dynamic light source.
    vec3 finalColor = originalColor.rgb * (0.3 + diffuse * 0.7) * uLightColor;

    // Set the final pixel color, keeping the original alpha.
    gl_FragColor = vec4(finalColor, originalColor.a);
}
`;

/**
 * @class AsteroidPipeline
 * @description A custom Post FX Pipeline that applies a dynamic, 3D-looking lighting
 * and bump-mapping effect to a sprite, perfect for making asteroids look realistic.
 */
export class AsteroidPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game: Phaser.Game) {
        super({
            game: game,
            fragShader: fragmentShader,
            // We don't need a render target for this effect.
        });
    }

    /**
     * @method onPreRender
     * @description This method is called by Phaser right before an object with this pipeline is rendered.
     * We use it to pass updated data (like time and resolution) to our shader's uniforms.
     */
    onPreRender() {
        // We make the light's color a bright, slightly warm white.
        this.set3f('uLightColor', 1.0, 1.0, 0.95);

        // We position the light source slightly above and to the left of the screen.
        this.set2f('uLightPosition', this.renderer.width * 0.2, this.renderer.height * 0.2);

        // Pass the current game time (in seconds) to the shader for animation.
        this.set1f('uTime', this.game.loop.time / 1000);

        // Pass the current screen resolution.
        this.set2f('uResolution', this.renderer.width, this.renderer.height);
    }
}
