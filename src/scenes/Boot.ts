import { Scene } from 'phaser';

// The Boot scene is the first scene that loads in the game.
export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  This scene now loads the correct, high-contrast starfield.
        //  This asset will be used by the Preloader and MainMenu, ensuring a consistent
        //  and visually correct appearance from the moment the game starts.
        this.load.image('stars-background-contrast', 'assets/Backgrounds/black_contrast.png');
    }

    create() {
        //  Once the asset is loaded, we start the Preloader scene.
        this.scene.start('Preloader');
    }
}
