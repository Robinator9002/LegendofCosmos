import { Scene, GameObjects } from 'phaser';

/**
 * @class EnemyEngineTrail
 * @description Manages the particle emitter for an enemy's engine trail.
 * This is a variation of the player's trail, tailored for a distinct enemy look.
 */
export class EnemyEngineTrail {
    private scene: Scene;
    private emitter: GameObjects.Particles.ParticleEmitter;
    private target: GameObjects.Sprite;

    constructor(scene: Scene, target: GameObjects.Sprite) {
        this.scene = scene;
        this.target = target;

        // Create the particle emitter with properties specific to the enemy trail.
        this.emitter = this.scene.add.particles(0, 0, 'engine-particle', {
            // A slightly wider cone than the player's for a different feel.
            angle: { min: 80, max: 100 },

            // The enemy trail is less powerful and more subtle than the player's.
            speed: { min: 40, max: 80 },
            scale: { start: 0.4, end: 0 },
            lifespan: 300,
            quantity: 1, // Emits one particle at a time for a thinner trail.

            // --- Visual Distinction ---
            // The key difference: the tint gives the trail a menacing red glow.
            tint: { start: 0xffaaaa, end: 0xff0000 },
            blendMode: 'ADD',
            frequency: 100, // A slightly lower frequency than the player's trail.
        });

        // The emitter will follow the target enemy sprite.
        // The offset positions the trail correctly at the back of the enemy ship.
        this.emitter.startFollow(this.target, 0, this.target.height / 2);
    }

    /**
     * @method destroy
     * @description Stops and removes the particle emitter. This should be called when the enemy is destroyed.
     */
    public destroy(): void {
        this.emitter.stop();
        // A short delay before destroying the manager allows existing particles to fade out naturally.
        this.scene.time.delayedCall(500, () => {
            // CORRECTED: The ParticleEmitter is a GameObject and has its own destroy method.
            // This correctly removes it from the scene and its manager.
            this.emitter.destroy();
        });
    }
}
