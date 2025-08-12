import Phaser from 'phaser';

// The Enemy class represents a generic enemy sprite.
// It's designed to be extended or configured for different enemy types.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    // --- Class Properties ---
    private health: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        // Note: We do NOT add the enemy to the scene or physics world here.
        // The physics group in the Game scene will handle that.

        // Initialize health to a default value. It will be set properly in initialize().
        this.health = 1;
    }

    // This initialize method is a crucial part of the object lifecycle.
    // It should be called AFTER the enemy has been added to its physics group.
    // This ensures that the 'body' property exists before we try to use it.
    public initialize(): void {
        if (this.texture.key === 'enemy-big') {
            this.health = 3;
            this.setData('scoreValue', 50);
            this.setVelocityY(Phaser.Math.Between(50, 100));
            this.setScale(0.8);
        } else {
            // 'enemy-medium'
            this.health = 1;
            this.setData('scoreValue', 20);
            this.setVelocityY(Phaser.Math.Between(100, 200));
            this.setScale(0.6);
        }
    }

    // A public method to allow other objects (like lasers) to damage this enemy.
    public takeDamage(damage: number): void {
        this.health -= damage;

        // If health drops to 0 or below, the enemy is destroyed.
        if (this.health <= 0) {
            // 'destroy()' is a built-in Phaser method that removes the GameObject from the scene.
            this.destroy();
        }
    }
}
