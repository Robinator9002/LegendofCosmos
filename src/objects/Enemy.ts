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

        // Apply effects based on enemy type in a data-driven way.
        if (enemyData.key === 'enemy-big') {
            // Asteroids get the custom shader.
            const pipeline = (
                this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer
            ).pipelines.get('Asteroid') as AsteroidPipeline;
            if (pipeline) {
                this.setPostPipeline(pipeline);
            }
        } else {
            // All other enemies get a standard tint and an engine trail.
            this.setTint(0xaaaaaa);

            // Define a configuration for the enemy's trail to make it less powerful than the player's.
            const enemyTrailConfig: IEngineTrailConfig = {
                tint: { start: 0xffaaaa, end: 0xff0000 }, // A menacing red glow.
                scale: { start: 0.5, end: 0 }, // Smaller than the player's.
                speed: { min: 50, max: 90 }, // Slower particles.
                lifespan: 400, // A shorter trail.
                frequency: 90, // Less frequent particles.
            };

            // Create an instance of our new, unified EngineTrail class.
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
     * @method update
     * @description The enemy's update loop, called automatically by the physics group.
     */
    // CORRECTED: Prefixed unused parameters with an underscore to resolve the warnings.
    update(_time: number, _delta: number): void {
        // We must update the engine trail every frame to make it follow the enemy.
        if (this.engineTrail) {
            this.engineTrail.update();
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
        // This is the crucial fix for the "ghost trail" problem.
        if (this.engineTrail) {
            this.engineTrail.destroy();
        }
        super.destroy(fromScene);
    }
}
