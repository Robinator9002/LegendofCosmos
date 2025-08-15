import Phaser from 'phaser';
import { IEnemyType } from '../data/EnemyTypes';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { EngineTrail, IEngineTrailConfig } from '../effects/EngineTrail';
import { ExplosionManager } from '../effects/ExplosionManager'; // Import the ExplosionManager

/**
 * @class Enemy
 * @description Represents a generic enemy, now with enhanced hit-feedback mechanics.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;
    private engineTrail?: EngineTrail;

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
            const enemyTrailConfig: IEngineTrailConfig = {
                tint: { start: 0xff8800, end: 0xff0000 },
                scale: {
                    x: { start: 1.0, end: 0 },
                    y: { start: 0.5, end: 0 },
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
        
        // Should be applied to every Enemy
        this.setTint(0xaaaaaa);
    }

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
     * @method handleHit
     * @description --- NEW --- Triggers all visual feedback for when the enemy is hit.
     * @param {ExplosionManager} explosionManager - A reference to the scene's explosion manager.
     */
    public handleHit(explosionManager: ExplosionManager): void {
        // 1. Create the small hit explosion.
        explosionManager.createHitExplosion(this.x, this.y);

        // 2. Trigger a short, intense shake tween on the enemy sprite.
        // This makes the hit feel physically impactful.
        this.scene.tweens.add({
            targets: this,
            props: {
                x: { value: `+=${Phaser.Math.Between(-5, 5)}`, duration: 40 },
                y: { value: `+=${Phaser.Math.Between(-5, 5)}`, duration: 40 },
            },
            ease: 'Power1',
            yoyo: true, // The shake will automatically return to the original position.
            repeat: 1,
        });
    }

    destroy(fromScene?: boolean): void {
        if (this.engineTrail) {
            this.engineTrail.destroy();
        }
        super.destroy(fromScene);
    }
}
