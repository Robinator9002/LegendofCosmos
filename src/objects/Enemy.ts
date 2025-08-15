import Phaser from 'phaser';
import { IEnemyType } from '../data/EnemyTypes';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { EngineTrail, IEngineTrailConfig } from '../effects/EngineTrail'; // Import the unified trail class

/**
 * @class Enemy
 * @description Represents a generic enemy, now with its own dynamic engine trail.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;
    private engineTrail?: EngineTrail; // The trail is optional and uses the new class.

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
            this.setTint(0xaaaaaa);

            // --- FINAL ENEMY TRAIL CONFIG ---
            const enemyTrailConfig: IEngineTrailConfig = {
                tint: { start: 0xff8800, end: 0xff0000 },
                // --- FIX: Restructured the 'scale' property to match the new interface.
                // This gives the enemy trail a slightly thicker, more powerful streak effect.
                scale: {
                    x: { start: 1.0, end: 0 }, // Starts slightly less wide than the player's
                    y: { start: 0.5, end: 0 }, // but a bit thicker
                },
                lifespan: 500,
                frequency: 60,
                idleFrequency: 150,
                idle: { speed: 40 },
                moving: { speed: { min: 100, max: 150 } },
                spawnOffset: 30,
                rotationSpeed: Math.PI * 2,
                spread: 20,
                pivot: 'dynamic',
            };

            this.engineTrail = new EngineTrail(this.scene, this, enemyTrailConfig);
        }
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
            this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.setAngularVelocity(Phaser.Math.Between(-50, 50));
            const hitboxRadius = (this.width * 0.8) / 2;
            this.body.setCircle(hitboxRadius);
            const offset = (this.width - hitboxRadius * 2) / 2;
            this.body.setOffset(offset, offset);
        }
    }

    /**
     * @method preUpdate
     * @description The enemy's update loop.
     * @param {number} time - The current game time (unused, but required by method signature).
     * @param {number} delta - The time elapsed since the last frame.
     */
    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        if (this.engineTrail) {
            this.engineTrail.update(delta);
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
