import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in width from 0 to 460 as assets load.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 464 * progress)
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // Background
        this.load.image('scrolling-background', 'Backgrounds/darkPurple.png');

        // Player
        this.load.image('player', 'PNG/Player/playerShip1_blue.png');

        // Enemies
        this.load.image('enemy-medium', 'PNG/Enemies/enemyRed3.png');
        this.load.image('enemy-big', 'PNG/Meteors/meteorBrown_big1.png');

        // Lasers
        this.load.image('laser', 'PNG/Lasers/laserBlue01.png');

        // Explosions
        this.load.spritesheet('explosion', 'PNG/Effects/spaceEffects_004.png', {
            frameWidth: 98, // Adjust based on your spritesheet
            frameHeight: 97,
        });

        // Audio
        this.load.audio('music', 'Bonus/music.wav');
        this.load.audio('laser-sound', 'Bonus/sfx_laser1.ogg');
        this.load.audio('explosion-sound', 'Bonus/death.wav');
        this.load.audio('gameover-sound', 'Bonus/sfx_lose.ogg');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global animations here that the rest of the game can use.
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 15,
            }),
            frameRate: 24,
            repeat: 0,
            hideOnComplete: true,
        });

        //  Move to the MainMenu. You could also jump straight to the Game Scene
        this.scene.start('MainMenu');
    }
}
