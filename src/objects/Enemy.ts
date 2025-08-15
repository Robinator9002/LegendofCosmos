import Phaser from 'phaser';
import { IEnemyData } from '../data/types';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { EngineTrail } from '../effects/EngineTrail';
import { ExplosionManager } from '../effects/ExplosionManager';

/**
 * @class Enemy
 * @description Represents a generic enemy, now with enhanced hit-feedback mechanics.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    public enemyData: IEnemyData;
    private health: number;
    private engineTrail?: EngineTrail;

    constructor(scene: Phaser.Scene, x: number, y: number, enemyData: IEnemyData) {
        super(scene, x, y, enemyData.texture);

        this.enemyData = enemyData;
        this.health = this.enemyData.health;
        this.setData('scoreValue', this.enemyData.scoreValue);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(this.enemyData.scale);
        this.setVelocityY(Phaser.Math.Between(this.enemyData.speed.min, this.enemyData.speed.max));

        if (this.enemyData.key === 'enemy-big') {
            const pipeline = (
                this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer
            ).pipelines.get('Asteroid') as AsteroidPipeline;
            if (pipeline) {
                this.setPostPipeline(pipeline);
            }
            this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.setAngularVelocity(Phaser.Math.Between(-50, 50));
            if (this.body) {
                const hitboxRadius = (this.width * 0.8) / 2;
                this.body.setCircle(hitboxRadius);
                const offset = (this.width - hitboxRadius * 2) / 2;
                this.body.setOffset(offset, offset);
            }
        } else {
            this.setTint(0xaaaaaa);
        }

        if (this.enemyData.engineTrail) {
            this.engineTrail = new EngineTrail(this.scene, this, this.enemyData.engineTrail);
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
     * @description Triggers all visual feedback for when the enemy is hit.
     * @param {ExplosionManager} explosionManager - A reference to the scene's explosion manager.
     */
    public handleHit(explosionManager: ExplosionManager): void {
        // --- FIX: Pass the specific hit debris data ---
        // We now read the hitDebris configuration from this enemy's data and pass it
        // to the explosion manager, making the effect fully data-driven.
        explosionManager.createHitExplosion(this.x, this.y, this.enemyData.hitDebris);

        this.scene.tweens.add({
            targets: this,
            props: {
                x: { value: `+=${Phaser.Math.Between(-5, 5)}`, duration: 40 },
                y: { value: `+=${Phaser.Math.Between(-5, 5)}`, duration: 40 },
            },
            ease: 'Power1',
            yoyo: true,
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
