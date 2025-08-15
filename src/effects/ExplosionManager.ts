import Phaser, { Scene } from 'phaser';
import { IDebrisConfig } from '../data/types'; // Import the new data interface

/**
 * @class ExplosionManager
 * @description Centralizes all visual effects for explosions, now fully data-driven.
 */
export class ExplosionManager {
    private scene: Scene;
    private debrisGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Scene) {
        this.scene = scene;
        this.debrisGroup = this.scene.physics.add.group();
    }

    public createImpactEffect(x: number, y: number): void {
        const particles = this.scene.add.particles(x, y, 'engine-particle', {
            angle: { min: 60, max: 120 },
            speed: { min: 200, max: 350 },
            quantity: 20,
            lifespan: 400,
            scale: { start: 1.0, end: 0 },
            blendMode: 'ADD',
            tint: { start: 0xaaaaff, end: 0x0000ff },
        });

        particles.explode(20);
    }

    /**
     * @method createExplosion
     * @description Creates a full explosion effect based on a configuration object.
     * @param {number} x - The x-coordinate of the explosion.
     * @param {number} y - The y-coordinate of the explosion.
     * @param {IDebrisConfig} debrisConfig - The data object defining the debris to spawn.
     */
    public createExplosion(x: number, y: number, debrisConfig: IDebrisConfig): void {
        this.createCoreFlash(x, y, 60, 150);
        this.createDebris(x, y, debrisConfig);
        this.scene.sound.play('explosion-sound', { volume: 0.4 });
    }

    /**
     * @method createHitExplosion
     * @description Creates a smaller, less intense explosion for hit feedback.
     * @param {number} x - The x-coordinate of the hit.
     * @param {number} y - The y-coordinate of the hit.
     * @param {IDebrisConfig} debrisConfig - The data object defining the debris to spawn.
     */
    public createHitExplosion(x: number, y: number, debrisConfig: IDebrisConfig): void {
        this.createCoreFlash(x, y, 20, 80);
        this.createDebris(x, y, debrisConfig);
    }

    private createCoreFlash(x: number, y: number, radius: number, duration: number): void {
        const flash = this.scene.add.circle(x, y, 5, 0xffffff, 1);
        flash.setBlendMode('ADD');

        this.scene.tweens.add({
            targets: flash,
            radius: { from: 10, to: radius },
            alpha: { from: 1, to: 0 },
            duration: duration,
            onComplete: () => {
                flash.destroy();
            },
        });
    }

    /**
     * @method createDebris
     * @description Spawns debris particles based on a configuration object. This is now a generic, reusable method.
     * @param {number} x - The x-coordinate of the spawn point.
     * @param {number} y - The y-coordinate of the spawn point.
     * @param {IDebrisConfig} config - The data object defining the debris.
     */
    private createDebris(x: number, y: number, config: IDebrisConfig): void {
        const quantity =
            typeof config.quantity === 'number'
                ? config.quantity
                : Phaser.Math.Between(config.quantity.min, config.quantity.max);

        for (let i = 0; i < quantity; i++) {
            const partKey = Phaser.Math.RND.pick(config.parts);
            const scale =
                typeof config.scale === 'number'
                    ? config.scale
                    : Phaser.Math.FloatBetween(config.scale.min, config.scale.max);

            this.spawnDebrisParticle(x, y, partKey, scale);
        }
    }

    private spawnDebrisParticle(x: number, y: number, texture: string, scale: number): void {
        const debris = this.debrisGroup.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
        if (!debris.body) return;

        debris.setScale(scale);
        debris.setTint(0xaaaaaa);

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.FloatBetween(200, 400);
        this.scene.physics.velocityFromRotation(angle, speed, debris.body.velocity);

        debris.setAngularVelocity(Phaser.Math.Between(-300, 300));
        (debris.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        this.scene.tweens.add({
            targets: debris,
            alpha: 0,
            duration: 1000,
            delay: 300,
            onComplete: () => {
                debris.destroy();
            },
        });
    }
}
