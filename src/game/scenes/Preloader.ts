import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  Display a background and a progress bar
        this.add.image(512, 384, 'background');
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        //  Set the base path for assets
        this.load.setPath('assets');

        // --- Load Game Assets ---

        // Background
        this.load.image('scrolling-background', 'Backgrounds/darkPurple.png');

        // Player
        this.load.image('player', 'PNG/Player/playerShip1_blue.png');

        // Enemies
        this.load.image('enemy-medium', 'PNG/Enemies/enemyRed3.png');
        this.load.image('enemy-big', 'PNG/Meteors/meteorBrown_big1.png');

        // Lasers
        this.load.image('laser', 'PNG/Lasers/laserBlue01.png');

        // --- Load Debris and Effect Assets ---
        // Ship Parts
        this.load.image('part-wing-red', 'PNG/Parts/wingRed_0.png');
        this.load.image('part-cockpit-red', 'PNG/Parts/cockpitRed_0.png');

        // Meteor Parts (NEW)
        this.load.image('meteor-tiny-1', 'PNG/Meteors/meteorBrown_tiny1.png');
        this.load.image('meteor-tiny-2', 'PNG/Meteors/meteorBrown_tiny2.png');

        // Generic Parts (for future use)
        this.load.image('part-generic-1', 'PNG/Parts/spaceParts_015.png');
        this.load.image('part-generic-2', 'PNG/Parts/spaceParts_025.png');
        this.load.image('part-generic-3', 'PNG/Parts/spaceParts_035.png');

        // Smoke Cloud Effect
        this.load.image('fire0', 'PNG/Effects/fire00.png');

        // Audio
        // this.load.audio('music', 'Bonus/music.wav');
        this.load.audio('laser-sound', 'Bonus/sfx_laser1.ogg');
        this.load.audio('explosion-sound', 'Bonus/death.wav');
        this.load.audio('gameover-sound', 'Bonus/sfx_lose.ogg');
    }

    create() {
        //  Animations are no longer needed here since the ExplosionManager handles effects dynamically.
        this.scene.start('MainMenu');
    }
}
