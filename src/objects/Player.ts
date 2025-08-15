import Phaser from 'phaser';
import { Laser } from './Laser';
import { EngineTrail } from '../effects/EngineTrail';
import { gameData } from '../data'; // Import the new master game data object

/**
 * @class Player
 * @description The user's controllable spaceship, now configured from a central data file.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    // --- Class Properties ---
    // These are now initialized from the gameData object.
    private moveSpeed: number;
    private lastFired: number = 0;
    private fireRate: number;

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private fireKey: Phaser.Input.Keyboard.Key;
    private lasers: Phaser.Physics.Arcade.Group;
    private engineTrail: EngineTrail;

    constructor(scene: Phaser.Scene, x: number, y: number, lasers: Phaser.Physics.Arcade.Group) {
        // --- DATA-DRIVEN SETUP ---
        // We pull the player's texture directly from our data file.
        super(scene, x, y, gameData.player.texture);

        // Initialize properties from the gameData object.
        this.moveSpeed = gameData.player.moveSpeed;
        this.fireRate = gameData.player.fireRate;
        this.lasers = lasers;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set scale and other properties from the data file.
        this.setScale(gameData.player.scale);
        this.setTint(0xaaaaaa);
        this.setCollideWorldBounds(true);

        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.fireKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // The entire engine trail is now configured from the data file.
        this.engineTrail = new EngineTrail(this.scene, this, gameData.player.engineTrail);
    }

    /**
     * @method preUpdate
     * @description The main update loop for the player.
     * @param {number} time - The current game time.
     * @param {number} delta - The time elapsed since the last frame.
     */
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        this.handleMovement();
        this.handleShooting();

        if (this.engineTrail) {
            this.engineTrail.update(delta);
        }
    }

    private handleMovement() {
        if (!this.body) {
            return;
        }
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (this.cursors.left.isDown) {
            this.body.velocity.x = -this.moveSpeed;
        } else if (this.cursors.right.isDown) {
            this.body.velocity.x = this.moveSpeed;
        }

        if (this.cursors.up.isDown) {
            this.body.velocity.y = -this.moveSpeed;
        } else if (this.cursors.down.isDown) {
            this.body.velocity.y = this.moveSpeed;
        }
    }

    private handleShooting() {
        if (this.fireKey.isDown && this.scene.time.now > this.lastFired) {
            const laser = new Laser(this.scene, this.x, this.y - 50);
            this.lasers.add(laser, true);
            this.lastFired = this.scene.time.now + this.fireRate;
            this.scene.sound.play('laser-sound', { volume: 0.3 });
        }
    }

    /**
     * @method destroy
     * @description Overrides the default destroy method to also clean up the engine trail.
     * @param {boolean} [fromScene] - Internal Phaser parameter.
     */
    destroy(fromScene?: boolean): void {
        if (this.engineTrail) {
            this.engineTrail.destroy();
        }
        super.destroy(fromScene);
    }
}
