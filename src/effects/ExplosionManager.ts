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
    public createExplosion(x: number, y: number, enemyTextureKey: string): void {
        this.createCoreFlash(x, y);
        this.createDebris(x, y, enemyTextureKey);

        // Play the sound effect from here to keep all explosion logic together.
        this.scene.sound.play('explosion-sound', { volume: 0.4 });
    }

    // Creates the initial bright flash of the explosion.
    private createCoreFlash(x: number, y: number): void {
        const flash = this.scene.add.circle(x, y, 5, 0xffffff, 1);

        // Use the scene's tween manager to animate the flash.
        this.scene.tweens.add({
            targets: flash,
            radius: { from: 10, to: 60 }, // Slightly larger flash
            alpha: { from: 1, to: 0 },
            duration: 150,
            onComplete: () => {
                flash.destroy(); // Clean up the circle when the tween is done.
            },
        });
    }

    // Creates the shattering debris effect.
    private createDebris(x: number, y: number, enemyTextureKey: string): void {
        // Increased the debris count for a more impactful explosion.
        const debrisCount = Phaser.Math.Between(6, 10);
        const partKeys = this.getIntelligentPartKeys(enemyTextureKey);

        for (let i = 0; i < debrisCount; i++) {
            const randomPartKey = Phaser.Math.RND.pick(partKeys);
            const debris = this.debrisGroup.create(
                x,
                y,
                randomPartKey,
            ) as Phaser.Physics.Arcade.Sprite;

            // Ensure the body exists before manipulating it.
            if (!debris.body) continue;

            debris.setScale(Phaser.Math.FloatBetween(0.5, 1.0));

            // Give each piece a random outward velocity.
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.FloatBetween(200, 400);
            this.scene.physics.velocityFromRotation(angle, speed, debris.body.velocity);

            // Give it a random spin.
            debris.setAngularVelocity(Phaser.Math.Between(-300, 300));
            // Make debris ignore gravity, in case we ever add it globally.
            (debris.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

            // Use a tween to fade out and destroy the debris after a short time.
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

    // This is the "intelligent" part. It selects appropriate debris based on the enemy's texture.
    private getIntelligentPartKeys(enemyTextureKey: string): string[] {
        // The key for our meteor is 'enemy-big'.
        if (enemyTextureKey === 'enemy-big') {
            // If it's a meteor, use tiny meteor parts.
            return ['meteor-tiny-1', 'meteor-tiny-2'];
        } else if (enemyTextureKey === 'enemy-medium') {
            // If it's a red ship, use red parts.
            return ['part-wing-red', 'part-cockpit-red'];
        } else {
            // Default to generic parts for any other enemy type (like the player).
            return ['part-generic-1', 'part-generic-2', 'part-generic-3'];
        }
    }
}
