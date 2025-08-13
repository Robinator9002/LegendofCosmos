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

        // --- NEW ENGINE TRAIL SETUP ---
        // Define a configuration for the player's trail to make it powerful and visible.
        const playerTrailConfig: IEngineTrailConfig = {
            tint: { start: 0xaaaaff, end: 0x00aaff }, // A bright, hot blue.
            scale: { start: 0.8, end: 0 }, // Starts large and shrinks.
            speed: { min: 80, max: 120 }, // Fast-moving particles.
            lifespan: 500, // A longer-lasting trail.
            frequency: 60, // More frequent particles.
        };

        // Create an instance of our new, unified EngineTrail class.
        this.engineTrail = new EngineTrail(this.scene, this, playerTrailConfig);
    }

    /**
     * @method update
     * @description The main update loop for the player.
     */
    update() {
        this.handleMovement();
        this.handleShooting();

        // We must update the engine trail every frame to make it follow the player
        // and adjust its angle based on velocity.
        if (this.engineTrail) {
            this.engineTrail.update();
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
        // This is the crucial fix for the "ghost trail" problem.
        // When the player is destroyed, we now also explicitly destroy its trail.
        if (this.engineTrail) {
            this.engineTrail.destroy();
        }
        // Call the parent's destroy method to finish the job.
        super.destroy(fromScene);
    }
}
