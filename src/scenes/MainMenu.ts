import { Scene } from 'phaser';
import { ParallaxBackground } from '../effects/ParallaxBackground';

export class MainMenu extends Scene {
    private parallaxBackground: ParallaxBackground;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Instantiate the parallax background manager.
        this.parallaxBackground = new ParallaxBackground(this);

        // --- Final Parallax Configuration ---
        // This now matches the Game scene for a seamless transition.
        // It uses the high-contrast starfield for visibility and slower speeds for a majestic feel.
        this.parallaxBackground.addLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.1,
        });
        this.parallaxBackground.addLayer({
            textureKey: 'nebula-background',
            scrollSpeed: -0.5,
            alpha: 0.6,
        });

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
        // We must call the update method on our manager to make it scroll.
        this.parallaxBackground.update();
    }
}
