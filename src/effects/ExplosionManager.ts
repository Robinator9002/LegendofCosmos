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
        // This is more efficient than creating and destroying individual physics bodies repeatedly.
        this.debrisGroup = this.scene.physics.add.group();
    }

    // This is the main public method to create a full explosion effect.
    public createExplosion(x: number, y: number, enemyTextureKey: string): void {
        this.createCoreFlash(x, y);
        this.createDebris(x, y, enemyTextureKey);
        this.createSmokeCloud(x, y);

        // Play the sound effect from here to keep all explosion logic together.
        this.scene.sound.play('explosion-sound', { volume: 0.4 });
    }

    // Creates the initial bright flash of the explosion.
    private createCoreFlash(x: number, y: number): void {
        const flash = this.scene.add.circle(x, y, 5, 0xffffff, 1);

        // Use the scene's tween manager to animate the flash.
        // A tween is a lightweight way to animate an object's properties.
        this.scene.tweens.add({
            targets: flash,
            radius: { from: 10, to: 50 },
            alpha: { from: 1, to: 0 },
            duration: 150, // ms
            onComplete: () => {
                flash.destroy(); // Clean up the circle when the tween is done.
            },
        });
    }

    // Creates the shattering debris effect.
    private createDebris(x: number, y: number, enemyTextureKey: string): void {
        const debrisCount = Phaser.Math.Between(4, 8);
        const partKeys = this.getIntelligentPartKeys(enemyTextureKey);

        for (let i = 0; i < debrisCount; i++) {
            const randomPartKey = Phaser.Math.RND.pick(partKeys);
            const debris = this.debrisGroup.create(
                x,
                y,
                randomPartKey,
            ) as Phaser.Physics.Arcade.Sprite;

            debris.setScale(Phaser.Math.FloatBetween(0.3, 0.6));

            // Give each piece a random outward velocity.
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.FloatBetween(150, 300);
            if (debris.body) {
                this.scene.physics.velocityFromRotation(angle, speed, debris.body.velocity);
            }

            // Give it a random spin.
            debris.setAngularVelocity(Phaser.Math.Between(-200, 200));

            // Use a tween to fade out and destroy the debris after a short time.
            this.scene.tweens.add({
                targets: debris,
                alpha: 0,
                duration: 800,
                delay: 200,
                onComplete: () => {
                    debris.destroy();
                },
            });
        }
    }

    // Creates the lingering smoke cloud.
    private createSmokeCloud(x: number, y: number): void {
        const smoke = this.scene.add.sprite(x, y, 'fire0').setAlpha(0.6).setScale(0.5);

        this.scene.tweens.add({
            targets: smoke,
            scale: { from: 0.5, to: 1.5 },
            alpha: { from: 0.6, to: 0 },
            duration: 1200,
            onComplete: () => {
                smoke.destroy();
            },
        });
    }

    // This is the "intelligent" part. It selects appropriate debris based on the enemy's texture.
    private getIntelligentPartKeys(enemyTextureKey: string): string[] {
        if (enemyTextureKey.includes('enemyRed')) {
            // If it's a red ship, use red parts.
            return ['part-wing-red', 'part-cockpit-red'];
        } else if (enemyTextureKey.includes('meteor')) {
            // If it's a meteor, use generic metal parts.
            return ['part-generic-1', 'part-generic-2', 'part-generic-3'];
        } else {
            // Default to generic parts for any other enemy type.
            return ['part-generic-1', 'part-generic-2', 'part-generic-3'];
        }
    }
}
