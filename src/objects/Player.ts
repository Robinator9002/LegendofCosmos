import Phaser from 'phaser';
import { Laser } from './Laser';

// The Player class represents the user's controllable spaceship.
// It extends Phaser.Physics.Arcade.Sprite to give it a physics body.
export class Player extends Phaser.Physics.Arcade.Sprite {
    // --- Class Properties ---

    // Movement and combat stats for the player.
    private moveSpeed: number = 400;
    private lastFired: number = 0;
    private fireRate: number = 250; // Milliseconds between shots

    // References to keyboard input keys.
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private fireKey: Phaser.Input.Keyboard.Key;

    // A reference to the physics group that will contain the player's lasers.
    // This is passed in from the Game scene to avoid tightly coupled code.
    private lasers: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, x: number, y: number, lasers: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, 'player');

        // Add this Player object to the scene's display list and physics world.
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Store the reference to the laser group.
        this.lasers = lasers;

        // Set visual and physical properties.
        this.setScale(0.75);
        this.setCollideWorldBounds(true);

        // --- Input Setup ---
        // We use the non-null assertion operator '!' because we know the keyboard manager will exist in a Phaser scene.
        // This satisfies TypeScript's strict null checks.
        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.fireKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // The update method is called every frame.
    update() {
        // This method now only delegates to the specific handler methods.
        this.handleMovement();
        this.handleShooting();
    }

    private handleMovement() {
        // This safety check (or "type guard") ensures the body exists before we try to use it.
        // The body is added by the physics system shortly after the sprite is created.
        // This resolves the "Object is possibly 'null'" error.
        if (!this.body) {
            return;
        }

        // Reset velocity to 0 to stop movement when no keys are pressed.
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (this.cursors.left.isDown) {
            this.body.velocity.x = -this.moveSpeed;
        } else if (this.cursors.right.isDown) {
            this.body.velocity.x = this.moveSpeed;
        }

        if (this.cursors.up.isDown) {
            this.body.velocity.y = -this.moveSpeed;
        } else if (this.cursors.down.isDown) {
            this.body.velocity.y = this.moveSpeed;
        }
    }

    private handleShooting() {
        // Check if the fire key is down and the fire rate cooldown has passed.
        if (this.fireKey.isDown && this.scene.time.now > this.lastFired) {
            // Create a new laser instance.
            const laser = new Laser(this.scene, this.x, this.y - 50);

            // Add the laser to the physics group provided in the constructor.
            // This is the correct way to manage game objects.
            this.lasers.add(laser, true);

            // Update the lastFired timestamp to implement the fire rate.
            this.lastFired = this.scene.time.now + this.fireRate;

            // Play a sound effect for shooting.
            this.scene.sound.play('laser-sound', { volume: 0.3 });
        }
    }
}
