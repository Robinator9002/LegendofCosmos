import { Scene } from 'phaser';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';

export class MainMenu extends Scene {
    private parallaxBackground: ParallaxBackground;

    constructor() {
        super('MainMenu');
    }

    create() {
        // --- Background ---
        this.parallaxBackground = new ParallaxBackground(this);
        this.parallaxBackground.addLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.1,
        });
        this.parallaxBackground.addLayer({
            textureKey: 'nebula-background',
            scrollSpeed: -0.5,
            alpha: 0.6,
        });

        // --- Post-Processing ---
        // Apply the bloom effect to the main menu camera for a consistent look.
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
            'Bloom',
            BloomPipeline,
        );
        this.cameras.main.setPostPipeline('Bloom');

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

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    update() {
        this.parallaxBackground.update();
    }
}
