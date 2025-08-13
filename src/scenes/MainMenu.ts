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
        this.parallaxBackground = new ParallaxBackground(this);

        // --- FINAL Background Layer Composition with Rotation ---
        // This logic mirrors the Game scene, using rotation to break up repeating patterns,
        // but with slower speeds for a more tranquil menu screen.

        // Layer 1 (Base Layer):
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.05, // Very slow for the menu.
            tint: 0x444444,
            blendMode: 'NORMAL',
            rotation: 0.2, // A slight rotation.
        });

        // Layer 2 (Additive):
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.2,
            tint: 0xbbbbbb,
            blendMode: 'ADD',
            rotation: -0.5, // A different rotation in the opposite direction.
        });

        // Layer 3 (Additive, Foreground):
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.4,
            tint: 0xffffff,
            blendMode: 'ADD',
            rotation: 1.1, // A more significant rotation.
        });

        // --- Post-Processing ---
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
        this.parallaxBackground.update();
    }
}
