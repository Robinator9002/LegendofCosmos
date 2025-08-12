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

    // A public method to add a new layer to the background.
    // It now includes an optional 'alpha' parameter for transparency.
    public addLayer(textureKey: string, scrollSpeed: number, alpha: number = 1): void {
        const { width, height } = this.scene.scale;

        const tileSprite = this.scene.add
            .tileSprite(0, 0, width, height, textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(alpha); // Set the layer's transparency.

        this.layers.push({
            sprite: tileSprite,
            scrollSpeed: scrollSpeed,
        });
    }

    // The update method should be called from the main Game scene's update loop.
    public update(): void {
        for (const layer of this.layers) {
            // To make the background scroll down (making the ship appear to fly up),
            // we increment the tilePositionY. This was correct before.
            // The issue was the lack of transparency between layers.
            layer.sprite.tilePositionY += layer.scrollSpeed;
        }
    }
}
