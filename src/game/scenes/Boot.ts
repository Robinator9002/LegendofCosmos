import { Scene } from 'phaser';

// The Boot scene is the first scene that loads in the game.
// Its purpose is to load a minimal number of assets that the Preloader scene can use.
export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    // The preload method is where we load assets.
    preload() {
        //  The Boot scene should load only the assets required for the Preloader scene.
        //  In this case, we'll load a background image for the loading screen.
        //  The path is relative to the 'public/assets' directory set in Preloader.ts.
        this.load.image('background', 'assets/Backgrounds/blue.png');
    }

    // The create method is called once the preload is complete.
    create() {
        //  Once the single asset is loaded, we immediately start the Preloader scene.
        this.scene.start('Preloader');
    }
}
