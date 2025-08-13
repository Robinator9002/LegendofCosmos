import { Scene, GameObjects, Math as pMath } from 'phaser';

/**
 * @interface ITileSpriteLayer
 * @description Defines the structure for a classic, continuous scrolling texture layer.
 */
interface ITileSpriteLayer {
    sprite: GameObjects.TileSprite;
    scrollSpeed: number;
}

/**
 * @class ParallaxBackground
 * @description Manages the creation and updating of a sophisticated, multi-layered parallax background.
 * It now supports tinting and random texture offsets to create a more realistic and visually appealing effect.
 */
export class ParallaxBackground {
    private scene: Scene;
    private layers: ITileSpriteLayer[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * @method addTileSpriteLayer
     * @description Adds a continuous, scrolling texture layer to the background.
     * @param {object} config - The configuration object for the layer.
     * @param {string} config.textureKey - The key of the texture asset to use.
     * @param {number} config.scrollSpeed - The vertical speed of the layer. Use negative for down, positive for up.
     * @param {number} [config.alpha=1] - The transparency of the layer.
     * @param {number} [config.tint=0xffffff] - The color tint of the layer. Used to control brightness for depth.
     */
    public addTileSpriteLayer(config: {
        textureKey: string;
        scrollSpeed: number;
        alpha?: number;
        tint?: number;
    }): void {
        const { width, height } = this.scene.scale;

        // Use provided configuration values or set sensible defaults.
        const alpha = config.alpha ?? 1;
        const tint = config.tint ?? 0xffffff; // Default to no tint (full brightness).

        const tileSprite = this.scene.add
            .tileSprite(0, 0, width, height, config.textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(alpha)
            .setTint(tint); // Apply the specified tint.

        // --- SOLVE THE UNIFORMITY PROBLEM ---
        // By setting a random starting position for the tile sprite's texture,
        // we ensure that no two layers will have their star patterns perfectly aligned.
        // This breaks the unnatural "stacked posters" look.
        const texture = this.scene.textures.get(config.textureKey).getSourceImage();
        tileSprite.tilePositionX = pMath.Between(0, texture.width);
        tileSprite.tilePositionY = pMath.Between(0, texture.height);

        this.layers.push({
            sprite: tileSprite,
            scrollSpeed: config.scrollSpeed,
        });
    }

    /**
     * @method update
     * @description This method is called every frame from the scene's update loop. It handles the movement of all layers.
     */
    public update(): void {
        for (const layer of this.layers) {
            // Using a negative scrollSpeed will move the tilePositionY downwards.
            layer.sprite.tilePositionY += layer.scrollSpeed;
        }
    }
}
