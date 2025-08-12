import Phaser, { Scene } from 'phaser';

// This class manages all explosion and debris effects for the game.
// By centralizing this logic, we keep the Game scene cleaner and make it easy
// to create consistent, high-quality effects anywhere in the game.
export class ExplosionManager {
    private scene: Scene;
    private debrisGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Scene) {
        this.scene = scene;

        // A dedicated physics group for all debris particles.
        this.debrisGroup = this.scene.physics.add.group();
    }

    // This is the main public method to create a full explosion effect.
    public createExplosion(x: number, y: number, textureKey: string): void {
        this.createCoreFlash(x, y);
        this.createDebris(x, y, textureKey);

        // Play the sound effect from here to keep all explosion logic together.
        this.scene.sound.play('explosion-sound', { volume: 0.4 });
    }

    // Creates the initial bright flash of the explosion.
    private createCoreFlash(x: number, y: number): void {
        const flash = this.scene.add.circle(x, y, 5, 0xffffff, 1);

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

    // Creates the shattering debris effect with more specific logic.
    private createDebris(x: number, y: number, textureKey: string): void {
        // --- Ship Explosion Logic ---
        if (textureKey === 'enemy-medium') {
            // Spawn exactly ONE cockpit, keeping it small.
            this.spawnDebrisParticle(x, y, 'part-cockpit-red', { min: 0.3, max: 0.5 });

            // Spawn 2 to 4 small wing fragments.
            const wingCount = Phaser.Math.Between(2, 4);
            for (let i = 0; i < wingCount; i++) {
                this.spawnDebrisParticle(x, y, 'part-wing-red', { min: 0.3, max: 0.6 });
            }
        }
        // --- Meteor Explosion Logic ---
        else if (textureKey === 'enemy-big') {
            const debrisCount = Phaser.Math.Between(6, 10);
            for (let i = 0; i < debrisCount; i++) {
                const partKey = Phaser.Math.RND.pick(['meteor-tiny-1', 'meteor-tiny-2']);
                // Spawn the meteor parts with a larger scale.
                this.spawnDebrisParticle(x, y, partKey, { min: 0.8, max: 1.2 });
            }
        }
        // --- Default/Player Explosion Logic ---
        else {
            const debrisCount = Phaser.Math.Between(4, 8);
            for (let i = 0; i < debrisCount; i++) {
                const partKey = Phaser.Math.RND.pick([
                    'part-generic-1',
                    'part-generic-2',
                    'part-generic-3',
                ]);
                // Default parts remain small.
                this.spawnDebrisParticle(x, y, partKey, { min: 0.3, max: 0.6 });
            }
        }
    }

    // A helper function to create and animate a single piece of debris.
    // It now accepts an optional scaleRange object to customize debris size.
    private spawnDebrisParticle(
        x: number,
        y: number,
        texture: string,
        scaleRange: { min: number; max: number },
    ): void {
        const debris = this.debrisGroup.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
        if (!debris.body) return;

        // Use the provided scale range to set the size of the debris.
        debris.setScale(Phaser.Math.FloatBetween(scaleRange.min, scaleRange.max));

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
