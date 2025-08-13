import Phaser from 'phaser';
import { IEnemyType } from '../data/EnemyTypes';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { EnemyEngineTrail } from '../effects/EnemyEngineTrail';

/**
 * @class Enemy
 * @description Represents a generic enemy, configured by data. Now with more accurate hitboxes for asteroids.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;
    private engineTrail?: EnemyEngineTrail; // The trail is optional

    constructor(scene: Phaser.Scene, x: number, y: number, enemyData: IEnemyType) {
        super(scene, x, y, enemyData.texture);
        this.health = enemyData.health;
        this.setData('scoreValue', enemyData.scoreValue);

        // Apply effects based on enemy type in a data-driven way.
        if (enemyData.key === 'enemy-big') {
            const pipeline = (
                this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer
            ).pipelines.get('Asteroid') as AsteroidPipeline;
            if (pipeline) {
                this.setPostPipeline(pipeline);
            }
        } else {
            // Only non-asteroid enemies get an engine trail and a standard tint.
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

        // --- ACCURATE HITBOX CALIBRATION ---
        if (enemyData.key === 'enemy-big') {
            // We've determined through visual debugging that the actual asteroid
            // is about 80% of the texture's full width.
            const hitboxRadius = (this.width * 0.8) / 2;
            this.body.setCircle(hitboxRadius);

            // To center this smaller circle within the larger texture frame,
            // we need to offset it from the top-left corner.
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
        // If this enemy had an engine trail, we must destroy it as well.
        if (this.engineTrail) {
            this.engineTrail.destroy();
        }
        // Call the parent's destroy method to finish the job.
        super.destroy(fromScene);
    }
}
