import { Scene, GameObjects, Math as pMath } from 'phaser';

// --- TYPE DEFINITIONS FOR CLARITY ---
// By defining the structure of our layers with interfaces, we make the code
// easier to understand and less prone to errors.

/**
 * @interface ITileSpriteLayer
 * @description Defines the structure for a classic, continuous scrolling texture layer.
 * These are ideal for nebula clouds or distant, uniform patterns that should repeat seamlessly.
 */
interface ITileSpriteLayer {
    sprite: GameObjects.TileSprite;
    scrollSpeed: number;
}

/**
 * @interface IParticleLayer
 * @description Defines the structure for a dynamic layer composed of many individual sprites.
 * This is used to create realistic and deep starfields where each star is unique.
 */
interface IParticleLayer {
    group: GameObjects.Group;
    scrollSpeed: number;
}

/**
 * @class ParallaxBackground
 * @description Manages the creation and updating of a sophisticated, multi-layered parallax background.
 * It supports both continuous TileSprite layers and dynamic particle-based layers to create a rich sense of depth.
 */
export class ParallaxBackground {
    private scene: Scene;
    private tileSpriteLayers: ITileSpriteLayer[] = [];
    private particleLayers: IParticleLayer[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * @method addTileSpriteLayer
     * @description Adds a continuous, scrolling texture layer to the background.
     * @param {object} config - The configuration object for the layer.
     * @param {string} config.textureKey - The key of the texture asset to use.
     * @param {number} config.scrollSpeed - The vertical speed of the layer. Positive values scroll down.
     * @param {number} [config.alpha=1] - The transparency of the layer.
     * @param {number} [config.y=0] - The initial vertical offset of the layer.
     */
    public addTileSpriteLayer(config: {
        textureKey: string;
        scrollSpeed: number;
        alpha?: number;
        y?: number;
    }): void {
        const { width, height } = this.scene.scale;

        // Use provided configuration values or set sensible defaults.
        const yPos = config.y || 0;
        const alpha = config.alpha || 1;

        const tileSprite = this.scene.add
            .tileSprite(0, yPos, width, height, config.textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0) // Ensures the background isn't affected by camera movement.
            .setAlpha(alpha);

        this.tileSpriteLayers.push({
            sprite: tileSprite,
            scrollSpeed: config.scrollSpeed,
        });
    }

    /**
     * @method addParticleLayer
     * @description Adds a dynamic layer of individual, randomly placed sprites.
     * @param {object} config - The configuration object for the layer.
     * @param {string} config.textureKey - The texture key for the individual particles (stars).
     * @param {number} config.scrollSpeed - The vertical speed of the particles.
     * @param {number} config.count - The number of particles to create in this layer.
     * @param {number} [config.minScale=1] - The minimum scale of a particle.
     * @param {number} [config.maxScale=1] - The maximum scale of a particle.
     * @param {number} [config.minAlpha=1] - The minimum transparency of a particle.
     * @param {number} [config.maxAlpha=1] - The maximum transparency of a particle.
     */
    public addParticleLayer(config: {
        textureKey: string;
        scrollSpeed: number;
        count: number;
        minScale?: number;
        maxScale?: number;
        minAlpha?: number;
        maxAlpha?: number;
    }): void {
        const group = this.scene.add.group();

        // Set default values for optional parameters if they are not provided.
        const minScale = config.minScale ?? 1;
        const maxScale = config.maxScale ?? 1;
        const minAlpha = config.minAlpha ?? 1;
        const maxAlpha = config.maxAlpha ?? 1;

        for (let i = 0; i < config.count; i++) {
            // Scatter particles across the entire screen area.
            const x = pMath.Between(0, this.scene.scale.width);
            const y = pMath.Between(0, this.scene.scale.height);

            const sprite = group.create(x, y, config.textureKey) as GameObjects.Sprite;

            // Apply random properties to each particle for a natural, varied look.
            sprite.setAlpha(pMath.FloatBetween(minAlpha, maxAlpha));
            sprite.setScale(pMath.FloatBetween(minScale, maxScale));
            sprite.setRotation(pMath.FloatBetween(0, Math.PI * 2)); // Random initial rotation.
            sprite.setScrollFactor(0);
        }

        this.particleLayers.push({
            group,
            scrollSpeed: config.scrollSpeed,
        });
    }

    /**
     * @method update
     * @description This method is called every frame from the scene's update loop. It handles the movement of all layers.
     */
    public update(): void {
        // --- Update Continuous TileSprite Layers ---
        for (const layer of this.tileSpriteLayers) {
            // Increasing the tilePositionY scrolls the texture downwards, giving the illusion of upward movement.
            layer.sprite.tilePositionY += layer.scrollSpeed;
        }

        // --- Update Dynamic Particle Layers ---
        const { width, height } = this.scene.scale;
        for (const layer of this.particleLayers) {
            for (const sprite of layer.group.getChildren() as GameObjects.Sprite[]) {
                sprite.y += layer.scrollSpeed;

                // --- Particle Wrapping Logic ---
                // When a particle (star) moves off the bottom of the screen, we "wrap" it
                // back to the top at a new random horizontal position. This creates an
                // infinitely scrolling starfield without needing to create new objects.
                const spriteHeight = sprite.displayHeight;
                if (sprite.y > height + spriteHeight / 2) {
                    sprite.y = -spriteHeight / 2; // Move to just above the screen.
                    sprite.x = pMath.Between(0, width); // Pick a new random x-coordinate.
                    sprite.setRotation(pMath.FloatBetween(0, Math.PI * 2)); // Re-randomize rotation for variety.
                }
            }
        }
    }
}
