import { Scene, GameObjects } from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Laser } from '../objects/Laser';
import { ExplosionManager } from '../effects/ExplosionManager';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';
import { EngineTrail } from '../effects/EngineTrail';
import { EnemyTypes } from '../data/EnemyTypes'; // Import our new enemy database

// The main Game scene, where all the action happens.
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
        this.parallaxBackground = new ParallaxBackground(this);
        this.parallaxBackground.addLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: 0.25,
        });
        this.parallaxBackground.addLayer({
            textureKey: 'nebula-background',
            scrollSpeed: 0.5,
            alpha: 0.6,
        });

        // --- Post-Processing Effects ---
        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        if (renderer.pipelines) {
            renderer.pipelines.addPostPipeline('Bloom', BloomPipeline);
            this.cameras.main.setPostPipeline('Bloom');
            this.bloomPipeline = this.cameras.main.getPostPipeline('Bloom') as BloomPipeline;
        }

        // --- Effects ---
        this.explosionManager = new ExplosionManager(this);

        // --- Physics Groups ---
        this.playerLasers = this.physics.add.group({ classType: Laser, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // --- Player ---
        this.player = new Player(
            this,
            this.scale.width / 2,
            this.scale.height - 100,
            this.playerLasers,
        );
        // Create the engine trail as a local constant. This fixes the "unused variable" warning.
        const engineTrail = new EngineTrail(this, this.player);

        // --- Spawning Enemies ---
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        // --- Collisions ---
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
            return;
        }
        this.parallaxBackground.update();
        this.player.update();
        this.handleCleanup();
        this.handleDebugInput();
    }

    private handleCleanup() {
        this.playerLasers.getChildren().forEach((laser) => {
            if ((laser as Laser).y < -50) laser.destroy();
        });
        this.enemies.getChildren().forEach((enemy) => {
            if ((enemy as Enemy).y > this.scale.height + 50) enemy.destroy();
        });
    }

    // --- DATA-DRIVEN SPAWN LOGIC ---
    private spawnEnemy() {
        // 1. Pick a random enemy type from our new data array.
        const enemyData = Phaser.Math.RND.pick(EnemyTypes);
        const x = Phaser.Math.Between(50, this.scale.width - 50);

        // 2. Create a new Enemy instance, passing the full data object to the constructor.
        const enemy = new Enemy(this, x, -50, enemyData);

        // 3. Add the enemy to the physics group.
        this.enemies.add(enemy, true);

        // 4. Call the initialize method, passing the data again to set physics properties.
        enemy.initialize(enemyData);
    }

    private playerHitEnemy(playerObject: any, enemyObject: any) {
        const player = playerObject as Player;
        const enemy = enemyObject as Enemy;

        this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.texture.key);
        this.explosionManager.createExplosion(player.x, player.y, 'player');

        this.cameras.main.shake(500, 0.01);
        this.sound.play('gameover-sound');

        player.destroy();

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver', { score: this.score });
        });
    }

    private laserHitEnemy(laserObject: any, enemyObject: any) {
        const laser = laserObject as Laser;
        const enemy = enemyObject as Enemy;

        laser.destroy();
        enemy.takeDamage(1);

        if (!enemy.active) {
            this.score += enemy.getData('scoreValue') as number;
            this.scoreText.setText('Score: ' + this.score);
            this.cameras.main.shake(100, 0.005);
            this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.texture.key);
        } else {
            enemy.setTint(0xff0000);
            this.time.delayedCall(50, () => {
                enemy.clearTint();
            });
        }
    }

    private handleDebugInput() {
        if (!this.bloomPipeline || !this.keyI) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyI)) {
            this.bloomPipeline.intensity += 0.1;
            console.log(`Bloom Intensity: ${this.bloomPipeline.intensity.toFixed(2)}`);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyO)) {
            this.bloomPipeline.intensity -= 0.1;
            console.log(`Bloom Intensity: ${this.bloomPipeline.intensity.toFixed(2)}`);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyK)) {
            this.bloomPipeline.strength += 0.1;
            console.log(`Bloom Strength: ${this.bloomPipeline.strength.toFixed(2)}`);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyL)) {
            this.bloomPipeline.strength -= 0.1;
            console.log(`Bloom Strength: ${this.bloomPipeline.strength.toFixed(2)}`);
        }
    }
}
