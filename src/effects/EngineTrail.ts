import { Scene, GameObjects, Math as pMath, GameObjects as GO } from 'phaser';

/**
 * @interface IEngineTrailConfig
 * @description Defines the configurable properties for an engine trail, allowing for different visual styles.
 */
export interface IEngineTrailConfig {
    tint: { start: number; end: number };
    scale: { start: number; end: number };
    lifespan: number;
    frequency: number;
    idleFrequency: number; // The time between particles when idle. Higher is less frequent.
    idle: { speed: number };
    moving: { speed: { min: number; max: number } };
    spawnOffset: number;
    rotationSpeed: number;
    spread: number;
    pivot?: 'static' | 'dynamic';
}

/**
 * @class EngineTrail
 * @description Manages a sophisticated particle emitter for a ship's engine trail.
 */
export class EngineTrail {
    private scene: Scene;
    private emitter: GameObjects.Particles.ParticleEmitter;
    private target: GameObjects.Sprite & { body: Phaser.Physics.Arcade.Body };
    private config: IEngineTrailConfig;
    private currentAngle: number;
    private isMoving: boolean; // State variable to track movement status.

    constructor(scene: Scene, target: GameObjects.Sprite, config: IEngineTrailConfig) {
        this.scene = scene;
        this.target = target as any;
        this.config = config;
        this.currentAngle = this.target.rotation + Math.PI / 2;
        this.isMoving = false; // Assume the ship starts in an idle state.

        this.emitter = this.scene.add.particles(0, 0, 'engine-particle', {
            scale: this.config.scale,
            lifespan: this.config.lifespan,
            tint: this.config.tint,
            quantity: 1,
            blendMode: 'ADD',
            frequency: this.config.idleFrequency, // Start with the idle frequency.
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
            angle: () => {
                const angleInDegrees = pMath.RadToDeg(this.currentAngle);
                const spread = this.config.spread / 2;
                return pMath.FloatBetween(angleInDegrees - spread, angleInDegrees + spread);
            },
        });

        this.emitter.on('emit', (particle: GO.Particles.Particle) => {
            particle.rotation = this.currentAngle;
        });
    }

    /**
     * @method update
     * @description Called every frame to update the emitter's position and smoothly adjust its angle.
     */
    public update(delta: number): void {
        if (!this.target.active || !this.target.body) {
            this.emitter.stop();
            return;
        }

        const velocity = this.target.body.velocity;
        const speed = velocity.length();
        let targetPhysicalAngle: number;

        // --- STATE-BASED FREQUENCY FIX ---
        // PROBLEM: Calling setFrequency every frame reset the emitter's timer, preventing emission.
        // SOLUTION: We now track the movement state and only call setFrequency when the state changes.
        const currentlyMoving = speed > 10;
        if (currentlyMoving !== this.isMoving) {
            this.isMoving = currentlyMoving;
            const newFrequency = this.isMoving ? this.config.frequency : this.config.idleFrequency;
            this.emitter.setFrequency(newFrequency);
        }

        if (this.isMoving) {
            targetPhysicalAngle = velocity.angle() + Math.PI;
        } else {
            targetPhysicalAngle = this.target.rotation + Math.PI / 2;
        }

        const rotationAmount = this.config.rotationSpeed * (delta / 1000);
        this.currentAngle = pMath.Angle.RotateTo(
            this.currentAngle,
            targetPhysicalAngle,
            rotationAmount,
        );

        let spawnAngle: number;
        if (this.config.pivot === 'static') {
            spawnAngle = this.target.rotation + Math.PI / 2;
        } else {
            spawnAngle = this.currentAngle;
        }

        const spawnPoint = new Phaser.Math.Vector2();
        spawnPoint.setToPolar(spawnAngle, this.config.spawnOffset);
        this.emitter.setPosition(this.target.x + spawnPoint.x, this.target.y + spawnPoint.y);
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
