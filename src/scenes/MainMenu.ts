import { Scene } from 'phaser';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';

/**
 * @class MainMenu
 * @description The main menu scene. This is the first interactive screen the player sees.
 * It now uses the same advanced background system as the main game for visual consistency.
 */
export class MainMenu extends Scene {
    private parallaxBackground: ParallaxBackground;

    constructor() {
        super('MainMenu');
    }

    create() {
        // --- Background ---
        // Instantiate the upgraded ParallaxBackground class.
        this.parallaxBackground = new ParallaxBackground(this);

        // --- FINAL Background Layer Composition (Brighter) ---
        // The tint values have been increased to make the overall scene brighter
        // and more visually appealing, per your feedback.

        // Layer 1 (Drawn First -> Perceived as FOREGROUND): Fast, Bright, Opaque.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.5, // Slower than in-game for a tranquil menu.
            tint: 0xffffff, // Full brightness (white).
            alpha: 1.0,
        });

        // Layer 2 (Middle Layer): Medium speed, brighter tint.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.3, // Slower speed.
            tint: 0xcccccc, // A much brighter gray for better visibility.
            alpha: 0.9,
        });

        // Layer 3 (Drawn Last -> Perceived as BACKGROUND): Slow, now much brighter.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.1, // Very slow for a distant feel.
            tint: 0x999999, // A brighter dark gray to make the stars pop.
            alpha: 0.8,
        });

        // --- Post-Processing ---
        // Apply the bloom effect to the main menu camera for a consistent, polished look.
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
            'Bloom',
            BloomPipeline,
        );
        this.cameras.main.setPostPipeline('Bloom');

        // --- UI Elements ---
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

        this.add
            .text(512, 450, 'Click to Play', {
                fontFamily: 'Arial',
                fontSize: 38,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);

        // --- Input Handling ---
        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    /**
     * @method update
     * @description The scene's update loop, called every frame.
     */
    update() {
        // We must call the update method of our parallax background
        // instance each frame to make it scroll.
        this.parallaxBackground.update();
    }
}
