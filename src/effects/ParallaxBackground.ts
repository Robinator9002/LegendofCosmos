import { Scene, GameObjects } from 'phaser';

// This interface defines the structure for a single layer in our parallax background.
interface IParallaxLayer {
    sprite: GameObjects.TileSprite;
    scrollSpeed: number;
}

// This class manages the creation and updating of a multi-layered parallax background.
export class ParallaxBackground {
    private scene: Scene;
    private layers: IParallaxLayer[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // The method to add a layer is now more powerful.
    // It accepts optional alpha (transparency) and y (vertical offset) parameters.
    public addLayer(config: {
        textureKey: string;
        scrollSpeed: number;
        alpha?: number;
        y?: number;
    }): void {
        const { width, height } = this.scene.scale;

        // Use provided values or set sensible defaults.
        const yPos = config.y || 0;
        const alpha = config.alpha || 1;

        const tileSprite = this.scene.add
            .tileSprite(0, yPos, width, height, config.textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(alpha);

        this.layers.push({
            sprite: tileSprite,
            scrollSpeed: config.scrollSpeed,
        });
    }

    // The update method scrolls each layer according to its speed.
    public update(): void {
        for (const layer of this.layers) {
            // To make the background scroll "down" the screen, we INCREASE the tilePositionY.
            // This gives the illusion that the player is flying "up".
            layer.sprite.tilePositionY += layer.scrollSpeed;
        }
    }
}
