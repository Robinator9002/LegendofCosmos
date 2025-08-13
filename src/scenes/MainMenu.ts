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

        // --- FINAL Background Layer Composition using Additive Blending ---
        // This logic mirrors the Game scene to create a bright, consistent look,
        // but uses slower speeds for a more cinematic feel on the menu.

        // Layer 1 (Base Layer): A solid, dark layer of stars. This is our canvas.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.05, // Very slow for the menu.
            tint: 0x444444, // A dark, subtle base.
            blendMode: 'NORMAL',
        });

        // Layer 2 (Additive): A brighter layer that ADDS its light to the base.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.2,
            tint: 0xbbbbbb, // Bright tint.
            blendMode: 'ADD', // This is the key to making the stars pop.
        });

        // Layer 3 (Additive, Foreground): The fastest and brightest layer.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.4,
            tint: 0xffffff, // Full brightness.
            blendMode: 'ADD',
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
