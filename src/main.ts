import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import Phaser from 'phaser';

// This is the main configuration file for your game.
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL, // Ensure we are using WebGL
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, MainMenu, Game, GameOver],
};

// This line creates the new Phaser Game instance and starts the first scene.
export default new Phaser.Game(config);
