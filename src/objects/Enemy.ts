import Phaser from 'phaser';
import { IEnemyType } from '../data/EnemyTypes'; // Import our new data structure

// The Enemy class now represents a generic enemy sprite.
// It is configured by the IEnemyType data passed into its constructor,
// making it highly flexible and removing the need for hardcoded logic.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    // --- Class Properties ---
    private health: number;

    // The constructor now accepts the full enemy data object.
    constructor(scene: Phaser.Scene, x: number, y: number, enemyData: IEnemyType) {
        // We pass the texture from the data object to the parent Sprite class.
        super(scene, x, y, enemyData.texture);

        // We can immediately set the health from the data.
        this.health = enemyData.health;

        // The 'setData' method is a clean way to store arbitrary data on a GameObject.
        // We'll store the score value here to be retrieved when the enemy is destroyed.
        this.setData('scoreValue', enemyData.scoreValue);
    }

    // The initialize method is now much cleaner. It simply applies the
    // remaining properties from the data object.
    public initialize(enemyData: IEnemyType): void {
        // This check is crucial. It ensures the physics body has been created by the
        // group before we try to manipulate it.
        if (!this.body) {
            console.error('Enemy body not found during initialization.');
            return;
        }

        // Apply scale and a random speed from the defined range.
        this.setScale(enemyData.scale);
        this.setVelocityY(Phaser.Math.Between(enemyData.speed.min, enemyData.speed.max));
    }

    // This method remains unchanged. It handles taking damage and destruction.
    public takeDamage(damage: number): void {
        this.health -= damage;

        if (this.health <= 0) {
            this.destroy();
        }
    }
}
