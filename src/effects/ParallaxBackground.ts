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
 * It now supports tinting, random texture offsets, and blend modes for maximum visual effect.
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
     * @param {number} [config.tint=0xffffff] - The color tint of the layer.
     * @param {Phaser.BlendModes | string} [config.blendMode='NORMAL'] - The blend mode to use for the layer. 'ADD' is key for brightness.
     */
    public addTileSpriteLayer(config: {
        textureKey: string;
        scrollSpeed: number;
        alpha?: number;
        tint?: number;
        blendMode?: Phaser.BlendModes | string; // Allow blend mode to be specified
    }): void {
        const { width, height } = this.scene.scale;

        // Use provided configuration values or set sensible defaults.
        const alpha = config.alpha ?? 1;
        const tint = config.tint ?? 0xffffff;
        const blendMode = config.blendMode ?? 'NORMAL'; // Default to 'NORMAL' blend mode.

        const tileSprite = this.scene.add
            .tileSprite(0, 0, width, height, config.textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(alpha)
            .setTint(tint)
            .setBlendMode(blendMode); // Apply the specified blend mode.

        // Set a random starting position for the tile sprite's texture to break up uniformity.
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
            layer.sprite.tilePositionY += layer.scrollSpeed;
        }
    }
}
