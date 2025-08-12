import { Scene } from 'phaser';

export class MainMenu extends Scene {
    background: Phaser.GameObjects.TileSprite;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add
            .tileSprite(0, 0, this.scale.width, this.scale.height, 'scrolling-background')
            .setOrigin(0, 0);

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
            //this.sound.play('music', { loop: true, volume: 0.5 }); Remove Music for now
            this.scene.start('Game');
        });
    }

    update() {
        this.background.tilePositionY -= 0.5;
    }
}
