import { Scene, GameObjects } from 'phaser';

// This class manages the particle emitter for the player's engine trail.
// It creates a visually appealing thrust effect that follows the player's ship.
export class EngineTrail {
    private scene: Scene;
    private emitter: GameObjects.Particles.ParticleEmitter;
    private target: GameObjects.Sprite;

    constructor(scene: Scene, target: GameObjects.Sprite) {
        this.scene = scene;
        this.target = target;

        // --- Corrected Emitter Creation ---
        // The 'this.scene.add.particles' method, when given a full configuration object,
        // is a factory that directly creates and returns a configured ParticleEmitter instance.
        // There is no need to access a separate manager or list.
        // This direct assignment resolves all previous TypeScript errors.
        this.emitter = this.scene.add.particles(0, 0, 'engine-particle', {
            // The speed at which particles are fired. A range creates a more natural look.
            speed: { min: 50, max: 100 },

            // The angle of emission. 90 degrees is straight down from the emitter's origin.
            angle: { min: 85, max: 95 },

            // How the particle's scale changes over its life. It starts larger and shrinks to nothing.
            scale: { start: 0.6, end: 0 },

            // How the particle's transparency changes over its life. It fades out completely.
            alpha: { start: 1, end: 0 },

            // --- Visual Polish ---
            // The lifespan of each particle in milliseconds. Increased for a longer trail.
            lifespan: 400,

            // A color tint that changes over the particle's life.
            // Starts as a hot white-blue and cools to a deep purple, matching the nebula.
            tint: { start: 0x88ddff, end: 0x6600cc },

            // How particles are blended with the scene. 'ADD' creates a bright, glowing effect.
            blendMode: 'ADD',

            // The frequency of particle emission. A lower number means more particles.
            frequency: 80,
        });

        // The emitter will follow the target sprite.
        // The offset positions the trail correctly at the back of the ship's engine.
        this.emitter.startFollow(this.target, 0, this.target.height / 2 - 5);
    }
}
