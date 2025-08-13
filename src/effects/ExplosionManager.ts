import Phaser, { Scene } from 'phaser';

/**
 * @class ExplosionManager
 * @description Centralizes all visual effects for explosions, debris, and now, impacts.
 * This keeps the Game scene cleaner and makes it easy to create consistent, high-quality effects.
 */
export class ExplosionManager {
    private scene: Scene;
    private debrisGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Scene) {
        this.scene = scene;
        this.debrisGroup = this.scene.physics.add.group();
    }

    /**
     * @method createImpactEffect
     * @description Creates a small, satisfying spark effect at a given position.
     * This is called when a laser hits an enemy to provide better visual feedback.
     * @param {number} x - The x-coordinate of the impact.
     * @param {number} y - The y-coordinate of the impact.
     */
    public createImpactEffect(x: number, y: number): void {
        // We can reuse the 'engine-particle' for our sparks. It's a good, small, glowing dot.
        const particles = this.scene.add.particles(x, y, 'engine-particle', {
            speed: { min: -100, max: 100 }, // Sparks fly out in all directions.
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 }, // Sparks shrink to nothing.
            blendMode: 'ADD', // Additive blending makes them glow brightly.
            lifespan: 200, // Sparks are very short-lived.
            gravityY: 0,
            quantity: 5, // A small burst of 5 sparks.
        });

        // The emitter will fire its burst of particles and then be removed from the scene.
        particles.explode(5);
    }

    /**
     * @method createExplosion
     * @description Creates a full explosion effect with a core flash and flying debris.
     * @param {number} x - The x-coordinate of the explosion.
     * @param {number} y - The y-coordinate of the explosion.
     * @param {string} textureKey - The texture key of the object that exploded, used to determine debris type.
     */
    public createExplosion(x: number, y: number, textureKey: string): void {
        this.createCoreFlash(x, y);
        this.createDebris(x, y, textureKey);
        this.scene.sound.play('explosion-sound', { volume: 0.4 });
    }

    private createCoreFlash(x: number, y: number): void {
        const flash = this.scene.add.circle(x, y, 5, 0xffffff, 1);
        flash.setBlendMode('ADD'); // Make the core flash glow intensely.

        this.scene.tweens.add({
            targets: flash,
            radius: { from: 10, to: 60 },
            alpha: { from: 1, to: 0 },
            duration: 150,
            onComplete: () => {
                flash.destroy();
            },
        });
    }

    private createDebris(x: number, y: number, textureKey: string): void {
        if (textureKey === 'enemy-medium') {
            this.spawnDebrisParticle(x, y, 'part-cockpit-red', { min: 0.3, max: 0.5 });
            const wingCount = Phaser.Math.Between(2, 4);
            for (let i = 0; i < wingCount; i++) {
                this.spawnDebrisParticle(x, y, 'part-wing-red', { min: 0.3, max: 0.6 });
            }
        } else if (textureKey === 'enemy-big') {
            const debrisCount = Phaser.Math.Between(6, 10);
            for (let i = 0; i < debrisCount; i++) {
                const partKey = Phaser.Math.RND.pick(['meteor-tiny-1', 'meteor-tiny-2']);
                this.spawnDebrisParticle(x, y, partKey, { min: 0.8, max: 1.2 });
            }
        } else {
            const debrisCount = Phaser.Math.Between(4, 8);
            for (let i = 0; i < debrisCount; i++) {
                const partKey = Phaser.Math.RND.pick([
                    'part-generic-1',
                    'part-generic-2',
                    'part-generic-3',
                ]);
                this.spawnDebrisParticle(x, y, partKey, { min: 0.3, max: 0.6 });
            }
        }
    }

    private spawnDebrisParticle(
        x: number,
        y: number,
        texture: string,
        scaleRange: { min: number; max: number },
    ): void {
        const debris = this.debrisGroup.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
        if (!debris.body) return;

        debris.setScale(Phaser.Math.FloatBetween(scaleRange.min, scaleRange.max));
        debris.setTint(0xaaaaaa); // Debris should not be full brightness.

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
