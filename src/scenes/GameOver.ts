import { Scene } from 'phaser';

export class GameOver extends Scene {
    score: number;

    constructor() {
        super('GameOver');
    }

    init(data: { score: number }) {
        this.score = data.score;
    }

    create() {
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add
            .text(512, 280, 'Game Over', {
                fontFamily: 'Arial Black',
                fontSize: 64,
                color: '#ffffff',
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

        this.add
            .text(512, 500, 'Click to Restart', {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
