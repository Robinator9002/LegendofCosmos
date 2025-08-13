import { Scene, GameObjects, Math as pMath } from 'phaser';

/**
 * @interface IEngineTrailConfig
 * @description Defines the configurable properties for an engine trail, allowing for different visual styles.
 */
export interface IEngineTrailConfig {
    tint: { start: number; end: number };
    scale: { start: number; end: number };
    speed: { min: number; max: number };
    lifespan: number;
    frequency: number;
}

/**
 * @class EngineTrail
 * @description Manages a sophisticated particle emitter for a ship's engine trail.
 * The trail's angle dynamically adjusts based on the target's velocity.
 */
export class EngineTrail {
    private scene: Scene;
    private emitter: GameObjects.Particles.ParticleEmitter;
    private target: GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body }; // Ensure target has a body
    private lifespan: number; // Store the lifespan locally to avoid type issues.

    constructor(scene: Scene, target: GameObjects.Sprite, config: IEngineTrailConfig) {
        this.scene = scene;
        this.target = target as any; // Cast to ensure body property is accessible
        this.lifespan = config.lifespan; // Store the lifespan from the config.

        this.emitter = this.scene.add.particles(0, 0, 'engine-particle', {
            speed: config.speed,
            scale: config.scale,
            lifespan: this.lifespan, // Use the stored value.
            tint: config.tint,
            frequency: config.frequency,
            quantity: 1,
            blendMode: 'ADD',
            // The angle is now controlled dynamically in the update method.
        });
    }

    /**
     * @method update
     * @description Called every frame to update the emitter's position and angle.
     */
    public update(): void {
        if (!this.target.active) {
            // If the target is no longer active, stop emitting.
            this.emitter.stop();
            return;
        }

        // Keep the emitter positioned at the back of the target sprite.
        this.emitter.setPosition(this.target.x, this.target.y + this.target.displayHeight / 2);

        // --- DYNAMIC ANGLE CALCULATION ---
        // This is the core of the new "banking" effect.
        const velocity = this.target.body.velocity;
        if (velocity.length() > 0) {
            // We get the angle of the ship's velocity vector.
            const angle = velocity.angle();
            // We convert it from radians to degrees and make it point opposite to the velocity.
            // The +90 degrees corrects for Phaser's coordinate system (0 degrees is to the right).
            this.emitter.setAngle(pMath.RadToDeg(angle) + 90);
        } else {
            // If the ship is not moving, the trail points straight down.
            this.emitter.setAngle(90);
        }
    }

    /**
     * @method destroy
     * @description Stops and removes the particle emitter, allowing existing particles to fade out.
     */
    public destroy(): void {
        this.emitter.stop();
        // CORRECTED AGAIN: We now use the locally stored 'lifespan' property,
        // which is guaranteed to be a simple number, resolving the type error.
        this.scene.time.delayedCall(this.lifespan, () => {
            this.emitter.destroy();
        });
    }
}
