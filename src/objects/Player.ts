import Phaser from 'phaser';
import { Laser } from './Laser';
import { EngineTrail, IEngineTrailConfig } from '../effects/EngineTrail'; // Import the new trail class and its config

/**
 * @class Player
 * @description The user's controllable spaceship, now with a much-improved engine trail.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    // --- Class Properties ---
    private moveSpeed: number = 400;
    private lastFired: number = 0;
    private fireRate: number = 250;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private fireKey: Phaser.Input.Keyboard.Key;
    private lasers: Phaser.Physics.Arcade.Group;
    private engineTrail: EngineTrail; // The player now owns and manages its trail.

    constructor(scene: Phaser.Scene, x: number, y: number, lasers: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.lasers = lasers;
        this.setScale(0.75);
        this.setTint(0xaaaaaa);
        this.setCollideWorldBounds(true);

        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.fireKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // --- FINAL PLAYER TRAIL CONFIG ---
        const playerTrailConfig: IEngineTrailConfig = {
            tint: { start: 0xaaaaff, end: 0x00aaff },
            // --- FIX: Restructured the 'scale' property to match the new interface.
            // This creates a "streak" effect by scaling the X and Y axes independently.
            scale: {
                x: { start: 1.2, end: 0 }, // Starts wide
                y: { start: 0.4, end: 0 }, // and short
            },
            lifespan: 500,
            frequency: 40,
            idleFrequency: 200,
            idle: { speed: 50 },
            moving: { speed: { min: 100, max: 150 } },
            spawnOffset: 40,
            rotationSpeed: Math.PI * 4,
            spread: 10,
            pivot: 'static',
        };

        this.engineTrail = new EngineTrail(this.scene, this, playerTrailConfig);
    }

    /**
     * @method preUpdate
     * @description The main update loop for the player.
     * @param {number} time - The current game time (unused, but required by method signature).
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
