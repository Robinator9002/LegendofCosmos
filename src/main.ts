import { Boot } from './game/scenes/Boot';
import { Game } from './game/scenes/Game';
import { GameOver } from './game/scenes/GameOver';
import { MainMenu } from './game/scenes/MainMenu';
import { Preloader } from './game/scenes/Preloader';
import Phaser from 'phaser';

// This is the main configuration file for your game.
// It's where you define the game's properties, scenes, and physics settings.
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000', // Changed to black for a space theme
    physics: {
        default: 'arcade',
        arcade: {
            // The gravity is set to 0 as this is a top-down shooter.
            gravity: { x: 0, y: 0 },
            debug: false, // Set to true to see physics bodies for debugging
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // The scenes are listed in the order they will be loaded/used.
    // The paths have been corrected to point to the 'src/scenes/' directory.
    scene: [Boot, Preloader, MainMenu, Game, GameOver],
};

// This line creates the new Phaser Game instance and starts the first scene.
export default new Phaser.Game(config);
