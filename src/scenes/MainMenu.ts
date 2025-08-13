import { Scene } from 'phaser';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';

/**
 * @class MainMenu
 * @description The main menu scene. This is the first interactive screen the player sees.
 * It sets the tone for the game with a visually appealing background and clear instructions.
 */
export class MainMenu extends Scene {
    private parallaxBackground: ParallaxBackground;

    constructor() {
        super('MainMenu');
    }

    create() {
        // --- Background ---
        // We now instantiate our new, more powerful ParallaxBackground class.
        this.parallaxBackground = new ParallaxBackground(this);

        // --- Background Layer Composition ---
        // We will now create a much deeper, multi-layered background with a slow-moving
        // nebula and two distinct starfields for a great parallax effect.

        // Layer 1 (Rearmost): A slow-moving, semi-transparent nebula cloud.
        // This uses the 'addTileSpriteLayer' for a continuous, repeating texture.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'nebula-background',
            scrollSpeed: 0.05, // This is very slow, creating a sense of vast distance.
            alpha: 0.6,
        });

        // Layer 2: A dense field of tiny, slow-moving stars.
        // This uses the new 'addParticleLayer' to create a field of individual,
        // randomly rotated and scaled sprites for a realistic starfield.
        this.parallaxBackground.addParticleLayer({
            textureKey: 'engine-particle', // Using a small, glowing dot texture for stars.
            scrollSpeed: 0.1, // A bit faster than the nebula for a parallax effect.
            count: 150, // A high count for a dense field of distant stars.
            minScale: 0.1,
            maxScale: 0.4,
            minAlpha: 0.3,
            maxAlpha: 0.8,
        });

        // Layer 3 (Foremost): A sparse field of larger, faster-moving stars.
        // This layer is closer to the camera, so its particles are larger, brighter, and faster.
        this.parallaxBackground.addParticleLayer({
            textureKey: 'engine-particle',
            scrollSpeed: 0.2, // Faster still to enhance the illusion of depth.
            count: 40, // A lower count for a sparser field of prominent stars.
            minScale: 0.3,
            maxScale: 0.7,
            minAlpha: 0.6,
            maxAlpha: 1.0,
        });

        // --- Post-Processing ---
        // Apply the bloom effect to the main menu camera for a consistent, polished look.
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
            'Bloom',
            BloomPipeline,
        );
        this.cameras.main.setPostPipeline('Bloom');

        // --- UI Elements ---
        // The title text for the game.
        this.add
            .text(512, 250, 'Legend of Cosmos III', {
                fontFamily: 'Arial Black',
                fontSize: 64,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center',
            })
            .setOrigin(0.5);

        // The call-to-action text to start the game.
        this.add
            .text(512, 450, 'Click to Play', {
                fontFamily: 'Arial',
                fontSize: 38,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);

        // --- Input Handling ---
        // Set up a one-time event listener to start the Game scene when the player clicks.
        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    /**
     * @method update
     * @description The scene's update loop, called every frame.
     */
    update() {
        // This is crucial. We must call the update method of our parallax background
        // instance each frame to make it scroll.
        this.parallaxBackground.update();
    }
}
