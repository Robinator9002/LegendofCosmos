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

        // --- UPDATED PLAYER TRAIL CONFIG ---
        // This configuration is now fully compliant with the new IEngineTrailConfig interface.
        const playerTrailConfig: IEngineTrailConfig = {
            tint: { start: 0xaaaaff, end: 0x00aaff },
            scale: { start: 0.8, end: 0 },
            lifespan: 500,
            frequency: 40,
            idle: { speed: 50 },
            moving: { speed: { min: 100, max: 150 } },
            // --- FIX ---
            // Added the two missing properties required by the interface.
            // A larger offset to ensure the trail spawns clearly behind the player model.
            spawnOffset: 40,
            // A very high rotation speed. This makes the player's trail feel extremely
            // responsive and snappy, immediately reacting to changes in direction.
            rotationSpeed: Math.PI * 4, // 720 degrees per second
        };

        // Create an instance of our new, unified EngineTrail class.
        this.engineTrail = new EngineTrail(this.scene, this, playerTrailConfig);
    }

    /**
     * @method preUpdate
     * @description The main update loop for the player. Changed from `update` to `preUpdate`
     * to get access to the `time` and `delta` parameters required by the trail.
     * @param {number} time - The current game time.
     * @param {number} delta - The time elapsed since the last frame.
     */
    preUpdate(time: number, delta: number) {
        // It's important to call the parent's preUpdate method.
        super.preUpdate(time, delta);

        this.handleMovement();
        this.handleShooting();

        // --- FIX ---
        // We now pass the `time` and `delta` arguments to the trail's update method,
        // which resolves the "Expected 2 arguments, but got 0" error.
        if (this.engineTrail) {
            this.engineTrail.update(time, delta);
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
        // When the player is destroyed, we now also explicitly destroy its trail.
        if (this.engineTrail) {
            this.engineTrail.destroy();
        }
        // Call the parent's destroy method to finish the job.
        super.destroy(fromScene);
    }
}
