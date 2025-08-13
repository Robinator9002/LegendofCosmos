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
            // --- REVISED ENEMY TRAIL CONFIG ---
            // This configuration has been completely overhauled for a more powerful and menacing look.
            const enemyTrailConfig: IEngineTrailConfig = {
                // A fiery orange-to-red gradient. This will look much more "hot" and
                // distinctly red against the dark background.
                tint: { start: 0xff8800, end: 0xff0000 },
                // A larger, more substantial trail.
                scale: { start: 0.7, end: 0 },
                lifespan: 500, // A slightly longer lifespan for a fuller trail.
                frequency: 60, // Emits particles more frequently for a denser look.
                idle: { speed: 40 },
                // Increased speed for a more powerful "high-thrust" appearance.
                moving: { speed: { min: 100, max: 150 } },
                // Spawns the trail slightly behind the ship's model for a more realistic look.
                spawnOffset: 30,
                // A moderate rotation speed (360 degrees per second). This gives the trail
                // a nice "whip" effect without being too jerky.
                rotationSpeed: Math.PI * 2,
            };

            // Create an instance of our new, unified EngineTrail class.
            this.engineTrail = new EngineTrail(this.scene, this, enemyTrailConfig);
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
     * @description The enemy's update loop. Changed from `update` to `preUpdate` to get access
     * to the `time` and `delta` parameters, which are now required by the EngineTrail's update method.
     * @param {number} time - The current game time.
     * @param {number} delta - The time elapsed since the last frame.
     */
    preUpdate(time: number, delta: number): void {
        // It's important to call the parent's preUpdate method.
        super.preUpdate(time, delta);

        // We must update the engine trail every frame, passing along the time and delta
        // values to allow for smooth, frame-rate-independent rotation.
        if (this.engineTrail) {
            this.engineTrail.update(time, delta);
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
