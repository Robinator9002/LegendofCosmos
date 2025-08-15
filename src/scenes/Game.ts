import { Scene, GameObjects } from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Laser } from '../objects/Laser';
import { ExplosionManager } from '../effects/ExplosionManager';
import { ParallaxBackground } from '../effects/ParallaxBackground';
import { BloomPipeline } from '../effects/BloomPipeline';
import { AsteroidPipeline } from '../effects/AsteroidPipeline';
import { VignettePipeline } from '../effects/VignettePipeline';
import { gameData } from '../data'; // Import the new master game data object

/**
 * @class Game
 * @description The main game scene, now fully configured from a central data file.
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
        const sceneConfig = gameData.scenes.game;

        // --- DATA-DRIVEN BACKGROUND ---
        this.parallaxBackground = new ParallaxBackground(this);
        sceneConfig.backgroundLayers.forEach((layer) => {
            this.parallaxBackground.addTileSpriteLayer(layer);
        });

        // --- DATA-DRIVEN POST-PROCESSING ---
        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        const pipelines: string[] = [];
        if (renderer.pipelines) {
            if (sceneConfig.effects?.bloom) {
                renderer.pipelines.addPostPipeline('Bloom', BloomPipeline);
                const bloom = renderer.pipelines.get('Bloom') as BloomPipeline;
                bloom.intensity = sceneConfig.effects.bloom.intensity;
                bloom.strength = sceneConfig.effects.bloom.strength;
                pipelines.push('Bloom');
            }
            if (!renderer.pipelines.get('Asteroid')) {
                renderer.pipelines.add('Asteroid', new AsteroidPipeline(this.game));
            }
            if (sceneConfig.effects?.vignette) {
                renderer.pipelines.addPostPipeline('Vignette', VignettePipeline);
                const vignette = renderer.pipelines.get('Vignette') as VignettePipeline;
                vignette.innerRadius = sceneConfig.effects.vignette.innerRadius;
                vignette.outerRadius = sceneConfig.effects.vignette.outerRadius;
                pipelines.push('Vignette');
            }
            this.cameras.main.setPostPipeline(pipelines);
        }

        // --- Game Object Managers and Groups ---
        this.explosionManager = new ExplosionManager(this);
        this.playerLasers = this.physics.add.group({ classType: Laser, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // --- DATA-DRIVEN PLAYER ---
        this.player = new Player(
            this,
            this.scale.width / 2,
            this.scale.height - 100,
            this.playerLasers,
        );

        // --- DATA-DRIVEN ENEMY SPAWNING ---
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
        const enemyData = Phaser.Math.RND.pick(gameData.enemies);
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const enemy = new Enemy(this, x, -50, enemyData);
        this.enemies.add(enemy, true);
    }

    private playerHitEnemy(playerObject: any, enemyObject: any) {
        const player = playerObject as Player;
        const enemy = enemyObject as Enemy;

        // --- FIX: Pass the correct data object to the explosion manager ---
        this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.enemyData.deathDebris);
        this.explosionManager.createExplosion(player.x, player.y, gameData.player.deathDebris);
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
            this.score += enemy.getData('scoreValue') as number;
            this.scoreText.setText('Score: ' + this.score);
            this.cameras.main.shake(100, 0.005);
            // --- FIX: Pass the correct data object to the explosion manager ---
            this.explosionManager.createExplosion(enemy.x, enemy.y, enemy.enemyData.deathDebris);
        } else {
            enemy.setTint(0xff0000);
            this.time.delayedCall(50, () => {
                enemy.setTint(0xaaaaaa);
            });
            enemy.handleHit(this.explosionManager);
        }
    }
}
