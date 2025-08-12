import { Scene } from 'phaser';
import { ParallaxBackground } from '../../effects/ParallaxBackground'; // Import our new manager

export class MainMenu extends Scene {
    // A property to hold our background manager
    private parallaxBackground: ParallaxBackground;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Instantiate the parallax background manager, just like in the Game scene
        this.parallaxBackground = new ParallaxBackground(this);
        this.parallaxBackground.addLayer('stars-background', 0.25);
        this.parallaxBackground.addLayer('nebula-background', 0.5);

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
            // this.sound.play('music', { loop: true, volume: 0.5 }); // Music disabled for now
            this.scene.start('Game');
        });
    }

    update() {
        // We must call the update method on our manager to make it scroll
        this.parallaxBackground.update();
    }
}
