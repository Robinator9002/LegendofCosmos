import { Scene, GameObjects } from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Laser } from '../objects/Laser';
import { ExplosionManager } from '../effects/ExplosionManager';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';
import { EnemyTypes } from '../data/EnemyTypes';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { VignettePipeline } from '../effects/VignettePipeline';

/**
 * @class Game
 * @description The main game scene, now with all polish effects integrated.
 */
export class Game extends Scene {
    private parallaxBackground: ParallaxBackground;
    private player: Player;
    private enemies: Phaser.Physics.Arcade.Group;
    private playerLasers: Phaser.Physics.Arcade.Group;
    private explosionManager: ExplosionManager;
    private score: number;
    private scoreText: GameObjects.Text;

    constructor() {
        super('Game');
    }

    create() {
        // --- Background ---
        this.parallaxBackground = new ParallaxBackground(this);
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.1,
            tint: 0x444444,
            blendMode: 'NORMAL',
            rotation: 0.2,
        });
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.4,
            tint: 0xbbbbbb,
            blendMode: 'ADD',
            rotation: -0.5,
        });
        this.parallaxBackground.addTileSpriteLayer({
            textureKey: 'stars-background-contrast',
            scrollSpeed: -0.7,
            tint: 0xffffff,
            blendMode: 'ADD',
            rotation: 1.1,
        });

        // --- Post-Processing Effects ---
        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        if (renderer.pipelines) {
            if (!renderer.pipelines.get('Bloom')) {
                renderer.pipelines.addPostPipeline('Bloom', BloomPipeline);
            }
            if (!renderer.pipelines.get('Asteroid')) {
                renderer.pipelines.add('Asteroid', new AsteroidPipeline(this.game));
            }
            if (!renderer.pipelines.get('Vignette')) {
                renderer.pipelines.addPostPipeline('Vignette', VignettePipeline);
            }
            this.cameras.main.setPostPipeline(['Bloom', 'Vignette']);
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

        // --- Enemy Spawning ---
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
    }

    update() {
        if (!this.player || !this.player.active) {
            return;
        }
        this.parallaxBackground.update();
        // The player's preUpdate is now called automatically by the scene,
        // so we don't need to call player.update() here anymore.
        this.handleCleanup();
    }

    private handleCleanup() {
        this.playerLasers.getChildren().forEach((laser) => {
            if ((laser as Laser).y < -50) laser.destroy();
        });
        this.enemies.getChildren().forEach((enemy) => {
            if ((enemy as Enemy).y > this.scale.height + 50) enemy.destroy();
        });
    }

    private spawnEnemy() {
        const enemyData = Phaser.Math.RND.pick(EnemyTypes);
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const enemy = new Enemy(this, x, -50, enemyData);
        this.enemies.add(enemy, true);
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

        this.explosionManager.createImpactEffect(laser.x, laser.y);
        laser.destroy();
        enemy.takeDamage(1);

        if (!enemy.active) {
            // --- DEATH LOGIC ---
            this.score += enemy.getData('scoreValue') as number;
            this.scoreText.setText('Score: ' + this.score);
            this.cameras.main.shake(100, 0.005);
            this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.texture.key);
        } else {
            // --- HIT LOGIC ---
            // Flash the enemy red to show damage.
            enemy.setTint(0xff0000);
            this.time.delayedCall(50, () => {
                enemy.setTint(0xaaaaaa);
            });

            // --- FINAL FIX ---
            // This is the crucial connection. We call the enemy's new handleHit method,
            // passing it a reference to the explosion manager. This triggers the shake
            // and the small explosion, making the hit feel mighty.
            enemy.handleHit(this.explosionManager);
        }
    }
}
