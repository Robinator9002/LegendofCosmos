import Phaser from 'phaser';

// The Laser class represents a projectile fired by the player.
// It's a simple physics sprite that moves in a straight line.
export class Laser extends Phaser.Physics.Arcade.Sprite {
    // --- Class Properties ---
    private laserSpeed: number = 800;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'laser');
        // Note: We don't need to add the laser to the scene here.
        // The Physics Group that manages these lasers will handle that automatically
        // when we call 'group.add(laser, true)'.
    }

    // The preUpdate method is a built-in Phaser method that runs every frame,
    // just before the main 'update' loop. It's called automatically by the scene
    // or the group this object belongs to.
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // This check ensures the body exists before we try to use it.
        // This is the fix for the "Object is possibly 'null'" error.
        if (!this.body) {
            return;
        }

        // Set the initial upward velocity when the laser is first created.
        // We check if velocity.y is 0 to ensure this only runs once.
        if (this.body.velocity.y === 0) {
            this.body.velocity.y = -this.laserSpeed;
        }
    }
}
