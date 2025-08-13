import Phaser from 'phaser';

/**
 * @class Laser
 * @description Represents a projectile fired by the player.
 * It now has a custom hitbox for improved game feel.
 */
export class Laser extends Phaser.Physics.Arcade.Sprite {
    private laserSpeed: number = 800;
    private bodyInitialized: boolean = false; // A flag to ensure setup runs only once.

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'laser');
    }

    /**
     * @method preUpdate
     * @description A built-in Phaser method that runs every frame. We use it here to
     * set up the laser's initial velocity and its custom hitbox.
     * @param {number} time - The current game time.
     * @param {number} delta - The time elapsed since the last frame.
     */
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (!this.body) {
            return;
        }

        // --- ONE-TIME SETUP ---
        // We use a flag to ensure this logic only runs on the very first frame
        // that the laser's physics body exists.
        if (!this.bodyInitialized) {
            // Set the initial upward velocity.
            this.body.velocity.y = -this.laserSpeed;

            // --- CUSTOM HITBOX LOGIC ---
            // We shrink the hitbox to be only the bottom 50% of the sprite's height.
            const newHeight = this.height * 0.5;
            this.body.setSize(this.width, newHeight);

            // We then offset the hitbox downwards so it covers the bottom half.
            this.body.setOffset(0, this.height - newHeight);

            // Set the flag to true so this setup doesn't run again.
            this.bodyInitialized = true;
        }
    }
}
