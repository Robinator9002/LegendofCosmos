import Phaser from 'phaser';
import { IEnemyType } from '../data/EnemyTypes';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { EnemyEngineTrail } from '../effects/EnemyEngineTrail';

/**
 * @class Enemy
 * @description Represents a generic enemy, configured by data. Now with tumbling, rotated asteroids.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;
    private engineTrail?: EnemyEngineTrail; // The trail is optional

    constructor(scene: Phaser.Scene, x: number, y: number, enemyData: IEnemyType) {
        super(scene, x, y, enemyData.texture);
        this.health = enemyData.health;
        this.setData('scoreValue', enemyData.scoreValue);

        if (enemyData.key === 'enemy-big') {
            const pipeline = (
                this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer
            ).pipelines.get('Asteroid') as AsteroidPipeline;
            if (pipeline) {
                this.setPostPipeline(pipeline);
            }
        } else {
            this.engineTrail = new EnemyEngineTrail(this.scene, this);
        }
        this.setTint(0xaaaaaa);
    }

    /**
     * @method initialize
     * @description Applies final properties after the enemy has been added to a physics group.
     * @param {IEnemyType} enemyData - The data object defining this enemy's properties.
     */
    public initialize(enemyData: IEnemyType): void {
        if (!this.body) {
            console.error('Enemy body not found during initialization.');
            return;
        }

        this.setScale(enemyData.scale);
        this.setVelocityY(Phaser.Math.Between(enemyData.speed.min, enemyData.speed.max));

        if (enemyData.key === 'enemy-big') {
            // --- ASTEROID ROTATION ---
            // Give the asteroid a random starting angle. This hides the "missing"
            // quadrant of the sprite, making the circular hitbox feel much more natural.
            this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

            // Give the asteroid a slow, random tumble as it moves.
            // This adds to the dynamic feel and further breaks up any visual repetition.
            this.setAngularVelocity(Phaser.Math.Between(-50, 50));

            // Set the calibrated circular hitbox.
            const hitboxRadius = (this.width * 0.8) / 2;
            this.body.setCircle(hitboxRadius);
            const offset = (this.width - hitboxRadius * 2) / 2;
            this.body.setOffset(offset, offset);
        }
    }

    public takeDamage(damage: number): void {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
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
