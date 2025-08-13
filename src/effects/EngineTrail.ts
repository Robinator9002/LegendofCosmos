import { Scene, GameObjects, Math as pMath } from 'phaser';

/**
 * @interface IEngineTrailConfig
 * @description Defines the configurable properties for an engine trail, allowing for different visual styles.
 */
export interface IEngineTrailConfig {
    tint: { start: number; end: number };
    scale: { start: number; end: number };
    lifespan: number;
    frequency: number;
    idle: { speed: number };
    moving: { speed: { min: number; max: number } };
    spawnOffset: number; // How far from the ship's center the trail should spawn.
    rotationSpeed: number; // How quickly the trail's angle should adapt, in radians per second.
}

/**
 * @class EngineTrail
 * @description Manages a sophisticated particle emitter for a ship's engine trail.
 * The trail's angle and intensity now dynamically adjust based on the target's velocity.
 */
export class EngineTrail {
    private scene: Scene;
    private emitter: GameObjects.Particles.ParticleEmitter;
    private target: GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
    private config: IEngineTrailConfig;
    // This now represents the smoothed PHYSICAL angle of the engine's thrust.
    private currentAngle: number;

    constructor(scene: Scene, target: GameObjects.Sprite, config: IEngineTrailConfig) {
        this.scene = scene;
        this.target = target as any;
        this.config = config;

        // Initialize the currentAngle to the ship's physical rear.
        this.currentAngle = this.target.rotation + Math.PI / 2;

        this.emitter = this.scene.add.particles(0, 0, 'engine-particle', {
            scale: this.config.scale,
            lifespan: this.config.lifespan,
            tint: this.config.tint,
            quantity: 1,
            blendMode: 'ADD',
            frequency: this.config.frequency,
            speed: () => {
                if (this.target.body && this.target.body.velocity.length() > 10) {
                    return pMath.Between(
                        this.config.moving.speed.min,
                        this.config.moving.speed.max,
                    );
                } else {
                    return this.config.idle.speed;
                }
            },
        });
    }

    /**
     * @method update
     * @description Called every frame to update the emitter's position and smoothly adjust its angle.
     */
    public update(time: number, delta: number): void {
        if (!this.target.active || !this.target.body) {
            this.emitter.stop();
            return;
        }

        // --- STEP 1: DETERMINE THE TARGET PHYSICAL ANGLE ---
        // This is the direction the engine is ACTUALLY pointing.
        const velocity = this.target.body.velocity;
        const speed = velocity.length();
        let targetPhysicalAngle: number;

        if (speed > 10) {
            // Moving state: The physical rear is opposite to the velocity.
            targetPhysicalAngle = velocity.angle() + Math.PI;
        } else {
            // Idle state: The physical rear is at the "bottom" of the sprite.
            targetPhysicalAngle = this.target.rotation + Math.PI / 2;
        }

        // --- STEP 2: SMOOTH THE PHYSICAL ANGLE ---
        // We smoothly interpolate our current physical angle towards the target physical angle.
        const rotationAmount = this.config.rotationSpeed * (delta / 1000);
        this.currentAngle = pMath.Angle.RotateTo(
            this.currentAngle,
            targetPhysicalAngle,
            rotationAmount,
        );

        // --- STEP 3: CALCULATE SPAWN POINT FROM THE SMOOTHED PHYSICAL ANGLE ---
        // PROBLEM FIXED: The spawn point is now derived from the smoothed physical angle.
        // This ensures the trail's origin moves in sync with its direction, creating a stable pivot point.
        const spawnPoint = new Phaser.Math.Vector2();
        spawnPoint.setToPolar(this.currentAngle, this.config.spawnOffset);
        this.emitter.setPosition(this.target.x + spawnPoint.x, this.target.y + spawnPoint.y);

        // --- STEP 4: CALCULATE THE FINAL VISUAL ANGLE ---
        // PROBLEM FIXED: The visual direction is the physical direction plus the 90-degree asset correction.
        // Because the spawn point is now correctly calculated from the physical rear, this will look correct
        // for all ships, including enemies.
        const visualAngle = this.currentAngle + Math.PI / 2;
        this.emitter.setAngle(pMath.RadToDeg(visualAngle));
    }

    /**
     * @method destroy
     * @description Stops and removes the particle emitter from the scene.
     */
    public destroy(): void {
        this.emitter.stop();
        this.scene.time.delayedCall(this.config.lifespan, () => {
            this.emitter.destroy();
        });
    }
}
