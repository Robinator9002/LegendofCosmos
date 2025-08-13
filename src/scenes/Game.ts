import { Scene, GameObjects } from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Laser } from '../objects/Laser';
import { ExplosionManager } from '../effects/ExplosionManager';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';
import { EnemyTypes } from '../data/EnemyTypes';
import { EngineTrail } from '../effects/EngineTrail';

/**
 * @class Game
 * @description The main game scene where all the action happens. It manages the player,
 * enemies, scoring, and all core gameplay mechanics.
 */
export class Game extends Scene {
    // --- Scene Properties ---
    private parallaxBackground: ParallaxBackground;
    private player: Player;
    private enemies: Phaser.Physics.Arcade.Group;
    private playerLasers: Phaser.Physics.Arcade.Group;
    private explosionManager: ExplosionManager;
    private score: number;
    private scoreText: GameObjects.Text;

    // --- Debug and Tuning Properties ---
    private bloomPipeline: BloomPipeline;
    private keyI: Phaser.Input.Keyboard.Key;
    private keyO: Phaser.Input.Keyboard.Key;
    private keyK: Phaser.Input.Keyboard.Key;
    private keyL: Phaser.Input.Keyboard.Key;

    constructor() {
        super('Game');
    }

    create() {
        // --- Background ---
        // Instantiate the ParallaxBackground class to build our dynamic background.
        this.parallaxBackground = new ParallaxBackground(this);

        // --- REVISED Background Layer Composition for Optical Illusion ---
        // To achieve the desired effect, we invert the common logic.
        // The layer drawn first (at the back) will be fast and opaque, perceived as the foreground.
        // The layer drawn last (on top) will be slow and transparent, perceived as the distant background.

        // Layer 1 (Drawn First -> Perceived as FOREGROUND): Fast, Opaque.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.7, // Negative value to scroll DOWN, fast speed.
            alpha: 1.0, // Fully opaque.
        });

        // Layer 2 (Middle Layer): Medium speed and opacity.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.4, // Negative value, medium speed.
            alpha: 0.6,
        });

        // Layer 3 (Drawn Last -> Perceived as BACKGROUND): Slow, Transparent.
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.2, // Negative value, slow speed.
            alpha: 0.3, // Very transparent.
        });

        // --- Post-Processing Effects ---
        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        if (renderer.pipelines) {
            // This check ensures we only try to add pipelines in WebGL mode.
            renderer.pipelines.addPostPipeline('Bloom', BloomPipeline);
            this.cameras.main.setPostPipeline('Bloom');
            this.bloomPipeline = this.cameras.main.getPostPipeline('Bloom') as BloomPipeline;
        }

        // --- Game Object Managers and Groups ---
        this.explosionManager = new ExplosionManager(this);
        this.playerLasers = this.physics.add.group({ classType: Laser, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // --- Player ---
        this.player = new Player(
            this,
            this.scale.width / 2,
            this.scale.height - 100,
            this.playerLasers,
        );
        // The EngineTrail is self-managing; it just needs to be created.
        new EngineTrail(this, this.player);

        // --- Enemy Spawning ---
        // A recurring timer event to spawn enemies at regular intervals.
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        // --- Physics Collisions ---
        this.physics.add.overlap(
            this.playerLasers,
            this.enemies,
            this.laserHitEnemy,
            undefined,
            this,
        );
        this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this);

        // --- UI ---
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFF',
            stroke: '#000',
            strokeThickness: 4,
        });

        // --- Debug Controls for Bloom ---
        if (this.input.keyboard) {
            this.keyI = this.input.keyboard.addKey('I');
            this.keyO = this.input.keyboard.addKey('O');
            this.keyK = this.input.keyboard.addKey('K');
            this.keyL = this.input.keyboard.addKey('L');
        }
    }

    update() {
        if (!this.player || !this.player.active) {
            // If the player is destroyed, we stop the update loop for gameplay objects.
            return;
        }
        // The background must be updated every frame to scroll.
        this.parallaxBackground.update();
        this.player.update();
        this.handleCleanup();
        this.handleDebugInput();
    }

    /**
     * @method handleCleanup
     * @description Periodically removes off-screen game objects to prevent memory leaks.
     */
    private handleCleanup() {
        // Clean up lasers that have flown off the top of the screen.
        this.playerLasers.getChildren().forEach((laser) => {
            if ((laser as Laser).y < -50) laser.destroy();
        });
        // Clean up enemies that have flown off the bottom of the screen.
        this.enemies.getChildren().forEach((enemy) => {
            if ((enemy as Enemy).y > this.scale.height + 50) enemy.destroy();
        });
    }

    /**
     * @method spawnEnemy
     * @description Spawns a new enemy at a random location based on the data in EnemyTypes.
     */
    private spawnEnemy() {
        const enemyData = Phaser.Math.RND.pick(EnemyTypes);
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const enemy = new Enemy(this, x, -50, enemyData);
        this.enemies.add(enemy, true);
        enemy.initialize(enemyData);
    }

    /**
     * @method playerHitEnemy
     * @description Callback for when the player collides with an enemy.
     */
    private playerHitEnemy(playerObject: any, enemyObject: any) {
        const player = playerObject as Player;
        const enemy = enemyObject as Enemy;

        // Create explosions for both the player and the enemy.
        this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.texture.key);
        this.explosionManager.createExplosion(player.x, player.y, 'player');

        this.cameras.main.shake(500, 0.01);
        this.sound.play('gameover-sound');

        player.destroy();

        // Transition to the GameOver scene after a short delay.
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver', { score: this.score });
        });
    }

    /**
     * @method laserHitEnemy
     * @description Callback for when a player's laser hits an enemy.
     */
    private laserHitEnemy(laserObject: any, enemyObject: any) {
        const laser = laserObject as Laser;
        const enemy = enemyObject as Enemy;

        laser.destroy();
        enemy.takeDamage(1);

        if (!enemy.active) {
            // If the enemy is destroyed...
            this.score += enemy.getData('scoreValue') as number;
            this.scoreText.setText('Score: ' + this.score);
            this.cameras.main.shake(100, 0.005);
            this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.texture.key);
        } else {
            // If the enemy is damaged but survives, make it flash red.
            enemy.setTint(0xff0000);
            this.time.delayedCall(50, () => {
                // IMPORTANT: We set the tint back to our dimmed color, not clear it.
                enemy.setTint(0xcccccc);
            });
        }
    }

    /**
     * @method handleDebugInput
     * @description Handles keyboard input for real-time tuning of debug variables (like bloom).
     */
    private handleDebugInput() {
        if (!this.bloomPipeline || !this.keyI) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyI)) {
            this.bloomPipeline.intensity += 0.1;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyO)) {
            this.bloomPipeline.intensity -= 0.1;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyK)) {
            this.bloomPipeline.strength += 0.1;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyL)) {
            this.bloomPipeline.strength -= 0.1;
        }
    }
}
