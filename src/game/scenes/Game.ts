import { Scene, GameObjects } from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Laser } from '../objects/Laser';
import { ExplosionManager } from '../../effects/ExplosionManager';

// The main Game scene, where all the action happens.
export class Game extends Scene {
    // --- Scene Properties ---
    private background: GameObjects.TileSprite;
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
        this.background = this.add
            .tileSprite(0, 0, this.scale.width, this.scale.height, 'scrolling-background')
            .setOrigin(0, 0);

        // --- Effects ---
        // An instance of our new manager is created, passing it this scene.
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
        });
    }

    update() {
        this.background.tilePositionY -= 0.5;
        this.player.update();

        // --- Cleanup ---
        this.playerLasers.getChildren().forEach((laserObject: GameObjects.GameObject) => {
            const laser = laserObject as Laser;
            if (laser.y < -50) {
                laser.destroy();
            }
        });

        this.enemies.getChildren().forEach((enemyObject: GameObjects.GameObject) => {
            const enemy = enemyObject as Enemy;
            if (enemy.y > this.scale.height + 50) {
                enemy.destroy();
            }
        });
    }

    private spawnEnemy() {
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const enemyType = Phaser.Math.RND.pick(['enemy-medium', 'enemy-big']);
        const enemy = new Enemy(this, x, -50, enemyType);
        this.enemies.add(enemy, true);
        enemy.initialize();
    }

    private laserHitEnemy(laserObject: any, enemyObject: any) {
        if (laserObject instanceof Laser && enemyObject instanceof Enemy) {
            const enemyTextureKey = enemyObject.texture.key;
            laserObject.destroy();
            enemyObject.takeDamage(1);

            if (!enemyObject.active) {
                this.score += enemyObject.getData('scoreValue') as number;
                this.scoreText.setText('Score: ' + this.score);
                // The old animation call is replaced with our new manager.
                this.explosionManager.createExplosion(
                    enemyObject.x,
                    enemyObject.y,
                    enemyTextureKey,
                );
            }
        }
    }

    private playerHitEnemy(playerObject: any, enemyObject: any) {
        if (playerObject instanceof Player && enemyObject instanceof Enemy) {
            const enemyTextureKey = enemyObject.texture.key;
            // The enemy is destroyed immediately upon collision.
            enemyObject.destroy();

            // Create an explosion for the enemy that was hit.
            this.explosionManager.createExplosion(enemyObject.x, enemyObject.y, enemyTextureKey);

            // Create a larger explosion for the player.
            this.explosionManager.createExplosion(playerObject.x, playerObject.y, 'player');

            this.cameras.main.shake(500, 0.01);
            this.sound.play('gameover-sound');
            // this.sound.stopByKey('music'); // Music is already disabled

            playerObject.disableBody(true, true);

            this.time.delayedCall(500, () => {
                this.scene.start('GameOver', { score: this.score });
            });
        }
    }
}
