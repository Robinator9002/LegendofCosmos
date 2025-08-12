import { Scene } from 'phaser';

export class GameOver extends Scene {
    score: number;

    constructor() {
        super('GameOver');
    }

    init(data: { score: number }) {
        // Store the score passed from the Game scene
        this.score = data.score;
    }

    create() {
        // --- Scene Styling ---
        // Instead of a solid red, we'll use a dark tint on the main camera
        // to create a somber but not jarring mood.
        this.cameras.main.setBackgroundColor(0x000000);

        // Use a background image that we know is loaded from the Preloader.
        // This fixes the "asset not found" error.
        this.add.image(512, 384, 'stars-background-contrast').setAlpha(0.4);

        // A semi-transparent overlay to help the text stand out.
        this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.5);

        // --- UI Text ---
        // Consistent styling with the rest of the game's UI.
        this.add
            .text(512, 280, 'Game Over', {
                fontFamily: 'Arial Black',
                fontSize: 72,
                color: '#ff4444', // A more dramatic red color for the title
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center',
            })
            .setOrigin(0.5);

        this.add
            .text(512, 384, `Your Score: ${this.score}`, {
                fontFamily: 'Arial',
                fontSize: 48,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);

        // Add a pulsing effect to the "Restart" text to guide the player.
        const restartText = this.add
            .text(512, 500, 'Click to Restart', {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: restartText,
            alpha: 0.5,
            ease: 'Cubic.easeInOut',
            duration: 1000,
            yoyo: true,
            repeat: -1,
        });

        // --- Input Handling ---
        // Go back to the MainMenu scene on a click/tap.
        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
